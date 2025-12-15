const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const Message = require('./models/Message');
const visitRoutes = require('./routes/visitRoutes'); // <-- Import new routes
const userRoutes = require('./routes/userRoutes'); // <-- Import
const chatRoutes = require('./routes/chatRoutes'); // <-- Import chat routes
const analyzeRoutes = require('./routes/analyzeRoutes'); // <-- Import analyze routes
const Routine = require('./models/Routine');
const SkinAnalysis = require('./models/SkinAnalysis');
const blogRoutes = require('./routes/blogRoutes'); // <-- Import blog routes


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",         // allow all during development
    methods: ["GET", "POST"],
    credentials: true
  }
});


app.set('socketio', io); // <-- Make io accessible globally in the app

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
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/visits', visitRoutes); // <-- Use the new routes
app.use('/api/users', userRoutes); // <-- Use the user routes
app.use('/api/chats', chatRoutes); // <-- Use chat routes
app.use('/api/analyze', analyzeRoutes); // <-- Use analyze routes
app.use('/api/blogs', blogRoutes); // <-- Use blog routes


// Helper to create a consistent, private room name
const createPrivateRoomName = (userId1, userId2) => {
  return [userId1, userId2].sort().join('_');
};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // User joins their own room for notifications, etc.
  socket.on('joinUserRoom', (userId) => {
    socket.join(userId);
    console.log(`User with socket ${socket.id} joined room ${userId}`);
  });

  // Private chat join logic
  socket.on('joinPrivateChat', (data) => {
    const { userId1, userId2 } = data;
    const roomName = createPrivateRoomName(userId1, userId2);
    socket.join(roomName);
    console.log(`User ${socket.id} joined private room ${roomName}`);
  });

  // Private chat send logic
  socket.on('sendPrivateMessage', async (data) => {
    const { propertyId, sender, recipient, senderUsername, text } = data;
    const roomName = createPrivateRoomName(sender, recipient);

    try {
      const newMessage = new Message({
        propertyId,
        sender,
        recipient,
        senderUsername,
        text
      });
      await newMessage.save();

      io.to(roomName).emit('receiveMessage', newMessage);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});