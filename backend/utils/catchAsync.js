/**
 * Wrapper for async route handlers. 
 * Catches unhandled promise rejections and passes them to next(err) 
 * so they reach the global error handler.
 */
const catchAsync = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
