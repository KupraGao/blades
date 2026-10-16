import { createPublicKey, verify, type KeyObject } from "crypto";

import { assertBogServerOnly } from "./config";
import { providerFailure } from "./http";

// Working assumption for this helper. The payments callback page does not
// state that Callback-Signature is Base64.
const SIGNATURE_BASE64 =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

const BOG_CALLBACK_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu4RUyAw3+CdkS3ZNILQh
zHI9Hemo+vKB9U2BSabppkKjzjjkf+0Sm76hSMiu/HFtYhqWOESryoCDJoqffY0Q
1VNt25aTxbj068QNUtnxQ7KQVLA+pG0smf+EBWlS1vBEAFbIas9d8c9b9sSEkTrr
TYQ90WIM8bGB6S/KLVoT1a7SnzabjoLc5Qf/SLDG5fu8dH8zckyeYKdRKSBJKvhx
tcBuHV4f7qsynQT+f2UYbESX/TLHwT5qFWZDHZ0YUOUIvb8n7JujVSGZO9/+ll/g
4ZIWhC1MlJgPObDwRkRd8NFOopgxMcMsDIZIoLbWKhHVq67hdbwpAq9K9WMmEhPn
PwIDAQAB
-----END PUBLIC KEY-----`;

function rejectSignature(): never {
  throw providerFailure("malformed", "BOG callback signature is invalid.");
}

function decodeBase64Signature(signature: string): Buffer {
  const trimmed = signature?.trim() ?? "";

  if (!trimmed || !SIGNATURE_BASE64.test(trimmed)) {
    rejectSignature();
  }

  const decoded = Buffer.from(trimmed, "base64");

  if (decoded.length === 0) {
    rejectSignature();
  }

  return decoded;
}

function rawBodyBytes(rawBody: Buffer | Uint8Array): Buffer {
  if (Buffer.isBuffer(rawBody)) {
    return rawBody;
  }

  if (rawBody instanceof Uint8Array) {
    return Buffer.from(rawBody);
  }

  rejectSignature();
}

export function verifyBogCallbackSignature(
  rawBody: Buffer | Uint8Array,
  signature: string,
  publicKeyPem: string = BOG_CALLBACK_PUBLIC_KEY,
): void {
  assertBogServerOnly();

  const body = rawBodyBytes(rawBody);
  const signatureBytes = decodeBase64Signature(signature);
  const keyPem = publicKeyPem.trim();

  if (!keyPem) {
    throw providerFailure(
      "configuration",
      "BOG callback public key is invalid.",
    );
  }

  let key: KeyObject;

  try {
    key = createPublicKey(keyPem);
  } catch (cause) {
    throw providerFailure(
      "configuration",
      "BOG callback public key is invalid.",
      undefined,
      cause,
    );
  }

  let valid = false;

  try {
    valid = verify("RSA-SHA256", body, key, signatureBytes);
  } catch {
    rejectSignature();
  }

  if (!valid) {
    rejectSignature();
  }
}
