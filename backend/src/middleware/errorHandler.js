// Stack traces and raw server-error messages are only shown when NODE_ENV is explicitly
// 'development'. Opt-in, so a host that leaves NODE_ENV unset never leaks them to visitors.
const isDev = process.env.NODE_ENV === 'development';

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose Bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = { message, statusCode: 404 };
  }

  // Mongoose Duplicate Key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value entered: ${field}. Please use another value.`;
    error = { message, statusCode: 400 };
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // Upload errors (file too large, too many files...) are the client's to fix
  if (err.name === 'MulterError') {
    error = { message: err.code === 'LIMIT_FILE_SIZE' ? 'Image is too large (max 10MB).' : err.message, statusCode: 400 };
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    error = { message: 'Not authorized, invalid token', statusCode: 401 };
  }
  if (err.name === 'TokenExpiredError') {
    error = { message: 'Not authorized, token expired', statusCode: 401 };
  }

  // Body-parser and the router mark client errors with `status` rather than `statusCode`
  const statusCode = error.statusCode || err.statusCode || err.status || 500;

  // Always log on the server (Render logs): full stack for real failures, one line for client errors.
  // The URL is passed as an argument, never in the format string, so a "%f" in it can't garble the log.
  if (statusCode >= 500) {
    console.error('%s %s ->', req.method, req.originalUrl, err);
  } else {
    console.warn('%s %s -> %d %s', req.method, req.originalUrl, statusCode, error.message);
  }

  // Client errors (4xx) keep their message; unexpected failures don't expose internals
  const message = statusCode >= 500 && !isDev ? 'Server Error' : error.message || 'Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(isDev && { stack: err.stack })
  });
};

module.exports = errorHandler;
