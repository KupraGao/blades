import assert from "node:assert/strict";

import { getBogAccessToken, readBogOAuthErrorCode } from "./auth";
import { BogError } from "./errors";

const SANDBOX_OAUTH_URL =
  "https://oauth2-sandbox.bog.ge/auth/realms/bog/protocol/openid-connect/token";

const ENV_KEYS = [
  "BOG_ENVIRONMENT",
  "BOG_CREDENTIAL_ENVIRONMENT",
  "BOG_CLIENT_ID",
  "BOG_CLIENT_SECRET",
] as const;

const sandboxEnv = {
  BOG_ENVIRONMENT: "sandbox",
  BOG_CREDENTIAL_ENVIRONMENT: "sandbox",
  BOG_CLIENT_ID: "client-marker",
  BOG_CLIENT_SECRET: "secret-marker",
} as const;

const LEAKS = [
  "client-marker",
  "secret-marker",
  "DESCRIPTION_SHOULD_NOT_LEAK",
  "TOKEN_SHOULD_NOT_LEAK",
  "RAW_BODY_SHOULD_NOT_LEAK",
  "SECRET_IN_ERROR_FIELD",
  "Authorization",
  "Basic ",
];

function assertNoLeaks(value: unknown): void {
  const serialized = JSON.stringify(value);
  for (const leak of LEAKS) {
    assert.equal(serialized.includes(leak), false);
  }
}

assert.equal(
  readBogOAuthErrorCode({ error: "invalid_client" }),
  "invalid_client",
);
assert.equal(
  readBogOAuthErrorCode({
    error: " invalid_request ",
    error_description: "DESCRIPTION_SHOULD_NOT_LEAK",
  }),
  "invalid_request",
);
assert.equal(readBogOAuthErrorCode({ error: "invalid_grant" }), "invalid_grant");
assert.equal(
  readBogOAuthErrorCode({ error: "unauthorized_client" }),
  "unauthorized_client",
);
assert.equal(
  readBogOAuthErrorCode({ error: "unsupported_grant_type" }),
  "unsupported_grant_type",
);
assert.equal(readBogOAuthErrorCode({ error: "invalid_scope" }), "invalid_scope");
assert.equal(
  readBogOAuthErrorCode({ error: "SECRET_IN_ERROR_FIELD" }),
  "unknown_oauth_error",
);
assert.equal(
  readBogOAuthErrorCode({ error: "Invalid_Client" }),
  "unknown_oauth_error",
);
assert.equal(readBogOAuthErrorCode({ error: "" }), "unknown_oauth_error");
assert.equal(readBogOAuthErrorCode({ error: 400 }), "unknown_oauth_error");
assert.equal(
  readBogOAuthErrorCode({ error: ["invalid_client"] }),
  "unknown_oauth_error",
);
assert.equal(
  readBogOAuthErrorCode({ error_description: "DESCRIPTION_SHOULD_NOT_LEAK" }),
  "unknown_oauth_error",
);
assert.equal(readBogOAuthErrorCode(null), "unknown_oauth_error");
assert.equal(readBogOAuthErrorCode("invalid_client"), "unknown_oauth_error");

async function withSandbox(
  run: () => Promise<void>,
): Promise<void> {
  const previous = ENV_KEYS.map(
    (key) => [key, process.env[key]] as const,
  );
  const previousFetch = globalThis.fetch;

  for (const [key, value] of Object.entries(sandboxEnv)) {
    process.env[key] = value;
  }

  try {
    await run();
  } finally {
    globalThis.fetch = previousFetch;

    for (const [key, value] of previous) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

async function captureFailure(
  response: Response,
): Promise<{ error: unknown; log: unknown }> {
  const logs: unknown[] = [];
  const originalConsoleError = console.error;
  console.error = (_message: unknown, details: unknown) => {
    logs.push(details);
  };

  let requestUrl = "";
  let contentType = "";
  let requestBody = "";

  globalThis.fetch = async (input, init) => {
    requestUrl = String(input);
    const headers = new Headers(init?.headers);
    contentType = headers.get("content-type") ?? "";
    requestBody = String(init?.body ?? "");
    return response;
  };

  let error: unknown;

  try {
    await getBogAccessToken();
  } catch (caught) {
    error = caught;
  } finally {
    console.error = originalConsoleError;
  }

  assert.equal(requestUrl, SANDBOX_OAUTH_URL);
  assert.equal(contentType, "application/x-www-form-urlencoded");
  assert.equal(requestBody, "grant_type=client_credentials");
  assert.equal(logs.length, 1);

  return { error, log: logs[0] };
}

async function main(): Promise<void> {
  await withSandbox(async () => {
    const { error, log } = await captureFailure(
      Response.json(
        {
          error: "invalid_client",
          error_description: "DESCRIPTION_SHOULD_NOT_LEAK",
          access_token: "TOKEN_SHOULD_NOT_LEAK",
        },
        { status: 400 },
      ),
    );

    assert.ok(error instanceof BogError);
    assert.equal(error.kind, "authentication");
    assert.equal(error.status, 400);
    assert.equal(error.message, "BOG authentication failed.");
    assert.deepEqual(log, {
      kind: "authentication",
      status: 400,
      oauthError: "invalid_client",
    });
    assertNoLeaks(log);
    assert.equal(error.message.includes("DESCRIPTION_SHOULD_NOT_LEAK"), false);
    assert.equal(error.message.includes("TOKEN_SHOULD_NOT_LEAK"), false);
  });

  await withSandbox(async () => {
    const { error, log } = await captureFailure(
      Response.json(
        { error: "SECRET_IN_ERROR_FIELD" },
        { status: 400 },
      ),
    );

    assert.ok(error instanceof BogError);
    assert.equal(error.kind, "authentication");
    assert.equal(error.status, 400);
    assert.deepEqual(log, {
      kind: "authentication",
      status: 400,
      oauthError: "unknown_oauth_error",
    });
    assertNoLeaks(log);
  });

  await withSandbox(async () => {
    const { error, log } = await captureFailure(
      new Response("RAW_BODY_SHOULD_NOT_LEAK", {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      }),
    );

    assert.ok(error instanceof BogError);
    assert.equal(error.kind, "authentication");
    assert.equal(error.status, 400);
    assert.deepEqual(log, {
      kind: "authentication",
      status: 400,
      oauthError: "unknown_oauth_error",
    });
    assertNoLeaks(log);
  });

  await withSandbox(async () => {
    const logs: unknown[] = [];
    const originalConsoleError = console.error;
    console.error = () => {
      logs.push("logged");
    };
    globalThis.fetch = async () =>
      Response.json({
        access_token: "TOKEN_SHOULD_NOT_LEAK",
        token_type: "Bearer",
      });

    try {
      const token = await getBogAccessToken();
      assert.equal(token, "TOKEN_SHOULD_NOT_LEAK");
      assert.equal(logs.length, 0);
    } finally {
      console.error = originalConsoleError;
    }
  });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
