const Property = require('../models/Property');
const axios = require('axios');

// GET all properties with optional filtering
const getAllProperties = async (req, res) => {
  try {
    const { location, type, minPrice, maxPrice, bedrooms, bathrooms } = req.query;
    let filter = {};

    if (location) filter.location = { $regex: location, $options: 'i' };
    if (type) filter.type = type;
    if (bedrooms) filter.bedrooms = parseInt(bedrooms);
    if (bathrooms) filter.bathrooms = parseInt(bathrooms);
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    const properties = await Property.find(filter).populate('owner', 'username');
    res.status(200).json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET a single property by its ID
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'username _id');

    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// POST - Create a new property
const createProperty = async (req, res) => {
  try {
    const newProperty = new Property({
      ...req.body,
      owner: req.user.id // Correctly get user ID from authMiddleware
    });
    const property = await newProperty.save();
    res.status(201).json(property);
  } catch (err) {
    console.error("Error creating property:", err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// PATCH - Update an existing property
const updateProperty = async (req, res) => {
  try {
    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Return the updated document
    );
    if (!updatedProperty) return res.status(404).json({ message: 'Property not found' });
    res.json(updatedProperty);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE a property
const deleteProperty = async (req, res) => {
  try {
    const deletedProperty = await Property.findByIdAndDelete(req.params.id);
    if (!deletedProperty) return res.status(404).json({ message: 'Property not found' });
    res.json({ message: 'Property deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET recommendations for a property
const getRecommendedProperties = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Fetch all properties to send to the AI service
    const allProperties = await Property.find({}).lean();
    
    // 2. Call the Flask recommendation service
    const flaskResponse = await axios.post('http://127.0.0.1:5001/recommend', {
      properties: allProperties,
      target_id: id
    });

    const recommendedIds = flaskResponse.data.recommended_ids;
    
    // 3. Fetch full details of only the recommended properties
    const recommendedProperties = await Property.find({
      '_id': { $in: recommendedIds }
    });

    res.status(200).json(recommendedProperties);
  } catch (error) {
    console.error("Error fetching recommendations:", error.message);
    res.status(500).json({ message: "Failed to get recommendations" });
  }
};


// --- CORRECTED EXPORTS ---
// Ensure all the functions your routes need are exported here.
module.exports = {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getRecommendedProperties
};