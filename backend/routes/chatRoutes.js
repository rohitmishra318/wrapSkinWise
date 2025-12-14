
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getUserConversations } = require('../controllers/chatController');

// GET /api/chats - fetches all conversations for the logged in user
router.get('/', authMiddleware, getUserConversations);

module.exports = router;