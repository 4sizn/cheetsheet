export interface CustomErrorOptions<T> extends ErrorOptions {
  cause: T;
}

export interface SystemErrorCause {
  errorCode: string;
  errorMessage: string;
}

export class SystemError extends Error {
  public readonly cause: SystemErrorCause;

  constructor(message: string, options: CustomErrorOptions<SystemErrorCause>) {
    super(message, options);
    this.name = "SystemError";
    this.cause = options.cause;
  }
}
