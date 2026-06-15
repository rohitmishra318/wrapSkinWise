const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const analyzeRoutes = require('./routes/analyzeRoutes');
const routineRoutes = require('./routes/routineRoutes');
const brandRoutes = require('./routes/brandRoutes');
const blogRoutes = require('./routes/blogRoutes');
const adminAnalyticsRoutes = require('./routes/adminAnalyticsRoutes');
const { initSocket } = require('./services/socketService');

require('dotenv').config();

const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { analysisQueue } = require('./config/bull');

const app = express();
const server = http.createServer(app);

initSocket(server);

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wrapskinwise', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', userRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/routine', routineRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/admin/analytics', adminAnalyticsRoutes);
app.use('/api/v1/partner', brandRoutes);

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');
createBullBoard({
  queues: [new BullAdapter(analysisQueue)],
  serverAdapter: serverAdapter,
});
app.use('/admin/queues', serverAdapter.getRouter());

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Bull-board UI available at http://localhost:${PORT}/admin/queues`);
});