const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Route Not Found',
    message: `Cannot ${req.method} ${req.url}`
  });
};

const globalErrorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.name || 'Error'}: ${err.message}`);

  // Mongoose Schema Validation Error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Mongoose schema validation failed',
      details: details
    });
  }

  // Mongoose CastError (Invalid ID type casting)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID',
      message: `Invalid format for path '${err.path}'`
    });
  }

  // Duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      error: 'Duplicate Key Error',
      message: 'Resource with duplicate key already exists'
    });
  }

  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'Something went wrong on the server'
  });
};

module.exports = {
  notFoundHandler,
  globalErrorHandler
};
