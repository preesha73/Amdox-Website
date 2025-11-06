const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Rate limit configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Stricter limits for certificate verification
const certificateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50 // limit each IP to 50 certificate checks per hour
});

// Even stricter for PDF downloads
const pdfLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20 // limit each IP to 20 PDF downloads per hour
});

// Configure security middleware
const configureSecurityMiddleware = (app) => {
  // Basic security headers
  app.use(helmet());
  
  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
      if (req.header('x-forwarded-proto') !== 'https') {
        res.redirect(`https://${req.header('host')}${req.url}`);
      } else {
        next();
      }
    });
  }

  // Apply rate limiting
  app.use('/api/', limiter);
  app.use('/api/certificates/:certId([^/]+)$', certificateLimiter); // Verification endpoint
  app.use('/api/certificates/:certId/pdf', pdfLimiter); // PDF download endpoint

  // Additional security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
};

module.exports = {
  configureSecurityMiddleware,
  certificateLimiter,
  pdfLimiter
};