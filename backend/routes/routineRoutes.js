const express = require('express');
const routineController = require('../controllers/routineController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { generateRoutineSchema, productReactionSchema } = require('../schemas/routineSchema');
const Routine = require('../models/Routine');

const router = express.Router();

router.use(authMiddleware);

router.get('/', routineController.getRoutines);
router.post('/generate', validate(generateRoutineSchema), routineController.createRoutineGeneration);
router.post('/:id/complete', routineController.completeSteps);
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
