import { BogError } from "./errors";

export type BogEnvironment = "sandbox" | "production";

type BogEndpoints = {
  environment: BogEnvironment;
  oauthTokenUrl: string;
  createOrderUrl: string;
  paymentRedirectHost: string;
};

const ENDPOINTS: Record<
  BogEnvironment,
  Omit<BogEndpoints, "environment">
> = {
  production: {
    oauthTokenUrl:
      "https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token",
    createOrderUrl: "https://api.bog.ge/payments/v1/ecommerce/orders",
    paymentRedirectHost: "payment.bog.ge",
  },
  sandbox: {
    oauthTokenUrl:
      "https://oauth2-sandbox.bog.ge/auth/realms/bog/protocol/openid-connect/token",
    createOrderUrl:
      "https://api-sandbox.bog.ge/payments/v1/ecommerce/orders",
    paymentRedirectHost: "payment-sandbox.bog.ge",
  },
};

function failConfig(message: string): never {
  throw new BogError("configuration", message);
}

function readEnvironmentName(
  name: "BOG_ENVIRONMENT" | "BOG_CREDENTIAL_ENVIRONMENT",
): BogEnvironment {
  const value = process.env[name]?.trim();

  if (!value) {
    failConfig(`${name} is not configured.`);
  }

  if (value !== "sandbox" && value !== "production") {
    failConfig(`${name} is invalid.`);
  }

  return value;
}

export function assertBogServerOnly(): void {
  if (typeof window !== "undefined") {
    throw new BogError(
      "configuration",
      "BOG payment helpers can only be used on the server.",
    );
  }
}

function readRequiredEnv(
  name: "BOG_CLIENT_ID" | "BOG_CLIENT_SECRET" | "BOG_CALLBACK_URL",
): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new BogError(
      "configuration",
      `${name} is not configured.`,
    );
  }

  return value;
}

export function resolveBogEndpoints(): BogEndpoints {
  assertBogServerOnly();

  const environment = readEnvironmentName("BOG_ENVIRONMENT");
  const credentialEnvironment = readEnvironmentName(
    "BOG_CREDENTIAL_ENVIRONMENT",
  );

  if (environment !== credentialEnvironment) {
    failConfig(
      "BOG_ENVIRONMENT does not match BOG_CREDENTIAL_ENVIRONMENT.",
    );
  }

  return {
    environment,
    ...ENDPOINTS[environment],
  };
}

export function getBogOAuthTokenUrl(): string {
  return resolveBogEndpoints().oauthTokenUrl;
}

export function getBogCreateOrderUrl(): string {
  return resolveBogEndpoints().createOrderUrl;
}

export function getBogPaymentRedirectHost(): string {
  return resolveBogEndpoints().paymentRedirectHost;
}

export function getBogCallbackUrl(): string {
  assertBogServerOnly();

  const value = readRequiredEnv("BOG_CALLBACK_URL");
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new BogError("configuration", "BOG_CALLBACK_URL is invalid.");
  }

  if (url.protocol !== "https:" || url.username || url.password || !url.hostname) {
    throw new BogError("configuration", "BOG_CALLBACK_URL is invalid.");
  }

  return value;
}

export function getBogClientCredentials(): {
  clientId: string;
  clientSecret: string;
} {
  resolveBogEndpoints();

  return {
    clientId: readRequiredEnv("BOG_CLIENT_ID"),
    clientSecret: readRequiredEnv("BOG_CLIENT_SECRET"),
  };
}
