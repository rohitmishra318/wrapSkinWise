const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const userRoutes = require('./routes/userRoutes'); // <-- Import
const analyzeRoutes = require('./routes/analyzeRoutes'); // <-- Import analyze routes
const Routine = require('./models/Routine');
const SkinAnalysis = require('./models/SkinAnalysis');
const blogRoutes = require('./routes/blogRoutes'); // <-- Import blog routes
require('dotenv').config();


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",         // allow all during development
    methods: ["GET", "POST"],
    credentials: true
  }
});


app.set('socketio', io); 

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/wrapskinwise', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', userRoutes); // <-- Use the user routes
app.use('/api/analyze', analyzeRoutes); // <-- Use analyze routes
app.use('/api/blogs', blogRoutes); // <-- Use blog routes


// Helper to create a consistent, private room name
const createPrivateRoomName = (userId1, userId2) => {
  return [userId1, userId2].sort().join('_');
};

;

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});