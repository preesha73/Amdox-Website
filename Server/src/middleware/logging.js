const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const logDir = path.join(__dirname, '..', '..', 'logs');
require('fs').mkdirSync(logDir, { recursive: true });

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Write to all logs with level 'info' and below to `combined.log`
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs error (and below) to `error.log`
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

// If we're not in production, log to console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Logging middleware
const requestLogger = (req, res, next) => {
  // Log at start of request
  const start = Date.now();
  
  // Log when response finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      ip: req.ip,
      user: req.user ? req.user._id : 'anonymous'
    };

    // Log uploads and certificate operations with more detail
    if (req.path.includes('/admin/import-students')) {
      log.fileName = req.file?.originalname;
      log.fileSize = req.file?.size;
    } else if (req.path.includes('/certificates/')) {
      log.certId = req.params.certId;
    }

    // Error responses
    if (res.statusCode >= 400) {
      logger.error('Request failed', log);
    } else {
      logger.info('Request completed', log);
    }
  });

  next();
};

module.exports = {
  logger,
  requestLogger
};