/**
 * Custom error handler middleware
 * Handles errors consistently and securely across the application
 */

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not found middleware - handles 404 for undefined routes
 */
export const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route not found: ${req.originalUrl}`);
  next(error);
};

/**
 * Central error handling middleware
 * @param {Error} err - Error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const errorHandler = (err, req, res, next) => {
  // Determine status code
  let statusCode = err.statusCode || err.status || 500;

  // Ensure valid status code
  if (statusCode < 400 || statusCode > 599) {
    statusCode = 500;
  }

  // Build response object
  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
  };

  // Include stack trace only in development (not production)
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    console.error('Error:', err);
  } else {
    // In production, don't expose stack traces
    // For operational errors, show the message; for others, show generic message
    if (!err.isOperational) {
      response.message = 'Internal Server Error';
      console.error('Unexpected error:', err);
    }
  }

  res.status(statusCode).json(response);
};
