import assert from "node:assert/strict";

import {
  buildCreateOrderBody,
  buildCreateOrderHeaders,
  createBogOrder,
  readCreateOrderResult,
  type BogCreateOrderInput,
} from "./create-order";
import { readBankOrderDispatch } from "./bank-order-dispatch";
import { BogError, type BogErrorKind } from "./errors";
import { BogCreateOrderAttemptNotDeployed } from "../../orders/release-unsent-online-order";

const KEY = "550e8400-e29b-41d4-a716-446655440000";
const KEY_UPPER = "550E8400-E29B-41D4-A716-446655440000";
const PRODUCTION_OAUTH_URL =
  "https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token";
const SANDBOX_OAUTH_URL =
  "https://oauth2-sandbox.bog.ge/auth/realms/bog/protocol/openid-connect/token";
const PRODUCTION_CREATE_ORDER_URL =
  "https://api.bog.ge/payments/v1/ecommerce/orders";
const SANDBOX_CREATE_ORDER_URL =
  "https://api-sandbox.bog.ge/payments/v1/ecommerce/orders";
const PRODUCTION_REDIRECT = "https://payment.bog.ge/?order_id=order-1";
const SANDBOX_REDIRECT = "https://payment-sandbox.bog.ge/?order_id=order-1";

const ENV_KEYS = [
  "BOG_ENVIRONMENT",
  "BOG_CREDENTIAL_ENVIRONMENT",
  "BOG_CLIENT_ID",
  "BOG_CLIENT_SECRET",
] as const;

type EnvKey = (typeof ENV_KEYS)[number];

const realFetch = globalThis.fetch;

const disabledFetch: typeof fetch = async () => {
  throw new Error("network disabled");
};

function orderInput(
  overrides: Partial<BogCreateOrderInput> = {},
): BogCreateOrderInput {
  return {
    callback_url: "https://shop.example/api/payments/bog/callback",
    external_order_id: "order-1",
    idempotencyKey: KEY,
    purchase_units: {
      currency: "GEL",
      total_amount: 10,
      basket: [
        {
          product_id: "sku-1",
          quantity: 2,
          unit_price: 5,
          description: "Blade",
        },
      ],
    },
    ...overrides,
  };
}

function redirectPayload(href: string): {
  id: string;
  _links: { redirect: { href: string } };
} {
  return {
    id: "order-1",
    _links: {
      redirect: { href },
    },
  };
}

function tokenResponse(): Response {
  return Response.json({
    access_token: "test-token",
    token_type: "Bearer",
  });
}

function createOrderResponse(href: string, status = 200): Response {
  return Response.json(
    {
      id: "order-1",
      _links: {
        redirect: { href },
      },
    },
    { status },
  );
}

