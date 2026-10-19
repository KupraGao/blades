-- public.create_checkout_order
-- Manual execution in the Supabase SQL Editor.
-- Do NOT auto-run from the app. This file does not change tables, RLS, or data.
--
-- One transaction creates the order, its item snapshots, and the stock
-- decrement. A raised error rolls the whole function call back.
-- Prices, totals, stock, and status are read or set here, never taken from
-- the client. user_id is whatever the server action resolved from the session.
-- Guest checkout passes NULL. EXECUTE is limited to service_role.
--
-- Two overloads share one implementation:
--   9 arguments: current server actions. The wrapper passes a NULL checkout key.
--   10 arguments: p_idempotency_key uuid, with no default, so PostgREST
--   cannot confuse it with the 9-argument call.
-- NULL key keeps the previous insert and does not read or write
-- idempotency_key / idempotency_fingerprint. Existing production calls
-- therefore stay valid before those columns exist.
-- A non-NULL key requires the Phase 1A columns and
-- orders_idempotency_key_uidx.
--
-- p_idempotency_key is the checkout submission identity.
-- It is not the Bank of Georgia Idempotency-Key and it is not
-- payment_provider_order_id. The fingerprint is derived here from
-- normalized fields. The client cannot supply it.
--
-- orders.id and orders.order_number are omitted so their defaults apply:
-- gen_random_uuid() and nextval('orders_order_number_seq').
-- Delivery minimum is 150 GEL and must stay aligned with
-- DELIVERY_MIN_SUBTOTAL_GEL in src/lib/orders/delivery-rules.ts.
-- NULL product stock is unavailable.

BEGIN;

