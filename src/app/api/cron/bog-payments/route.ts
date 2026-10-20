import { NextResponse } from "next/server";

import {
  authorizeBogReconciliationRequest,
  runBogPaymentReconciliation,
} from "@/lib/payments/bog/reconcile-schedule";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<NextResponse> {
  if (
    !authorizeBogReconciliationRequest(
      request.headers.get("authorization"),
      process.env.CRON_SECRET,
    )
  ) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const summary = await runBogPaymentReconciliation();
    return NextResponse.json(summary);
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
