import { createAdminClient } from "@/lib/supabase/admin";
import { isRecord } from "@/lib/payments/bog/http";

export const MARK_BOG_CREATE_ORDER_ATTEMPTED_RPC =
  "mark_bog_create_order_attempted";
export const RELEASE_UNSENT_ONLINE_ORDER_RPC =
  "release_unsent_online_order";

export class BogCreateOrderAttemptNotDeployed extends Error {
  constructor() {
    super("bog-create-order-attempt-not-deployed");
    this.name = "BogCreateOrderAttemptNotDeployed";
  }
}

export class BogCreateOrderAttemptBlocked extends Error {
  constructor() {
    super("bog-create-order-attempt-blocked");
    this.name = "BogCreateOrderAttemptBlocked";
  }
}

type RpcError = {
  code?: string | null;
  message?: string | null;
};

export function isMissingReleaseRpc(error: RpcError): boolean {
  const code = error.code ?? "";
  const message = error.message ?? "";

  return (
    code === "PGRST202" ||
    code === "42883" ||
    message.includes("Could not find the function")
  );
}

export function readReleaseUnsentOnlineOrderResult(data: unknown): boolean {
  if (!isRecord(data) || typeof data.result !== "string") {
    return false;
  }

  return data.result === "released" || data.result === "already_released";
}

function readMarkResult(data: unknown): "attempted" | "already_attempted" | "blocked" | null {
  if (!isRecord(data) || typeof data.result !== "string") {
    return null;
  }

  if (
    data.result === "attempted" ||
    data.result === "already_attempted" ||
    data.result === "blocked"
  ) {
    return data.result;
  }

  return null;
}

export async function markBogCreateOrderAttempted(
  orderId: string,
): Promise<void> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc(
    MARK_BOG_CREATE_ORDER_ATTEMPTED_RPC,
    { p_order_id: orderId },
  );

  if (error) {
    console.error("mark BOG create-order attempt failed", {
      code: error.code ?? null,
    });

    if (isMissingReleaseRpc(error)) {
      throw new BogCreateOrderAttemptNotDeployed();
    }

    throw new BogCreateOrderAttemptBlocked();
  }

  const result = readMarkResult(data);

  if (result === "attempted" || result === "already_attempted") {
    return;
  }

  throw new BogCreateOrderAttemptBlocked();
}

export async function releaseUnsentOnlineOrder(
  orderId: string,
): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc(
    RELEASE_UNSENT_ONLINE_ORDER_RPC,
    { p_order_id: orderId },
  );

  if (error) {
    console.error("release unsent online order failed", {
      code: error.code ?? null,
    });
    return false;
  }

  return readReleaseUnsentOnlineOrderResult(data);
}
