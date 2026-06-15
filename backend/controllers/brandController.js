const Brand = require('../models/Brand');
const BrandApiLog = require('../models/BrandApiLog');
const SkinAnalysis = require('../models/SkinAnalysis');
const User = require('../models/User');

const recommendProducts = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

const getAnalyticsOverview = async (req, res) => {
  try {
    const brandId = req.brand._id;
    const count = await User.countDocuments({ brandId });
    if (count < 50) {
      return res.status(400).json({ success: false, error: { code: 'INSUFFICIENT_COHORT_SIZE', message: 'INSUFFICIENT_COHORT_SIZE' } });
    }

    res.json({ success: true, data: { totalUsers: count, avgOverallScore: 72 } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

const getSkinDistribution = async (req, res) => {
  try {
    const brandId = req.brand._id;
    const count = await User.countDocuments({ brandId });
    if (count < 50) {
      return res.status(400).json({ success: false, error: { code: 'INSUFFICIENT_COHORT_SIZE', message: 'INSUFFICIENT_COHORT_SIZE' } });
    }
    
    res.json({ success: true, data: { distribution: [] } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

const validateKey = async (req, res) => {
  try {
    res.json({ success: true, data: { valid: true, brandName: req.brand.name, tier: req.brand.tier, callsRemaining: req.brand.monthlyCallLimit - req.brand.callsThisMonth } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

module.exports = {
  recommendProducts,
  getAnalyticsOverview,
  getSkinDistribution,
  validateKey
};
