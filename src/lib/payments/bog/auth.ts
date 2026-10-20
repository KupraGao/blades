import { getBogClientCredentials, getBogOAuthTokenUrl } from "./config";
import { providerFailure, isRecord, readJsonBody } from "./http";

const OAUTH_ERROR_CODES = [
  "invalid_request",
  "invalid_client",
  "invalid_grant",
  "unauthorized_client",
  "unsupported_grant_type",
  "invalid_scope",
] as const;

export type BogOAuthErrorCode =
  | (typeof OAUTH_ERROR_CODES)[number]
  | "unknown_oauth_error";

export function readBogOAuthErrorCode(payload: unknown): BogOAuthErrorCode {
  if (!isRecord(payload) || typeof payload.error !== "string") {
    return "unknown_oauth_error";
  }

  const code = payload.error.trim();

  if ((OAUTH_ERROR_CODES as readonly string[]).includes(code)) {
    return code as Exclude<BogOAuthErrorCode, "unknown_oauth_error">;
  }

  return "unknown_oauth_error";
}

async function readFailedOAuthErrorCode(
  response: Response,
): Promise<BogOAuthErrorCode> {
  try {
    const text = await response.text();

    if (!text.trim()) {
      return "unknown_oauth_error";
    }

    return readBogOAuthErrorCode(JSON.parse(text) as unknown);
  } catch {
    return "unknown_oauth_error";
  }
}

function basicAuthHeader(clientId: string, clientSecret: string): string {
  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`, "utf8").toString("base64")}`;
}

function readAccessToken(payload: unknown): string {
  if (!isRecord(payload) || typeof payload.access_token !== "string") {
    throw providerFailure(
      "malformed",
      "BOG authentication returned an unexpected response.",
    );
  }

  const accessToken = payload.access_token.trim();

  if (!accessToken) {
    throw providerFailure(
      "malformed",
      "BOG authentication returned an unexpected response.",
    );
  }

  if (
    payload.token_type !== undefined &&
    (typeof payload.token_type !== "string" ||
      payload.token_type.trim().toLowerCase() !== "bearer")
  ) {
    throw providerFailure(
      "malformed",
      "BOG authentication returned an unexpected response.",
    );
  }

  return accessToken;
}

export async function getBogAccessToken(): Promise<string> {
  const { clientId, clientSecret } = getBogClientCredentials();
  const body = new URLSearchParams();
  body.set("grant_type", "client_credentials");

  let response: Response;

  try {
    response = await fetch(getBogOAuthTokenUrl(), {
      method: "POST",
      headers: {
        Authorization: basicAuthHeader(clientId, clientSecret),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      cache: "no-store",
    });
  } catch (cause) {
    throw providerFailure(
      "network",
      "BOG authentication request failed.",
      undefined,
      cause,
    );
  }

  if (!response.ok) {
    const oauthError = await readFailedOAuthErrorCode(response);

    console.error("BOG authentication failed", {
      kind: "authentication",
      status: response.status,
      oauthError,
    });

    throw providerFailure(
      "authentication",
      "BOG authentication failed.",
      response.status,
    );
  }

  const payload = await readJsonBody(response);
  return readAccessToken(payload);
}
