const { apiLimiter, authLimiter } = require('../../middleware/ratelimiter');

describe('Rate Limiter Configuration', () => {
  it('should export rate limit middlewares', () => {
    expect(typeof apiLimiter).toBe('function');
    expect(typeof authLimiter).toBe('function');
  });
});
