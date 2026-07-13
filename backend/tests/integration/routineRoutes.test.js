const request = require('supertest');
const mongoose = require('mongoose');

// --- MOCKS ---
// Mock mongoose connect so it doesn't try to hit DB when server.js is imported
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    connect: jest.fn().mockResolvedValue(true),
    connection: { readyState: 1 }
  };
});

// Mock Redis
jest.mock('../../config/redis', () => ({
  get: jest.fn().mockResolvedValue(null),
  setex: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue('OK'),
}));

// Mock Bull queues
jest.mock('../../config/bull', () => ({
  analysisQueue: { 
    add: jest.fn(),
    process: jest.fn(),
    on: jest.fn()
  }
}));

// Mock uuid due to Jest ESM issues
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-1234')
}));

// Mock auth middleware to bypass Firebase and inject fake user
jest.mock('../../middleware/authMiddleware', () => {
  return (req, res, next) => {
    req.user = { uid: 'test-user-uid', email: 'test@example.com' };
    next();
  };
});

// Mock the Routine Model
jest.mock('../../models/Routine');

// Import the app AFTER mocking
const app = require('../../server');
const Routine = require('../../models/Routine');

describe('Routine API Integration', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/routine', () => {
    it('should return routines for the authenticated user', async () => {
      const mockRoutines = [
        { _id: '123', routineType: 'morning' },
        { _id: '124', routineType: 'night' }
      ];
      
      // Mock Mongoose chain: Routine.find(filter).sort({ createdAt: -1 })
      const mockSort = jest.fn().mockResolvedValue(mockRoutines);
      Routine.find.mockReturnValue({ sort: mockSort });

      const res = await request(app)
        .get('/api/routine')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockRoutines);
      expect(Routine.find).toHaveBeenCalledWith({ user: 'test-user-uid', isActive: true });
    });
  });

  describe('POST /api/routine/generate', () => {
    it('should return 400 Validation Error when payload is missing required fields', async () => {
      // The generate schema expects routineType to be 'morning' or 'night'.
      // Sending an invalid string should trigger the Zod validation middleware.
      const res = await request(app)
        .post('/api/routine/generate')
        .send({ routineType: 'invalid_type' }) 
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
