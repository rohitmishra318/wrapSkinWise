const express = require('express');
const brandController = require('../controllers/brandController');
const brandAuthMiddleware = require('../middleware/brandAuthMiddleware');
const validate = require('../middleware/validate');
const { recommendSchema, validateKeySchema } = require('../schemas/brandSchema');

const router = express.Router();

router.use(brandAuthMiddleware);

router.post('/recommend', validate(recommendSchema), brandController.recommendProducts);
router.get('/analytics/overview', brandController.getAnalyticsOverview);
router.get('/analytics/skin-distribution', brandController.getSkinDistribution);
router.post('/validate-key', validate(validateKeySchema), brandController.validateKey);




module.exports = router;
