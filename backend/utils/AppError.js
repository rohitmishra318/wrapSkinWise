class AppError extends Error {
  constructor(message, statusCode, code = 'APP_ERROR') {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.code = code;
    this.isOperational = true; // Indicates it's a predicted error, not a programming bug

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