CREATE OR REPLACE FUNCTION public.create_checkout_order(
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_customer_address text,
  p_customer_note text,
  p_fulfillment_method text,
  p_payment_method text,
  p_user_id uuid,
  p_items jsonb,
  p_idempotency_key uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_customer_name text;
  v_customer_phone text;
  v_customer_email text;
  v_customer_address text;
  v_customer_note text;
  item jsonb;
  product_id uuid;
  raw_quantity numeric;
  line_quantity integer;
  combined_quantity bigint;
  quantities jsonb := '{}'::jsonb;
  product_ids uuid[] := ARRAY[]::uuid[];
  ids uuid[] := ARRAY[]::uuid[];
  titles text[] := ARRAY[]::text[];
  unit_prices numeric[] := ARRAY[]::numeric[];
  line_quantities integer[] := ARRAY[]::integer[];
  locked_product record;
  locked_count integer := 0;
  expected_count integer;
  unit_price numeric;
  line_title text;
  subtotal numeric := 0;
  new_order_id uuid;
  updated_count integer;
  v_fingerprint text;
  v_fingerprint_items jsonb;
  v_existing_order_id uuid;
  v_existing_fingerprint text;
BEGIN
  IF p_idempotency_key IS NOT NULL
     AND p_idempotency_key::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN
    RAISE EXCEPTION 'checkout:invalid_idempotency_key' USING ERRCODE = 'P0001';
  END IF;

  IF p_fulfillment_method NOT IN ('delivery', 'pickup') THEN
    RAISE EXCEPTION 'checkout:invalid_fulfillment' USING ERRCODE = 'P0001';
  END IF;

  IF p_payment_method NOT IN ('online', 'pay_at_pickup') THEN
    RAISE EXCEPTION 'checkout:invalid_payment' USING ERRCODE = 'P0001';
  END IF;

  IF p_fulfillment_method = 'delivery' AND p_payment_method <> 'online' THEN
    RAISE EXCEPTION 'checkout:invalid_payment_combination' USING ERRCODE = 'P0001';
  END IF;

  IF p_fulfillment_method = 'pickup'
     AND p_payment_method NOT IN ('online', 'pay_at_pickup') THEN
    RAISE EXCEPTION 'checkout:invalid_payment_combination' USING ERRCODE = 'P0001';
  END IF;

  v_customer_name := btrim(COALESCE(p_customer_name, ''));
  IF v_customer_name = '' THEN
    RAISE EXCEPTION 'checkout:invalid_customer_name_required' USING ERRCODE = 'P0001';
  END IF;
  IF char_length(v_customer_name) < 2 THEN
    RAISE EXCEPTION 'checkout:invalid_customer_name_min' USING ERRCODE = 'P0001';
  END IF;

  v_customer_phone := btrim(COALESCE(p_customer_phone, ''));
  IF v_customer_phone = '' THEN
    RAISE EXCEPTION 'checkout:invalid_phone_required' USING ERRCODE = 'P0001';
  END IF;
  IF char_length(v_customer_phone) < 9 THEN
    RAISE EXCEPTION 'checkout:invalid_phone' USING ERRCODE = 'P0001';
  END IF;

  v_customer_email := NULLIF(btrim(COALESCE(p_customer_email, '')), '');
  IF v_customer_email IS NOT NULL
     AND v_customer_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' THEN
    RAISE EXCEPTION 'checkout:invalid_email' USING ERRCODE = 'P0001';
  END IF;

  IF p_fulfillment_method = 'pickup' THEN
    v_customer_address := NULL;
  ELSE
    v_customer_address := btrim(COALESCE(p_customer_address, ''));
    IF v_customer_address = '' THEN
      RAISE EXCEPTION 'checkout:invalid_address_required' USING ERRCODE = 'P0001';
    END IF;
    IF char_length(v_customer_address) < 5 THEN
      RAISE EXCEPTION 'checkout:invalid_address_min' USING ERRCODE = 'P0001';
    END IF;
  END IF;

  v_customer_note := NULLIF(btrim(COALESCE(p_customer_note, '')), '');

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'checkout:empty_cart' USING ERRCODE = 'P0001';
  END IF;

  FOR item IN
    SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    IF jsonb_typeof(item) <> 'object'
       OR jsonb_typeof(item -> 'product_id') <> 'string'
       OR btrim(item ->> 'product_id') = '' THEN
      RAISE EXCEPTION 'checkout:invalid_product_id' USING ERRCODE = 'P0001';
    END IF;

    BEGIN
      product_id := btrim(item ->> 'product_id')::uuid;
    EXCEPTION
      WHEN invalid_text_representation THEN
        RAISE EXCEPTION 'checkout:invalid_product_id' USING ERRCODE = 'P0001';
    END;

    IF jsonb_typeof(item -> 'quantity') <> 'number' THEN
      RAISE EXCEPTION 'checkout:invalid_quantity' USING ERRCODE = 'P0001';
    END IF;

    raw_quantity := (item ->> 'quantity')::numeric;
    IF raw_quantity IS NULL
       OR raw_quantity <> trunc(raw_quantity)
       OR raw_quantity <= 0
       OR raw_quantity > 2147483647 THEN
      RAISE EXCEPTION 'checkout:invalid_quantity' USING ERRCODE = 'P0001';
    END IF;

    line_quantity := raw_quantity::integer;
    combined_quantity := COALESCE((quantities ->> product_id::text)::bigint, 0) + line_quantity;
    IF combined_quantity > 2147483647 THEN
      RAISE EXCEPTION 'checkout:invalid_quantity' USING ERRCODE = 'P0001';
    END IF;

    quantities := quantities || jsonb_build_object(product_id::text, combined_quantity);
  END LOOP;

  SELECT COALESCE(array_agg(key::uuid ORDER BY key::uuid), ARRAY[]::uuid[])
  INTO product_ids
  FROM jsonb_each(quantities);

  expected_count := COALESCE(array_length(product_ids, 1), 0);

  -- Same checkout key is resolved before any product or stock check.
  -- A committed order is returned even when that stock is later gone.
  -- Prices and stock are not part of the fingerprint: they are server
  -- state at insert time, not the identity of the repeated request.
  IF p_idempotency_key IS NOT NULL THEN
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'product_id', item_key::text,
          'quantity', item_quantity
        )
        ORDER BY item_key
      ),
      '[]'::jsonb
    )
    INTO v_fingerprint_items
    FROM (
      SELECT key::uuid AS item_key,
             (quantities ->> key)::integer AS item_quantity
      FROM jsonb_object_keys(quantities) AS key
    ) normalized_items;

    v_fingerprint := jsonb_build_object(
      'v', 1,
      'customer_name', v_customer_name,
      'customer_phone', v_customer_phone,
      'customer_email', v_customer_email,
      'customer_address', v_customer_address,
      'customer_note', v_customer_note,
      'fulfillment_method', p_fulfillment_method,
      'payment_method', p_payment_method,
      'user_id', p_user_id,
      'items', v_fingerprint_items
    )::text;

    PERFORM pg_advisory_xact_lock(
      hashtext('public.create_checkout_order'),
      hashtext(p_idempotency_key::text)
    );

    SELECT existing_order.id, existing_order.idempotency_fingerprint
    INTO v_existing_order_id, v_existing_fingerprint
    FROM public.orders AS existing_order
    WHERE existing_order.idempotency_key = p_idempotency_key;

    IF FOUND THEN
      IF v_existing_fingerprint IS NOT DISTINCT FROM v_fingerprint THEN
        RETURN jsonb_build_object(
          'success', true,
          'order_id', v_existing_order_id
        );
      END IF;

      RAISE EXCEPTION 'checkout:idempotency_conflict' USING ERRCODE = 'P0001';
    END IF;
  END IF;

  FOR locked_product IN
    SELECT
      p.id,
      btrim(p.title) AS title,
      p.price,
      p.sale_price,
      p.stock
    FROM public.products p
    WHERE p.id = ANY (product_ids)
    ORDER BY p.id
    FOR UPDATE OF p
  LOOP
    line_quantity := (quantities ->> locked_product.id::text)::integer;
    line_title := COALESCE(locked_product.title, '');

    IF line_quantity IS NULL OR line_quantity <= 0 THEN
      RAISE EXCEPTION 'checkout:invalid_quantity' USING ERRCODE = 'P0001';
    END IF;

    IF locked_product.stock IS NULL THEN
      RAISE EXCEPTION '%',
        format('checkout:null_stock|%s', line_title)
        USING ERRCODE = 'P0001';
    END IF;

    IF locked_product.price IS NULL OR locked_product.price < 0 THEN
      RAISE EXCEPTION '%',
        format('checkout:invalid_price|%s', line_title)
        USING ERRCODE = 'P0001';
    END IF;

    IF line_title = '' THEN
      RAISE EXCEPTION 'checkout:empty_title' USING ERRCODE = 'P0001';
    END IF;

    IF locked_product.stock < line_quantity THEN
      RAISE EXCEPTION '%',
        format('checkout:insufficient_stock|%s', line_title)
        USING ERRCODE = 'P0001';
    END IF;

    unit_price := CASE
      WHEN locked_product.sale_price IS NOT NULL
       AND locked_product.sale_price > 0
       AND locked_product.sale_price < locked_product.price
      THEN locked_product.sale_price
      ELSE locked_product.price
    END;

    locked_count := locked_count + 1;
    ids := array_append(ids, locked_product.id);
    titles := array_append(titles, line_title);
    unit_prices := array_append(unit_prices, unit_price);
    line_quantities := array_append(line_quantities, line_quantity);
    subtotal := subtotal + (unit_price * line_quantity);
  END LOOP;

  IF locked_count <> expected_count OR locked_count = 0 THEN
    RAISE EXCEPTION 'checkout:products_not_found' USING ERRCODE = 'P0001';
  END IF;

  IF p_fulfillment_method = 'delivery' AND subtotal < 150 THEN
    RAISE EXCEPTION 'checkout:delivery_minimum' USING ERRCODE = 'P0001';
  END IF;

  IF p_idempotency_key IS NULL THEN
    INSERT INTO public.orders (
      customer_name,
      customer_phone,
      customer_email,
      customer_address,
      customer_note,
      fulfillment_method,
      payment_method,
      payment_status,
      total_price,
      status,
      user_id
    )
    VALUES (
      v_customer_name,
      v_customer_phone,
      v_customer_email,
      v_customer_address,
      v_customer_note,
      p_fulfillment_method,
      p_payment_method,
      'unpaid',
      subtotal,
      'pending',
      p_user_id
    )
    RETURNING id INTO new_order_id;
  ELSE
    BEGIN
      INSERT INTO public.orders (
        customer_name,
        customer_phone,
        customer_email,
        customer_address,
        customer_note,
        fulfillment_method,
        payment_method,
        payment_status,
        total_price,
        status,
        user_id,
        idempotency_key,
        idempotency_fingerprint
      )
      VALUES (
        v_customer_name,
        v_customer_phone,
        v_customer_email,
        v_customer_address,
        v_customer_note,
        p_fulfillment_method,
        p_payment_method,
        'unpaid',
        subtotal,
        'pending',
        p_user_id,
        p_idempotency_key,
        v_fingerprint
      )
      RETURNING id INTO new_order_id;
    EXCEPTION
      WHEN unique_violation THEN
        SELECT existing_order.id, existing_order.idempotency_fingerprint
        INTO v_existing_order_id, v_existing_fingerprint
        FROM public.orders AS existing_order
        WHERE existing_order.idempotency_key = p_idempotency_key;

        IF NOT FOUND THEN
          RAISE;
        END IF;

        IF v_existing_fingerprint IS NOT DISTINCT FROM v_fingerprint THEN
          RETURN jsonb_build_object(
            'success', true,
            'order_id', v_existing_order_id
          );
        END IF;

        RAISE EXCEPTION 'checkout:idempotency_conflict' USING ERRCODE = 'P0001';
    END;
  END IF;

  INSERT INTO public.order_items (
    order_id,
    product_id,
    product_title,
    product_price,
    quantity
  )
  SELECT
    new_order_id,
    snapshot.product_id,
    snapshot.product_title,
    snapshot.product_price,
    snapshot.quantity
  FROM unnest(ids, titles, unit_prices, line_quantities)
    AS snapshot(product_id, product_title, product_price, quantity);

  UPDATE public.products AS product
  SET stock = product.stock - requested.quantity
  FROM unnest(ids, line_quantities) AS requested(product_id, quantity)
  WHERE product.id = requested.product_id
    AND product.stock IS NOT NULL
    AND product.stock >= requested.quantity;

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  IF updated_count <> locked_count THEN
    RAISE EXCEPTION 'checkout:stock_update_failed' USING ERRCODE = 'P0001';
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', new_order_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_checkout_order(
  text, text, text, text, text, text, text, uuid, jsonb, uuid
) FROM PUBLIC;

