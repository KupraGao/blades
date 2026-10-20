"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/actions/orders/create-order";
import {
  quoteCheckoutOrder,
  type QuoteCheckoutActionErrorCode,
  type QuoteCheckoutActionResult,
} from "@/actions/orders/quote-checkout";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { localizeStorefrontMessage } from "@/lib/i18n/localize-storefront-message";
import { resolveCheckoutPaymentNavigation } from "@/lib/orders/checkout-payment-navigation";
import {
  browserCheckoutIdempotencyStorage,
  clearCheckoutIdempotencyAttempt,
  resolveCheckoutIdempotencyKey,
} from "@/lib/orders/checkout-idempotency-key";
import {
  isCurrentQuoteResponse,
  quotePricesMatch,
  quoteSelectionKey,
  type QuotePriceSnapshot,
} from "@/lib/orders/quote-checkout-display";
import type { QuoteCheckoutLine } from "@/lib/orders/quote-checkout";
import {
  DEFAULT_PAYMENT_METHOD,
  isValidFulfillmentPaymentCombination,
  type PaymentMethod,
} from "@/lib/orders/payment-rules";
import type {
  CreateOrderInput,
  FulfillmentMethod,
} from "@/lib/orders/validate-order";
import CustomerInformationForm from "./form/CustomerInformationForm";
import OrderSummary from "./summary/OrderSummary";
import {
  CheckoutCustomerFormField,
  CheckoutCustomerFormTouched,
  CheckoutCustomerFormValues,
  initialCheckoutCustomerFormValues,
} from "./form/types";
import {
  getCustomerFormErrors,
  isCustomerFormValid,
} from "./form/validate-customer-form";

const CART_STORAGE_KEY = "cart";
const CART_CHANGE_EVENT = "blades-cart-change";

type QuoteSelection = {
  productId: string;
  quantity: number;
};

type CheckoutQuoteRecord =
  | {
      status: "ready";
      selectionKey: string;
      refreshId: number;
      lines: QuoteCheckoutLine[];
      subtotal: string;
      deliveryAllowed: boolean;
    }
  | {
      status: "error";
      selectionKey: string;
      refreshId: number;
      code: QuoteCheckoutActionErrorCode;
      title: string | null;
    };

type PriceChangeNotice = {
  selectionKey: string;
  refreshId: number;
};

function selectionLinesFrom(
  items: readonly { id: string; quantity: number }[],
): QuoteSelection[] {
  return items.map((item) => ({
    productId: item.id,
    quantity: item.quantity,
  }));
}

function priceSnapshot(
  subtotal: string,
  lines: readonly QuoteCheckoutLine[],
): QuotePriceSnapshot {
  return {
    subtotal,
    lines: lines.map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
    })),
  };
}

function quoteErrorText(
  code: QuoteCheckoutActionErrorCode,
  title: string | null,
  t: {
    orderErrorProductsNotFound: string;
    orderErrorInsufficientStock: string;
    orderErrorInvalidStock: string;
    orderErrorInvalidPrice: string;
    orderErrorProductTitleRequired: string;
    orderErrorQuantityInvalid: string;
    orderErrorCartEmpty: string;
    orderErrorGeneric: string;
  },
): string {
  const product = title?.trim() || "unknown";

  switch (code) {
    case "missing_product":
    case "invalid_product_id":
      return t.orderErrorProductsNotFound;
    case "insufficient_stock":
      return t.orderErrorInsufficientStock.replace("{product}", product);
    case "unavailable_stock":
      return t.orderErrorInvalidStock.replace("{product}", product);
    case "invalid_price":
      return t.orderErrorInvalidPrice.replace("{product}", product);
    case "empty_title":
      return t.orderErrorProductTitleRequired;
    case "invalid_quantity":
      return t.orderErrorQuantityInvalid;
    case "empty_cart":
      return t.orderErrorCartEmpty;
    default:
      return t.orderErrorGeneric;
  }
}

