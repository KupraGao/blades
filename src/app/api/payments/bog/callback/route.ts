import { NextResponse } from "next/server";

import { verifyBogCallbackSignature } from "@/lib/payments/bog/callback";
import { BogError } from "@/lib/payments/bog/errors";
import { getBogReceipt, type BogReceipt } from "@/lib/payments/bog/receipt";

function rejected(): NextResponse {
  return NextResponse.json({ error: "rejected" }, { status: 400 });
}

function unavailable(): NextResponse {
  return NextResponse.json({ error: "unavailable" }, { status: 503 });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readCallbackOrderId(bytes: Uint8Array): string | null {
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    const payload: unknown = JSON.parse(text);

    if (
      !isRecord(payload) ||
      payload.event !== "order_payment" ||
      !isRecord(payload.body) ||
      typeof payload.body.order_id !== "string"
    ) {
      return null;
    }

    const orderId = payload.body.order_id.trim();
    return orderId.length > 0 ? orderId : null;
  } catch {
    return null;
  }
}

function receiptFailure(error: unknown): NextResponse {
  if (error instanceof BogError && error.kind === "malformed") {
    return rejected();
  }

  return unavailable();
}

// A 200 would mean the bank callback was accepted. Receipt data is not stored
// and is not compared with a local order, so completed is not a paid status.
export async function POST(request: Request): Promise<NextResponse> {
  const bytes = new Uint8Array(await request.arrayBuffer());
  const signature = request.headers.get("callback-signature") ?? "";

  try {
    verifyBogCallbackSignature(bytes, signature);
  } catch {
    return rejected();
  }

  const orderId = readCallbackOrderId(bytes);

  if (!orderId) {
    return rejected();
  }

  let receipt: BogReceipt;

  try {
    receipt = await getBogReceipt(orderId);
  } catch (error) {
    return receiptFailure(error);
  }

  const statusKey = receipt.orderStatusKey;
  const externalOrderId = receipt.externalOrderId;
  const requestAmount = receipt.requestAmount;
  const transferAmount = receipt.transferAmount;
  const currencyCode = receipt.currencyCode;

  if (
    receipt.orderId !== orderId ||
    externalOrderId.trim().length === 0 ||
    requestAmount.trim().length === 0 ||
    transferAmount.trim().length === 0 ||
    currencyCode.trim().length === 0 ||
    statusKey.trim().length === 0
  ) {
    return rejected();
  }

  return unavailable();
}
