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

// Mock the Models
jest.mock('../../models/DailyCheckin');
jest.mock('../../models/User');

// Import the app AFTER mocking
const app = require('../../server');
const DailyCheckin = require('../../models/DailyCheckin');
const User = require('../../models/User');

describe('User API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/users/checkin', () => {
    it('should successfully create or update a daily checkin', async () => {
      const mockPayload = {
        sleepQuality: 'good',
        stressLevel: 'low',
        waterIntake: 'high',
        skinFeel: 'oily'
      };

      DailyCheckin.findOneAndUpdate.mockResolvedValue({ ...mockPayload, user: 'test-user-uid' });
      User.findOneAndUpdate.mockResolvedValue({});

      const res = await request(app)
        .post('/api/users/checkin')
        .send(mockPayload)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(DailyCheckin.findOneAndUpdate).toHaveBeenCalled();
      expect(User.findOneAndUpdate).toHaveBeenCalled();
    });

    it('should return 400 if validation fails', async () => {
       // Since the checkinSchema expects strings but they are all optional, 
       // let's send an integer for sleepQuality to trigger a Zod type error.
       const mockPayload = {
         sleepQuality: 123
       };

       const res = await request(app)
        .post('/api/users/checkin')
        .send(mockPayload)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