export default function CheckoutPageContent() {
  const router = useRouter();
  const { t } = useLanguage();
  const { selectedItems, removeItemsByIds } = useCart();

  const [values, setValues] = useState<CheckoutCustomerFormValues>(
    initialCheckoutCustomerFormValues,
  );
  const [touched, setTouched] = useState<CheckoutCustomerFormTouched>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(
    null,
  );
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(
    null,
  );
  const [quoteRefreshId, setQuoteRefreshId] = useState(0);
  const [priceChangeNotice, setPriceChangeNotice] =
    useState<PriceChangeNotice | null>(null);

  const selectionLines = selectionLinesFrom(selectedItems);
  const selectionKey = quoteSelectionKey(selectionLines);
  const [activeKey, setActiveKey] = useState(selectionKey);
  const [activeLines, setActiveLines] = useState(selectionLines);
  const [quoteRecord, setQuoteRecord] = useState<CheckoutQuoteRecord | null>(
    null,
  );
  // Starts unset so delivery is not accepted before the first verified quote.
  const [appliedDeliveryAllowed, setAppliedDeliveryAllowed] = useState<
    boolean | null
  >(null);

  if (activeKey !== selectionKey) {
    setActiveKey(selectionKey);
    setActiveLines(selectionLines);
  }

  const generationRef = useRef(0);
  const selectionKeyRef = useRef(selectionKey);
  const submitLockRef = useRef(false);

  const storeQuote = useCallback(
    (
      result: QuoteCheckoutActionResult,
      key: string,
      refreshId: number,
    ) => {
      if (!result.ok) {
        setQuoteRecord({
          status: "error",
          selectionKey: key,
          refreshId,
          code: result.error.code,
          title: result.error.title,
        });
        return;
      }

      setQuoteRecord({
        status: "ready",
        selectionKey: key,
        refreshId,
        lines: result.lines,
        subtotal: result.subtotal,
        deliveryAllowed: result.deliveryAllowed,
      });
    },
    [],
  );

  useEffect(() => {
    const invalidate = () => {
      generationRef.current += 1;
      setQuoteRefreshId((current) => current + 1);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== CART_STORAGE_KEY) {
        return;
      }

      invalidate();
    };

    window.addEventListener(CART_CHANGE_EVENT, invalidate);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(CART_CHANGE_EVENT, invalidate);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible" || submitLockRef.current) {
        return;
      }

      generationRef.current += 1;
      setQuoteRefreshId((current) => current + 1);
    };

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  useEffect(() => {
    const key = activeKey;
    const refreshId = quoteRefreshId;
    const generation = ++generationRef.current;
    selectionKeyRef.current = key;

    if (activeLines.length === 0) {
      return;
    }

    let active = true;
    const lines = activeLines;

    void quoteCheckoutOrder(lines)
      .then((result) => {
        if (!active) {
          return;
        }

        if (
          !isCurrentQuoteResponse(
            { generation, selectionKey: key },
            {
              generation: generationRef.current,
              selectionKey: selectionKeyRef.current,
            },
          )
        ) {
          return;
        }

        storeQuote(result, key, refreshId);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        if (
          !isCurrentQuoteResponse(
            { generation, selectionKey: key },
            {
              generation: generationRef.current,
              selectionKey: selectionKeyRef.current,
            },
          )
        ) {
          return;
        }

        setQuoteRecord({
          status: "error",
          selectionKey: key,
          refreshId,
          code: "quote_unavailable",
          title: null,
        });
      });

    return () => {
      active = false;
    };
  }, [activeKey, activeLines, quoteRefreshId, storeQuote]);

  const readyQuote =
    quoteRecord?.status === "ready" &&
    quoteRecord.selectionKey === selectionKey &&
    quoteRecord.refreshId === quoteRefreshId
      ? quoteRecord
      : null;
  const quoteReady = readyQuote !== null;
  const deliveryAllowed = readyQuote?.deliveryAllowed ?? false;
  const deliveryDisabled = !deliveryAllowed;

  if (quoteReady && appliedDeliveryAllowed !== deliveryAllowed) {
    setAppliedDeliveryAllowed(deliveryAllowed);

    if (!deliveryAllowed) {
      setValues((current) => {
        if (current.fulfillmentMethod !== "delivery") {
          return current;
        }

        return {
          ...current,
          fulfillmentMethod: "pickup",
          address: "",
        };
      });

      setTouched((current) => ({
        ...current,
        address: false,
        fulfillmentMethod: true,
      }));
    }
  }

  const errors = getCustomerFormErrors(values);
  const isFormValid = isCustomerFormValid(values);
  const quoteError =
    quoteRecord?.status === "error" &&
    quoteRecord.selectionKey === selectionKey &&
    quoteRecord.refreshId === quoteRefreshId
      ? quoteErrorText(quoteRecord.code, quoteRecord.title, t)
      : null;
  const priceChanged =
    readyQuote !== null &&
    priceChangeNotice !== null &&
    priceChangeNotice.selectionKey === selectionKey &&
    priceChangeNotice.refreshId === quoteRefreshId;
  const quoteLoading = selectedItems.length > 0 && !quoteReady && !quoteError;

  function handleChange(
    field: CheckoutCustomerFormField,
    value: string,
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleBlur(field: CheckoutCustomerFormField) {
    setTouched((current) => ({
      ...current,
      [field]: true,
    }));
  }

  function handleFulfillmentChange(next: FulfillmentMethod) {
    if (next === "delivery" && deliveryDisabled) {
      return;
    }

    setValues((current) => ({
      ...current,
      fulfillmentMethod: next,
      address: next === "pickup" ? "" : current.address,
      // Delivery only allows online — never leave pay_at_pickup selected.
      paymentMethod:
        next === "delivery" ? DEFAULT_PAYMENT_METHOD : current.paymentMethod,
    }));

    setTouched((current) => ({
      ...current,
      address: next === "pickup" ? false : current.address,
      fulfillmentMethod: true,
      paymentMethod: true,
    }));
  }

  function handlePaymentMethodChange(next: PaymentMethod) {
    if (
      values.fulfillmentMethod === "delivery" &&
      next !== "online"
    ) {
      return;
    }

    setValues((current) => ({
      ...current,
      paymentMethod: next,
    }));

    setTouched((current) => ({
      ...current,
      paymentMethod: true,
    }));
  }

  function handleSubmitAttempt() {
    setSubmitAttempted(true);
  }

  async function handlePlaceOrder() {
    if (submitLockRef.current || isSubmitting || createdOrderId) {
      return;
    }

    setSubmitAttempted(true);

    const purchasedItems = selectedItems;
    const lines = selectionLinesFrom(purchasedItems);
    const key = quoteSelectionKey(lines);

    if (!isFormValid || lines.length === 0 || readyQuote === null) {
      return;
    }

    if (readyQuote.selectionKey !== key) {
      return;
    }

    if (
      values.fulfillmentMethod === "delivery" &&
      !readyQuote.deliveryAllowed
    ) {
      setSubmissionError(t.deliveryMinimumRequired);
      return;
    }

    if (
      !isValidFulfillmentPaymentCombination(
        values.fulfillmentMethod,
        values.paymentMethod,
      )
    ) {
      setSubmissionError(t.orderErrorPaymentCombinationInvalid);
      return;
    }

    const displayedQuote = priceSnapshot(
      readyQuote.subtotal,
      readyQuote.lines,
    );
    const purchasedIds = purchasedItems.map((item) => item.id);
    const generation = ++generationRef.current;

    submitLockRef.current = true;
    setSubmissionError(null);
    setIsSubmitting(true);

    try {
      const result = await quoteCheckoutOrder(lines);
      const currentResponse = {
        generation: generationRef.current,
        selectionKey: selectionKeyRef.current,
      };

      if (
        !isCurrentQuoteResponse(
          { generation, selectionKey: key },
          currentResponse,
        )
      ) {
        return;
      }

      if (!result.ok) {
        storeQuote(result, key, quoteRefreshId);
        setPriceChangeNotice(null);
        return;
      }

      const freshQuote = priceSnapshot(result.subtotal, result.lines);

      if (!quotePricesMatch(displayedQuote, freshQuote)) {
        storeQuote(result, key, quoteRefreshId);
        setPriceChangeNotice({
          selectionKey: key,
          refreshId: quoteRefreshId,
        });
        return;
      }

      if (
        values.fulfillmentMethod === "delivery" &&
        !result.deliveryAllowed
      ) {
        storeQuote(result, key, quoteRefreshId);
        setPriceChangeNotice(null);
        setSubmissionError(t.deliveryMinimumRequired);
        return;
      }

      if (
        !isCurrentQuoteResponse(
          { generation, selectionKey: key },
          {
            generation: generationRef.current,
            selectionKey: selectionKeyRef.current,
          },
        )
      ) {
        return;
      }

      const isPickup = values.fulfillmentMethod === "pickup";
      const payload: CreateOrderInput = {
        customerName: values.fullName,
        customerEmail: values.email.trim() || undefined,
        customerPhone: values.phone,
        customerAddress: isPickup ? null : values.address,
        fulfillmentMethod: values.fulfillmentMethod,
        paymentMethod: values.paymentMethod,
        items: lines,
      };
      const idempotencyKey = resolveCheckoutIdempotencyKey(
        browserCheckoutIdempotencyStorage(),
        {
          customerName: values.fullName,
          customerPhone: values.phone,
          customerEmail: values.email,
          customerAddress: isPickup ? "" : values.address,
          fulfillmentMethod: values.fulfillmentMethod,
          paymentMethod: values.paymentMethod,
          items: lines,
        },
      );
      const created = await createOrder(payload, idempotencyKey);

      if (!created.success) {
        setSubmissionError(t[created.messageCode]);
        if (created.stockReleased) {
          clearCheckoutIdempotencyAttempt(browserCheckoutIdempotencyStorage());
        }
        return;
      }

      const navigation = resolveCheckoutPaymentNavigation({
        paymentMethod: payload.paymentMethod,
        paymentRedirectUrl: created.paymentRedirectUrl,
      });

      if (navigation.type === "error") {
        setSubmissionError(t[navigation.messageCode]);
        return;
      }

      setPriceChangeNotice(null);
      setCreatedOrderId(created.orderId);
      clearCheckoutIdempotencyAttempt(browserCheckoutIdempotencyStorage());
      removeItemsByIds(purchasedIds);

      if (navigation.type === "bank") {
        window.location.assign(navigation.redirectUrl);
        return;
      }

      router.push(`/checkout/success/${created.orderId}`);
    } catch (error) {
      console.error("Failed to create order:", error);

      const message =
        error instanceof Error && error.message.trim()
          ? localizeStorefrontMessage(error.message, t)
          : t.orderErrorGeneric;

      setSubmissionError(message);
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  }

  const visibleErrors = {
    fullName:
      touched.fullName || submitAttempted
        ? errors.fullName
        : undefined,
    email:
      touched.email || submitAttempted ? errors.email : undefined,
    phone:
      touched.phone || submitAttempted ? errors.phone : undefined,
    address:
      touched.address || submitAttempted
        ? errors.address
        : undefined,
    fulfillmentMethod:
      touched.fulfillmentMethod || submitAttempted
        ? errors.fulfillmentMethod
        : undefined,
    paymentMethod:
      touched.paymentMethod || submitAttempted
        ? errors.paymentMethod
        : undefined,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">

      <div className="mb-10">

        <h1 className="text-4xl font-bold">
          {t.checkoutTitle}
        </h1>

        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          {t.checkoutDescription}
        </p>

      </div>

      <div className="grid gap-8 lg:grid-cols-3">

        <div className="lg:col-span-2">
          <CustomerInformationForm
            values={values}
            errors={visibleErrors}
            onChange={handleChange}
            onBlur={handleBlur}
            onFulfillmentChange={handleFulfillmentChange}
            onPaymentMethodChange={handlePaymentMethodChange}
            onSubmitAttempt={handleSubmitAttempt}
            deliveryDisabled={deliveryDisabled}
          />
        </div>

        <div>
          <OrderSummary
            isFormValid={isFormValid}
            isSubmitting={isSubmitting}
            submissionError={submissionError}
            createdOrderId={createdOrderId}
            quoteReady={quoteReady}
            quoteLoading={quoteLoading}
            quoteLines={readyQuote ? readyQuote.lines : null}
            quoteSubtotal={readyQuote ? readyQuote.subtotal : null}
            quoteError={quoteError}
            priceChanged={priceChanged}
            onPlaceOrder={handlePlaceOrder}
          />
        </div>

      </div>

    </div>
  );
}
