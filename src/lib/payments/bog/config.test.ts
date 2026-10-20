import assert from "node:assert/strict";

import { readCreateOrderResult } from "./create-order";
import {
  getBogClientCredentials,
  getBogCreateOrderUrl,
  getBogOAuthTokenUrl,
  getBogPaymentRedirectHost,
} from "./config";
import { BogError } from "./errors";

const PRODUCTION_OAUTH_URL =
  "https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token";
const SANDBOX_OAUTH_URL =
  "https://oauth2-sandbox.bog.ge/auth/realms/bog/protocol/openid-connect/token";
const PRODUCTION_CREATE_ORDER_URL =
  "https://api.bog.ge/payments/v1/ecommerce/orders";
const SANDBOX_CREATE_ORDER_URL =
  "https://api-sandbox.bog.ge/payments/v1/ecommerce/orders";

const ENV_KEYS = [
  "BOG_ENVIRONMENT",
  "BOG_CREDENTIAL_ENVIRONMENT",
  "BOG_CLIENT_ID",
  "BOG_CLIENT_SECRET",
] as const;

type EnvKey = (typeof ENV_KEYS)[number];

function withBogEnv(
  values: Partial<Record<EnvKey, string>>,
  run: () => void,
): void {
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

  try {
    run();
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

function expectConfigError(run: () => void, message: string): void {
  assert.throws(run, (error: unknown) => {
    assert.ok(error instanceof BogError);
    assert.equal(error.kind, "configuration");
    assert.equal(error.message, message);
    assert.equal(error.message.includes("credential-marker"), false);
    return true;
  });
}

function redirectPayload(href: string): {
  id: string;
  _links: { redirect: { href: string } };
} {
  return {
    id: "order-1",
    _links: {
      redirect: {
        href,
      },
    },
  };
}

withBogEnv(
  {
    BOG_ENVIRONMENT: "sandbox",
    BOG_CREDENTIAL_ENVIRONMENT: "sandbox",
    BOG_CLIENT_ID: "sandbox-client",
    BOG_CLIENT_SECRET: "sandbox-secret",
  },
  () => {
    assert.equal(getBogOAuthTokenUrl(), SANDBOX_OAUTH_URL);
    assert.equal(getBogCreateOrderUrl(), SANDBOX_CREATE_ORDER_URL);
    assert.equal(getBogPaymentRedirectHost(), "payment-sandbox.bog.ge");
    assert.deepEqual(getBogClientCredentials(), {
      clientId: "sandbox-client",
      clientSecret: "sandbox-secret",
    });
    assert.equal(
      readCreateOrderResult(
        redirectPayload("https://payment-sandbox.bog.ge/?order_id=order-1"),
      ).redirectUrl,
      "https://payment-sandbox.bog.ge/?order_id=order-1",
    );
    assert.throws(
      () =>
        readCreateOrderResult(
          redirectPayload("https://payment.bog.ge/?order_id=order-1"),
        ),
      (error: unknown) => {
        assert.ok(error instanceof BogError);
        assert.equal(error.kind, "malformed");
        return true;
      },
    );
  },
);

withBogEnv(
  {
    BOG_ENVIRONMENT: " production ",
    BOG_CREDENTIAL_ENVIRONMENT: "production",
    BOG_CLIENT_ID: "production-client",
    BOG_CLIENT_SECRET: "production-secret",
  },
  () => {
    assert.equal(getBogOAuthTokenUrl(), PRODUCTION_OAUTH_URL);
    assert.equal(getBogCreateOrderUrl(), PRODUCTION_CREATE_ORDER_URL);
    assert.equal(getBogPaymentRedirectHost(), "payment.bog.ge");
    assert.deepEqual(getBogClientCredentials(), {
      clientId: "production-client",
      clientSecret: "production-secret",
    });
    assert.equal(
      readCreateOrderResult(
        redirectPayload("https://payment.bog.ge/?order_id=order-1"),
      ).redirectUrl,
      "https://payment.bog.ge/?order_id=order-1",
    );
  },
);

withBogEnv({}, () => {
  expectConfigError(
    () => getBogOAuthTokenUrl(),
    "BOG_ENVIRONMENT is not configured.",
  );
  expectConfigError(
    () => getBogCreateOrderUrl(),
    "BOG_ENVIRONMENT is not configured.",
  );
  expectConfigError(
    () =>
      readCreateOrderResult(
        redirectPayload("https://payment.bog.ge/?order_id=order-1"),
      ),
    "BOG_ENVIRONMENT is not configured.",
  );
});

withBogEnv({ BOG_ENVIRONMENT: "production" }, () => {
  expectConfigError(
    () => getBogCreateOrderUrl(),
    "BOG_CREDENTIAL_ENVIRONMENT is not configured.",
  );
});

withBogEnv(
  {
    BOG_CREDENTIAL_ENVIRONMENT: "sandbox",
    BOG_CLIENT_ID: "credential-marker",
    BOG_CLIENT_SECRET: "credential-marker",
  },
  () => {
    expectConfigError(
      () => getBogClientCredentials(),
      "BOG_ENVIRONMENT is not configured.",
    );
  },
);

for (const invalid of ["", "live", "Production", "sandbox-production"]) {
  withBogEnv(
    {
      BOG_ENVIRONMENT: invalid,
      BOG_CREDENTIAL_ENVIRONMENT: "sandbox",
    },
    () => {
      const message = invalid.trim()
        ? "BOG_ENVIRONMENT is invalid."
        : "BOG_ENVIRONMENT is not configured.";

      expectConfigError(() => getBogOAuthTokenUrl(), message);
    },
  );
}

withBogEnv(
  {
    BOG_ENVIRONMENT: "sandbox",
    BOG_CREDENTIAL_ENVIRONMENT: "not-an-environment",
    BOG_CLIENT_SECRET: "credential-marker",
  },
  () => {
    expectConfigError(
      () => getBogPaymentRedirectHost(),
      "BOG_CREDENTIAL_ENVIRONMENT is invalid.",
    );
  },
);

withBogEnv(
  {
    BOG_ENVIRONMENT: "sandbox",
    BOG_CREDENTIAL_ENVIRONMENT: "production",
    BOG_CLIENT_ID: "credential-marker",
    BOG_CLIENT_SECRET: "credential-marker",
  },
  () => {
    expectConfigError(
      () => getBogClientCredentials(),
      "BOG_ENVIRONMENT does not match BOG_CREDENTIAL_ENVIRONMENT.",
    );
    expectConfigError(
      () => getBogCreateOrderUrl(),
      "BOG_ENVIRONMENT does not match BOG_CREDENTIAL_ENVIRONMENT.",
    );
  },
);

withBogEnv(
  {
    BOG_ENVIRONMENT: "production",
    BOG_CREDENTIAL_ENVIRONMENT: "sandbox",
    BOG_CLIENT_ID: "credential-marker",
    BOG_CLIENT_SECRET: "credential-marker",
  },
  () => {
    expectConfigError(
      () => getBogOAuthTokenUrl(),
      "BOG_ENVIRONMENT does not match BOG_CREDENTIAL_ENVIRONMENT.",
    );
    expectConfigError(
      () => getBogClientCredentials(),
      "BOG_ENVIRONMENT does not match BOG_CREDENTIAL_ENVIRONMENT.",
    );
  },
);
