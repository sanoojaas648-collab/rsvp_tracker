class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  if (statusCode === 500) {
    console.error('[unhandled error]', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }

  return res.status(statusCode).json({ message: err.message || 'Request failed.' });
}

module.exports = { ApiError, notFoundHandler, errorHandler };
