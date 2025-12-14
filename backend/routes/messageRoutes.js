const express = require('express');
const router = express.Router();
const { getMessagesForProperty } = require('../controllers/messageController');

router.get('/:propertyId', getMessagesForProperty);

module.exports = router;