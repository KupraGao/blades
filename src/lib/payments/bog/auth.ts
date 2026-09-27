import { BOG_OAUTH_TOKEN_URL, getBogClientCredentials } from "./config";
import { providerFailure, isRecord, readJsonBody } from "./http";

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
    response = await fetch(BOG_OAUTH_TOKEN_URL, {
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
    throw providerFailure(
      "authentication",
      "BOG authentication failed.",
      response.status,
    );
  }

  const payload = await readJsonBody(response);
  return readAccessToken(payload);
}
