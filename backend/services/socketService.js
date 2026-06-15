const socketIo = require('socket.io');
const admin = require('../config/firebaseAdmin');

let io;

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error: Token missing'));

      const decodedToken = await admin.auth().verifyIdToken(token);
      socket.user = decodedToken;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id, 'User:', socket.user.uid);

    socket.join(`user:${socket.user.uid}`);
    console.log(`Socket ${socket.id} auto-joined user room: user:${socket.user.uid}`);

    socket.on('subscribe:job', ({ jobId }) => {
      socket.join(`job:${jobId}`);
      console.log(`Socket ${socket.id} joined job room: job:${jobId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = {
  initSocket,
  getIo
};
