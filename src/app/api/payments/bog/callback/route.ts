import { NextResponse } from "next/server";

import { processBogPaymentCallback } from "@/lib/payments/bog/process-callback";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const bytes = new Uint8Array(await request.arrayBuffer());
    const signature = request.headers.get("callback-signature") ?? "";
    const result = await processBogPaymentCallback(bytes, signature);

    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
