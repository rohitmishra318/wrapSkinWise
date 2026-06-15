const Brand = require('../models/Brand');
const BrandApiLog = require('../models/BrandApiLog');

const brandAuthMiddleware = async (req, res, next) => {
  const apiKey = req.headers['x-brand-api-key'];
  if (!apiKey) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing X-Brand-API-Key header' } });
  }

  try {
    const brand = await Brand.findOne({ apiKey, isActive: true });
    if (!brand) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or inactive API key' } });
    }

    req.brand = brand;
    const start = Date.now();

    res.on('finish', async () => {
      const latencyMs = Date.now() - start;
      await BrandApiLog.create({
        brandId: brand._id,
        endpoint: req.originalUrl,
        requestPayload: req.method === 'POST' || req.method === 'PUT' ? req.body : {},
        responseCode: res.statusCode,
        latencyMs
      });
      brand.callsThisMonth += 1;
      await brand.save();
    });

    next();
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

module.exports = brandAuthMiddleware;
