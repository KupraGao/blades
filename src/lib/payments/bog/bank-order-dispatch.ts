export type BankOrderDispatch = "unsent" | "uncertain";

const DISPATCH = "bankOrderDispatch";

export function tagBankOrderDispatch<T extends Error>(
  error: T,
  dispatch: BankOrderDispatch,
): T {
  Object.defineProperty(error, DISPATCH, {
    value: dispatch,
    enumerable: false,
  });
  return error;
}

export function readBankOrderDispatch(
  error: unknown,
): BankOrderDispatch | null {
  if (typeof error !== "object" || error === null || !(DISPATCH in error)) {
    return null;
  }

  const value = (error as { bankOrderDispatch?: unknown }).bankOrderDispatch;

  if (value === "unsent" || value === "uncertain") {
    return value;
  }

  return null;
}
