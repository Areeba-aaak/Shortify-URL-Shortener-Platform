export const notFoundMiddleware = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorMiddleware = (error, req, res, next) => {
  console.error('❌ Server Error:', error);

  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      error.message || 'Internal server error',
  });
};