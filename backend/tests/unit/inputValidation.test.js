const validate = require('../../middleware/validate');
const { z } = require('zod');

// We test the middleware behavior, which requires a real Zod schema
const mockSchema = {
  body: z.object({
    username: z.string().min(3),
  })
};

describe('Input Validation Middleware', () => {
  let req;
  let res;
  let next;
  let validateMiddleware;

  beforeEach(() => {
    req = { body: {}, query: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    validateMiddleware = validate(mockSchema);
  });

  it('should call next() for valid input', () => {
    req.body = { username: 'validUser' };
    validateMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 400 for invalid input', () => {
    req.body = { username: 'ab' }; // Too short, fails schema
    validateMiddleware(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: expect.any(Object)
    }));
  });
});