REVOKE ALL ON FUNCTION public.create_checkout_order(
  text, text, text, text, text, text, text, uuid, jsonb, uuid
) FROM anon, authenticated;

GRANT EXECUTE ON FUNCTION public.create_checkout_order(
  text, text, text, text, text, text, text, uuid, jsonb, uuid
) TO service_role;

COMMENT ON FUNCTION public.create_checkout_order(
  text, text, text, text, text, text, text, uuid, jsonb, uuid
) IS
  'Atomically creates a pending unpaid checkout order, item snapshots, and stock decrement. p_idempotency_key is the checkout submission identity, not a bank payment key. NULL key keeps the previous create behavior. service_role only.';

CREATE OR REPLACE FUNCTION public.create_checkout_order(
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_customer_address text,
  p_customer_note text,
  p_fulfillment_method text,
  p_payment_method text,
  p_user_id uuid,
  p_items jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN public.create_checkout_order(
    p_customer_name,
    p_customer_phone,
    p_customer_email,
    p_customer_address,
    p_customer_note,
    p_fulfillment_method,
    p_payment_method,
    p_user_id,
    p_items,
    NULL::uuid
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_checkout_order(
  text, text, text, text, text, text, text, uuid, jsonb
) FROM PUBLIC;

REVOKE ALL ON FUNCTION public.create_checkout_order(
  text, text, text, text, text, text, text, uuid, jsonb
) FROM anon, authenticated;

GRANT EXECUTE ON FUNCTION public.create_checkout_order(
  text, text, text, text, text, text, text, uuid, jsonb
) TO service_role;

COMMENT ON FUNCTION public.create_checkout_order(
  text, text, text, text, text, text, text, uuid, jsonb
) IS
  'Compatibility overload for callers that do not send a checkout idempotency key. Delegates with NULL. service_role only.';

COMMIT;
