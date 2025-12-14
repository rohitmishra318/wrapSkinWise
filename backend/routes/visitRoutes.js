
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createVisitRequest, getTenantVisits, getOwnerVisits, updateVisitStatus } = require('../controllers/visitController');

// Create a new visit request
router.post('/', authMiddleware, createVisitRequest);
// Get all visits requested by the logged-in tenant
router.get('/tenant', authMiddleware, getTenantVisits);
// Get all visit requests for the logged-in owner's properties
router.get('/owner', authMiddleware, getOwnerVisits);
// Update the status of a visit (accept/reject)
router.patch('/:visitId', authMiddleware, updateVisitStatus);

module.exports = router;