const Brand = require('../models/Brand');
const BrandApiLog = require('../models/BrandApiLog');
const SkinAnalysis = require('../models/SkinAnalysis');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const recommendProducts = catchAsync(async (req, res, next) => {
  const { skinProfile, context, catalogProductTypes, budget, routineType } = req.body;
  
  const recommendations = catalogProductTypes.map((type, idx) => ({
    productType: type,
    routineStep: `${routineType === 'morning' ? 'AM' : 'PM'} ${type}`,
    idealIngredients: ['niacinamide', 'hyaluronic acid', 'zinc'],
    avoidIngredients: ['fragrance', 'alcohol denat'],
    rationale: 'Lightweight gel formula suited for oily T-zone...',
    confidence: 0.91,
    stepOrder: idx + 1
  }));

  res.json({ success: true, data: { recommendations, routineContext: context, requestId: `req_${Date.now()}` } });
});

const getAnalyticsOverview = catchAsync(async (req, res, next) => {
  const brandId = req.brand._id;
  const count = await User.countDocuments({ brandId });
  
  if (count < 50) {
    throw new AppError('INSUFFICIENT_COHORT_SIZE', 400, 'INSUFFICIENT_COHORT_SIZE');
  }

  res.json({ success: true, data: { totalUsers: count, avgOverallScore: 72 } });
});

const getSkinDistribution = catchAsync(async (req, res, next) => {
  const brandId = req.brand._id;
  const count = await User.countDocuments({ brandId });
  
  if (count < 50) {
    throw new AppError('INSUFFICIENT_COHORT_SIZE', 400, 'INSUFFICIENT_COHORT_SIZE');
  }
  
  res.json({ success: true, data: { distribution: [] } });
});

const validateKey = catchAsync(async (req, res, next) => {
  res.json({ 
    success: true, 
    data: { 
      valid: true, 
      brandName: req.brand.name, 
      tier: req.brand.tier, 
      callsRemaining: req.brand.monthlyCallLimit - req.brand.callsThisMonth 
    } 
  });
});

module.exports = {
  recommendProducts,
  getAnalyticsOverview,
  getSkinDistribution,
  validateKey
};
