const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'Something went wrong';

  // Handle specific database/validation errors if needed (e.g., CastError, MongoError)
  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = `Invalid ${err.path}: ${err.value}.`;
  }

  // Log error
  if (statusCode >= 500) {
    // Log unexpected bugs as errors
    logger.error('Unhandled Error', { 
      error: err.message, 
      stack: err.stack,
      requestId: req.requestId,
      path: req.originalUrl
    });
  } else {
    // Log operational errors as warnings or info
    logger.warn('Operational Error', {
      error: err.message,
      code,
      requestId: req.requestId,
      path: req.originalUrl
    });
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      // Only include stack trace in development
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = errorHandler;
