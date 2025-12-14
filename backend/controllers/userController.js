require('dotenv').config();
const User = require('../models/User'); // Corrected import
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// NOTE: In a real project, this secret would be stored in a .env file
const jwtSecret = process.env.JWT_SECRET;
console.log("JWT Secret:", jwtSecret); // Log the JWT secret to verify it's loaded
const registerUser = async (req, res) => {
    console.log("register"); // Log the request body to see incoming data
  const { username, email, password } = req.body;
  try {
    // Check if the user already exists
    console.log("Checking for existing user");
    let existingUser = await User.findOne({ email });
     // Log before checking for existing user
    if (existingUser) {
      return res.status(400).json({ message: 'User with that email already exists.' });
    }
    console.log("Creating new user"); // Log before creating a new user

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

const loginUser = async (req, res) => {
    console.log("JWT Secret:", jwtSecret);
    console.log(req.body); // Log the request body to see incoming data
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Use the defined secret
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '4h' });
    res.json({ token, user: { id: user._id, username: user.username } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: 'Server error during login.' });
  }
};


const addFavorite = async (req, res) => {
  try {
    console.log("Adding favorite");
    const userId = req.user.id;
    console.log("User ID:", userId);
    const { propertyId } = req.params;

    await User.findByIdAndUpdate(userId, {
      $addToSet: { favorites: propertyId } // $addToSet prevents duplicates
    });

    res.status(200).json({ message: 'Property added to favorites.' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;

    await User.findByIdAndUpdate(userId, {
      $pull: { favorites: propertyId } // $pull removes the item
    });

    res.status(200).json({ message: 'Property removed from favorites.' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate('favorites');

    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};


module.exports = { registerUser, loginUser , addFavorite, removeFavorite, getFavorites };
