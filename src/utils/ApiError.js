class ApiError extends Error {
  constructor(
    statusCode,
    mesaage = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(mesaage);
    this.statusCode = statusCode;
    this.data = null;
    this.message = mesaage;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export {ApiError}