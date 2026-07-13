const express = require('express');
const brandController = require('../controllers/brandController');
const brandAuthMiddleware = require('../middleware/brandAuthMiddleware');
const validate = require('../middleware/validate');
const { recommendSchema, validateKeySchema } = require('../schemas/brandSchema');

/**
 * @swagger
 * tags:
 *   name: Partner
 *   description: Partner and brand integrations
 */

const router = express.Router();

router.use(brandAuthMiddleware);

/**
 * @swagger
 * /api/v1/partner/recommend:
 *   post:
 *     summary: Recommend products
 *     tags: [Partner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/recommend', validate(recommendSchema), brandController.recommendProducts);
/**
 * @swagger
 * /api/v1/partner/analytics/overview:
 *   get:
 *     summary: Get partner analytics overview
 *     tags: [Partner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/analytics/overview', brandController.getAnalyticsOverview);
/**
 * @swagger
 * /api/v1/partner/analytics/skin-distribution:
 *   get:
 *     summary: Get partner skin distribution
 *     tags: [Partner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/analytics/skin-distribution', brandController.getSkinDistribution);
/**
 * @swagger
 * /api/v1/partner/validate-key:
 *   post:
 *     summary: Validate partner API key
 *     tags: [Partner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/validate-key', validate(validateKeySchema), brandController.validateKey);




module.exports = router;
