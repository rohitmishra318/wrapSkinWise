const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { addFavorite, removeFavorite, getFavorites } = require('../controllers/userController');

// Get all of the logged-in user's favorite properties
router.get('/favorites', authMiddleware, getFavorites);
// Add a property to favorites
router.post('/favorites/:propertyId', authMiddleware, addFavorite);
// Remove a property from favorites
router.delete('/favorites/:propertyId', authMiddleware, removeFavorite);

module.exports = router;