
const express = require('express');
const router = express.Router();
const { getAllProperties, getPropertyById, addProperty, createProperty, updateProperty, deleteProperty, getRecommendedProperties } = require('../controllers/propertyController');
const authMiddleware = require('../middleware/authMiddleware'); // <-- 1. Import the middleware

// Define a GET route for all properties with search/filter capabilities
router.get('/', getAllProperties);

// Define a GET route for a single property by ID. This should be before the catch-all.
router.get('/:id', getPropertyById);
        
// Define a POST route to add a new property
router.post('/', authMiddleware, createProperty);

// Define a PUT route to update an existing property
router.put('/:id', updateProperty);

// Define a DELETE route to delete a property
router.delete('/:id', deleteProperty);

router.get('/:id/recommendations', getRecommendedProperties);

module.exports = router;
