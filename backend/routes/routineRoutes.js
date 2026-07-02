const express = require('express');
const routineController = require('../controllers/routineController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { generateRoutineSchema, productReactionSchema } = require('../schemas/routineSchema');
const Routine = require('../models/Routine');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Routine
 *   description: Skincare routine generation and tracking
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/routine:
 *   get:
 *     summary: Get all active routines for the user
 *     tags: [Routine]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of routines
 */
router.get('/', routineController.getRoutines);

/**
 * @swagger
 * /api/routine/generate:
 *   post:
 *     summary: Generate a new skincare routine based on analysis
 *     tags: [Routine]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               analysisId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Generated routine
 */
router.post('/generate', validate(generateRoutineSchema), routineController.createRoutineGeneration);

/**
 * @swagger
 * /api/routine/{id}/complete:
 *   post:
 *     summary: Mark steps as complete in a routine
 *     tags: [Routine]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Steps marked complete
 */
router.post('/:id/complete', routineController.completeSteps);

/**
 * @swagger
 * /api/routine/{id}/reaction:
 *   post:
 *     summary: Log a reaction to a specific product in a routine
 *     tags: [Routine]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Reaction logged
 */
router.post('/:id/reaction', validate(productReactionSchema), routineController.addReaction);

router.put('/:id', async (req, res) => {
  try {
    const routine = await Routine.findOneAndUpdate(
      { _id: req.params.id, user: req.user.uid },
      { $set: req.body },
      { new: true }
    );
    res.json({ success: true, data: routine });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Routine.findOneAndUpdate({ _id: req.params.id, user: req.user.uid }, { isActive: false });
    res.json({ success: true, data: { message: 'Routine deactivated' } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

module.exports = router;
