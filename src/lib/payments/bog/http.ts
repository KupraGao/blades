import { BogError, type BogErrorKind } from "./errors";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function readJsonBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new BogError(
      "malformed",
      "BOG returned a malformed response.",
      { status: response.status },
    );
  }
}

export function providerFailure(
  kind: BogErrorKind,
  message: string,
  status?: number,
  cause?: unknown,
): BogError {
  return new BogError(kind, message, { status, cause });
}
