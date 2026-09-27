export type BogErrorKind =
  | "configuration"
  | "authentication"
  | "network"
  | "malformed";

export class BogError extends Error {
  readonly kind: BogErrorKind;
  readonly status?: number;

  constructor(
    kind: BogErrorKind,
    message: string,
    options?: { status?: number; cause?: unknown },
  ) {
    super(message);
    this.name = "BogError";
    this.kind = kind;

    if (options?.status !== undefined) {
      this.status = options.status;
    }

    if (options?.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}
