const rateLimit = require('express-rate-limit');

// General limiter for most routes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter limiter for Auth routes (Login/Signup)
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 login attempts per hour
    message: 'Too many login attempts. Please try again later.'
});

// Limiter for expensive ML analysis endpoint, keyed by user UID
const analyzeLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each user to 10 analyses per hour
    message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many analysis requests. Please try again later.' } },
    keyGenerator: (req) => {
      if (req.user && req.user.uid) return req.user.uid;
      return req.ip || req.connection.remoteAddress || 'unknown';
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { apiLimiter, authLimiter, analyzeLimiter };