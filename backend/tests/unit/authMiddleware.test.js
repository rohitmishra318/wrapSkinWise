const authMiddleware = require('../../middleware/authMiddleware');
const admin = require('../../config/firebaseAdmin');

jest.mock('../../config/firebaseAdmin', () => ({
  auth: jest.fn().mockReturnValue({
    verifyIdToken: jest.fn(),
  }),
}));

describe('Auth Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should return 401 if no authorization header is present', async () => {
    await authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Authorization token missing' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if authorization header is not Bearer', async () => {
    req.headers.authorization = 'Basic token';
    await authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Authorization token missing' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid or expired', async () => {
    req.headers.authorization = 'Bearer invalid_token';
    admin.auth().verifyIdToken.mockRejectedValue(new Error('Invalid token'));
    
    await authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() and attach user if token is valid', async () => {
    req.headers.authorization = 'Bearer valid_token';
    const mockDecodedToken = {
      uid: 'user123',
      email: 'test@test.com',
      name: 'Test User'
    };
    admin.auth().verifyIdToken.mockResolvedValue(mockDecodedToken);

    await authMiddleware(req, res, next);
    
    expect(req.user).toBeDefined();
    expect(req.user.uid).toBe('user123');
    expect(req.user.email).toBe('test@test.com');
    expect(req.user.name).toBe('Test User');
    expect(next).toHaveBeenCalled();
  });
});
