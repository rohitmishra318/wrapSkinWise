const express = require('express');
const brandController = require('../controllers/brandController');
const brandAuthMiddleware = require('../middleware/brandAuthMiddleware');

const router = express.Router();

router.use(brandAuthMiddleware);

router.post('/recommend', brandController.recommendProducts);
router.get('/analytics/overview', brandController.getAnalyticsOverview);
router.get('/analytics/skin-distribution', brandController.getSkinDistribution);
router.post('/validate-key', brandController.validateKey);




module.exports = router;
