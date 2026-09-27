import { BogError } from "./errors";

export const BOG_OAUTH_TOKEN_URL =
  "https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token";

export const BOG_CREATE_ORDER_URL =
  "https://api.bog.ge/payments/v1/ecommerce/orders";

export function assertBogServerOnly(): void {
  if (typeof window !== "undefined") {
    throw new BogError(
      "configuration",
      "BOG payment helpers can only be used on the server.",
    );
  }
}

function readRequiredEnv(name: "BOG_CLIENT_ID" | "BOG_CLIENT_SECRET"): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new BogError(
      "configuration",
      `${name} is not configured.`,
    );
  }

  return value;
}

export function getBogClientCredentials(): {
  clientId: string;
  clientSecret: string;
} {
  assertBogServerOnly();

  return {
    clientId: readRequiredEnv("BOG_CLIENT_ID"),
    clientSecret: readRequiredEnv("BOG_CLIENT_SECRET"),
  };
}