async function withBogEnv(
  values: Partial<Record<EnvKey, string>>,
  run: () => Promise<void> | void,
): Promise<void> {
  const previous = ENV_KEYS.map(
    (key) => [key, process.env[key]] as const,
  );

  for (const key of ENV_KEYS) {
    const next = values[key];

    if (next === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = next;
    }
  }

  globalThis.fetch = disabledFetch;

  try {
    await run();
  } finally {
    globalThis.fetch = disabledFetch;

    for (const [key, value] of previous) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

function expectBogError(
  error: unknown,
  kind: BogErrorKind,
  message: string,
): void {
  assert.ok(error instanceof BogError);
  assert.equal(error.kind, kind);
  assert.equal(error.message, message);
  assert.equal(error.message.includes("sandbox-secret"), false);
  assert.equal(error.message.includes("production-secret"), false);
  assert.equal(error.message.includes("test-token"), false);
}

const sandboxEnv = {
  BOG_ENVIRONMENT: "sandbox",
  BOG_CREDENTIAL_ENVIRONMENT: "sandbox",
  BOG_CLIENT_ID: "sandbox-client",
  BOG_CLIENT_SECRET: "sandbox-secret",
} as const;

const productionEnv = {
  BOG_ENVIRONMENT: "production",
  BOG_CREDENTIAL_ENVIRONMENT: "production",
  BOG_CLIENT_ID: "production-client",
  BOG_CLIENT_SECRET: "production-secret",
} as const;

const body = buildCreateOrderBody(orderInput());
assert.equal(Object.hasOwn(body, "ttl"), false);
assert.equal(body.callback_url, "https://shop.example/api/payments/bog/callback");
assert.equal(body.external_order_id, "order-1");
assert.deepEqual(body.purchase_units, {
  currency: "GEL",
  total_amount: 10,
  basket: [
    {
      product_id: "sku-1",
      quantity: 2,
      unit_price: 5,
      description: "Blade",
    },
  ],
});

assert.throws(
  () =>
    buildCreateOrderBody(
      orderInput({
        purchase_units: {
          currency: "GEL",
          total_amount: 9,
          basket: [
            {
              product_id: "sku-1",
              quantity: 2,
              unit_price: 5,
            },
          ],
        },
      }),
    ),
  (error: unknown) => {
    expectBogError(
      error,
      "malformed",
      "BOG create-order purchase_units.total_amount is invalid.",
    );
    return true;
  },
);

assert.equal(buildCreateOrderHeaders("test-token", KEY)["Idempotency-Key"], KEY);
assert.equal(
  buildCreateOrderHeaders("test-token", KEY_UPPER)["Idempotency-Key"],
  KEY_UPPER,
);
assert.throws(
  () => buildCreateOrderHeaders("test-token", "550e8400-e29b-11d4-a716-446655440000"),
  (error: unknown) => {
    expectBogError(error, "malformed", "BOG create-order idempotencyKey is invalid.");
    return true;
  },
);
assert.throws(
  () => buildCreateOrderHeaders("test-token", "not-a-uuid"),
  (error: unknown) => {
    expectBogError(error, "malformed", "BOG create-order idempotencyKey is invalid.");
    return true;
  },
);

assert.equal(buildCreateOrderBody(orderInput({ ttl: 2 })).ttl, 2);
assert.equal(buildCreateOrderBody(orderInput({ ttl: 1440 })).ttl, 1440);

for (const ttl of [1, 1441, 2.5, Number.NaN, Number.POSITIVE_INFINITY]) {
  assert.throws(
    () => buildCreateOrderBody(orderInput({ ttl })),
    (error: unknown) => {
      expectBogError(error, "malformed", "BOG create-order ttl is invalid.");
      return true;
    },
  );
}

async function main(): Promise<void> {
await withBogEnv(sandboxEnv, () => {
  assert.equal(
    readCreateOrderResult(redirectPayload(SANDBOX_REDIRECT)).redirectUrl,
    SANDBOX_REDIRECT,
  );
  assert.throws(
    () => readCreateOrderResult(redirectPayload(PRODUCTION_REDIRECT)),
    (error: unknown) => {
      expectBogError(
        error,
        "malformed",
        "BOG create-order returned an unexpected response.",
      );
      return true;
    },
  );
  assert.throws(
    () => readCreateOrderResult(redirectPayload("https://evil.example/pay")),
    (error: unknown) => {
      expectBogError(
        error,
        "malformed",
        "BOG create-order returned an unexpected response.",
      );
      return true;
    },
  );
  assert.throws(
    () => readCreateOrderResult({ id: "order-1" }),
    (error: unknown) => {
      expectBogError(
        error,
        "malformed",
        "BOG create-order returned an unexpected response.",
      );
      return true;
    },
  );
});

await withBogEnv(productionEnv, () => {
  assert.equal(
    readCreateOrderResult(redirectPayload(PRODUCTION_REDIRECT)).redirectUrl,
    PRODUCTION_REDIRECT,
  );
  assert.throws(
    () => readCreateOrderResult(redirectPayload(SANDBOX_REDIRECT)),
    (error: unknown) => {
      expectBogError(
        error,
        "malformed",
        "BOG create-order returned an unexpected response.",
      );
      return true;
    },
  );
});

await withBogEnv({}, () => {
  assert.throws(
    () => readCreateOrderResult(redirectPayload(PRODUCTION_REDIRECT)),
    (error: unknown) => {
      expectBogError(error, "configuration", "BOG_ENVIRONMENT is not configured.");
      return true;
    },
  );
});

await withBogEnv(
  {
    BOG_ENVIRONMENT: "live",
    BOG_CREDENTIAL_ENVIRONMENT: "sandbox",
  },
  async () => {
    await assert.rejects(
      () => createBogOrder(orderInput()),
      (error: unknown) => {
        expectBogError(error, "configuration", "BOG_ENVIRONMENT is invalid.");
        return true;
      },
    );
  },
);

await withBogEnv(
  {
    BOG_ENVIRONMENT: "sandbox",
    BOG_CREDENTIAL_ENVIRONMENT: "production",
    BOG_CLIENT_ID: "sandbox-client",
    BOG_CLIENT_SECRET: "sandbox-secret",
  },
  async () => {
    await assert.rejects(
      () => createBogOrder(orderInput()),
      (error: unknown) => {
        expectBogError(
          error,
          "configuration",
          "BOG_ENVIRONMENT does not match BOG_CREDENTIAL_ENVIRONMENT.",
        );
        return true;
      },
    );
  },
);

type MockCall = {
  url: string;
  body: string;
  idempotencyKey?: string;
  bearer?: string;
};

async function withMockedCreateOrder(
  env: typeof sandboxEnv | typeof productionEnv,
  respond: (url: string) => Response | Promise<Response>,
  run: (calls: MockCall[]) => Promise<void>,
): Promise<void> {
  await withBogEnv(env, async () => {
    const calls: MockCall[] = [];

    globalThis.fetch = async (input, init) => {
      const url = String(input);
      const headers = init?.headers as Record<string, string> | undefined;
      const authorization = headers?.Authorization;
      calls.push({
        url,
        body: typeof init?.body === "string" ? init.body : "",
        idempotencyKey: headers?.["Idempotency-Key"],
        bearer: authorization?.startsWith("Bearer ") ? authorization : undefined,
      });
      return respond(url);
    };

    await run(calls);
  });
}

await withMockedCreateOrder(
  sandboxEnv,
  (url) => {
    if (url === SANDBOX_OAUTH_URL) {
      return tokenResponse();
    }

    if (url === SANDBOX_CREATE_ORDER_URL) {
      return createOrderResponse(SANDBOX_REDIRECT);
    }

    throw new Error("unexpected URL");
  },
  async (calls) => {
    const result = await createBogOrder(orderInput());
    assert.equal(result.orderId, "order-1");
    assert.equal(result.redirectUrl, SANDBOX_REDIRECT);
    assert.deepEqual(
      calls.map((call) => call.url),
      [SANDBOX_OAUTH_URL, SANDBOX_CREATE_ORDER_URL],
    );
    const payload = JSON.parse(calls[1].body) as Record<string, unknown>;
    assert.equal(Object.hasOwn(payload, "ttl"), false);
    assert.equal(calls[1].body.includes("sandbox-secret"), false);
    assert.equal(calls[1].bearer, "Bearer test-token");
  },
);

await withMockedCreateOrder(
  productionEnv,
  (url) => {
    if (url === PRODUCTION_OAUTH_URL) {
      return tokenResponse();
    }

    if (url === PRODUCTION_CREATE_ORDER_URL) {
      return createOrderResponse(PRODUCTION_REDIRECT);
    }

    throw new Error("unexpected URL");
  },
  async (calls) => {
    const result = await createBogOrder(orderInput({ ttl: 15 }));
    assert.equal(result.redirectUrl, PRODUCTION_REDIRECT);
    assert.equal(calls[1].idempotencyKey, KEY);
    assert.equal(calls[1].bearer, "Bearer test-token");
    const payload = JSON.parse(calls[1].body) as { ttl?: number };
    assert.equal(payload.ttl, 15);
  },
);

await withMockedCreateOrder(
  sandboxEnv,
  (url) => {
    if (url === SANDBOX_OAUTH_URL) {
      return tokenResponse();
    }

    return new Response(null, { status: 401 });
  },
  async () => {
    await assert.rejects(
      () => createBogOrder(orderInput()),
      (error: unknown) => {
        expectBogError(error, "authentication", "BOG create-order request failed.");
        assert.ok(error instanceof BogError);
        assert.equal(error.status, 401);
        return true;
      },
    );
  },
);

await withMockedCreateOrder(
  sandboxEnv,
  (url) => {
    if (url === SANDBOX_OAUTH_URL) {
      return tokenResponse();
    }

    return new Response(null, { status: 500 });
  },
  async () => {
    await assert.rejects(
      () => createBogOrder(orderInput()),
      (error: unknown) => {
        expectBogError(error, "network", "BOG create-order request failed.");
        assert.ok(error instanceof BogError);
        assert.equal(error.status, 500);
        return true;
      },
    );
  },
);

const CREATE_ORDER_LEAKS = [
  "https://shop.example/api/payments/bog/callback",
  "CUSTOMER_SHOULD_NOT_LEAK",
  "RAW_BODY_SHOULD_NOT_LEAK",
  "test-token",
  "sandbox-secret",
  "order-1",
  "Bad Request",
];

function assertCreateOrderLogHasNoLeaks(log: unknown): void {
  const serialized = JSON.stringify(log);

  for (const leak of CREATE_ORDER_LEAKS) {
    assert.equal(serialized.includes(leak), false);
  }
}

async function captureCreateOrderFailure(
  response: Response,
): Promise<{ error: unknown; log: unknown; idempotencyKey: string | undefined }> {
  let error: unknown;
  let log: unknown;
  let idempotencyKey: string | undefined;
  const originalConsoleError = console.error;
  console.error = (message: unknown, details: unknown) => {
    if (message === "BOG create-order request failed") {
      log = details;
    }
  };

  try {
    await withMockedCreateOrder(
      sandboxEnv,
      (url) => {
        if (url === SANDBOX_OAUTH_URL) {
          return tokenResponse();
        }

        return response;
      },
      async (calls) => {
        await assert.rejects(
          () => createBogOrder(orderInput()),
          (caught: unknown) => {
            error = caught;
            return true;
          },
        );
        idempotencyKey = calls[1]?.idempotencyKey;
      },
    );
  } finally {
    console.error = originalConsoleError;
  }

  return { error, log, idempotencyKey };
}

const safeFailure = await captureCreateOrderFailure(
  Response.json(
    {
      error: "Bad Request",
      message:
        "https://shop.example/api/payments/bog/callback CUSTOMER_SHOULD_NOT_LEAK order-1",
      access_token: "test-token",
      callback_url: "https://shop.example/api/payments/bog/callback",
      errors: [
        {
          field: "purchase_units.basket[0].unit_price",
          code: "invalid_amount",
          message: "RAW_BODY_SHOULD_NOT_LEAK",
        },
      ],
    },
    { status: 400 },
  ),
);
expectBogError(safeFailure.error, "network", "BOG create-order request failed.");
assert.ok(safeFailure.error instanceof BogError);
assert.equal(safeFailure.error.status, 400);
assert.equal(readBankOrderDispatch(safeFailure.error), "uncertain");
assert.equal(safeFailure.idempotencyKey, KEY);
assert.deepEqual(safeFailure.log, {
  kind: "network",
  status: 400,
  createOrderError: "invalid_amount",
  field: "purchase_units.basket[0].unit_price",
});
assertCreateOrderLogHasNoLeaks(safeFailure.log);

const unsafeFailure = await captureCreateOrderFailure(
  Response.json(
    {
      error: "CUSTOMER_SHOULD_NOT_LEAK",
      message: "https://shop.example/api/payments/bog/callback",
      field: "customer_email",
    },
    { status: 400 },
  ),
);
expectBogError(unsafeFailure.error, "network", "BOG create-order request failed.");
assert.ok(unsafeFailure.error instanceof BogError);
assert.equal(unsafeFailure.error.status, 400);
assert.equal(readBankOrderDispatch(unsafeFailure.error), "uncertain");
assert.deepEqual(unsafeFailure.log, {
  kind: "network",
  status: 400,
  createOrderError: "unknown_create_order_error",
});
assertCreateOrderLogHasNoLeaks(unsafeFailure.log);

const unreadableFailure = await captureCreateOrderFailure(
  new Response("RAW_BODY_SHOULD_NOT_LEAK", {
    status: 400,
    headers: { "Content-Type": "text/plain" },
  }),
);
expectBogError(
  unreadableFailure.error,
  "network",
  "BOG create-order request failed.",
);
assert.ok(unreadableFailure.error instanceof BogError);
assert.equal(unreadableFailure.error.status, 400);
assert.equal(readBankOrderDispatch(unreadableFailure.error), "uncertain");
assert.deepEqual(unreadableFailure.log, {
  kind: "network",
  status: 400,
  createOrderError: "unknown_create_order_error",
});
assertCreateOrderLogHasNoLeaks(unreadableFailure.log);

await withMockedCreateOrder(
  sandboxEnv,
  (url) => {
    if (url === SANDBOX_OAUTH_URL) {
      return tokenResponse();
    }

    throw new Error("socket closed");
  },
  async () => {
    await assert.rejects(
      () => createBogOrder(orderInput()),
      (error: unknown) => {
        expectBogError(error, "network", "BOG create-order request failed.");
        return true;
      },
    );
  },
);

await withMockedCreateOrder(
  sandboxEnv,
  (url) => {
    if (url === SANDBOX_OAUTH_URL) {
      return tokenResponse();
    }

    return new Response("{", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
  async () => {
    await assert.rejects(
      () => createBogOrder(orderInput()),
      (error: unknown) => {
        expectBogError(error, "malformed", "BOG returned a malformed response.");
        return true;
      },
    );
  },
);

await withMockedCreateOrder(
  sandboxEnv,
  (url) => {
    if (url === SANDBOX_OAUTH_URL) {
      return tokenResponse();
    }

    return Response.json({ id: "order-1" });
  },
  async () => {
    await assert.rejects(
      () => createBogOrder(orderInput()),
      (error: unknown) => {
        expectBogError(
          error,
          "malformed",
          "BOG create-order returned an unexpected response.",
        );
        return true;
      },
    );
  },
);

await withMockedCreateOrder(
  sandboxEnv,
  (url) => {
    if (url === SANDBOX_OAUTH_URL) {
      return Response.json({ error: "invalid_client" }, { status: 400 });
    }

    throw new Error("create order must not be called");
  },
  async (calls) => {
    await assert.rejects(
      () => createBogOrder(orderInput()),
      (error: unknown) => {
        expectBogError(error, "authentication", "BOG authentication failed.");
        assert.equal(readBankOrderDispatch(error), "unsent");
        return true;
      },
    );
    assert.deepEqual(
      calls.map((call) => call.url),
      [SANDBOX_OAUTH_URL],
    );
  },
);

await withMockedCreateOrder(
  sandboxEnv,
  (url) => {
    if (url === SANDBOX_OAUTH_URL) {
      return tokenResponse();
    }

    throw new Error("create order must not be called");
  },
  async (calls) => {
    await assert.rejects(
      () =>
        createBogOrder(orderInput(), {
          beforeCreateOrder: async () => {
            throw new BogCreateOrderAttemptNotDeployed();
          },
        }),
      (error: unknown) => {
        assert.ok(error instanceof BogCreateOrderAttemptNotDeployed);
        assert.equal(readBankOrderDispatch(error), "uncertain");
        return true;
      },
    );
    assert.deepEqual(
      calls.map((call) => call.url),
      [SANDBOX_OAUTH_URL],
    );
  },
);

await withMockedCreateOrder(
  sandboxEnv,
  (url) => {
    if (url === SANDBOX_OAUTH_URL) {
      return tokenResponse();
    }

    throw new Error("socket down");
  },
  async () => {
    await assert.rejects(
      () => createBogOrder(orderInput()),
      (error: unknown) => {
        expectBogError(error, "network", "BOG create-order request failed.");
        assert.equal(readBankOrderDispatch(error), "uncertain");
        return true;
      },
    );
  },
);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    globalThis.fetch = realFetch;
  });
