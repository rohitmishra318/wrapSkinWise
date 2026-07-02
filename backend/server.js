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
const { v4: uuidv4 } = require('uuid');
const logger = require('./config/logger');
const promClient = require('prom-client');

require('dotenv').config();

const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { analysisQueue } = require('./config/bull');

// Initialize workers
require('./workers/analysisWorker');

const app = express();
const server = http.createServer(app);

// Prometheus Metrics setup
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register, prefix: 'skinwise_backend_' });
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});
register.registerMetric(httpRequestDurationMicroseconds);

// Request ID and logging middleware
app.use((req, res, next) => {
  req.requestId = uuidv4();
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.route ? req.route.path : req.path, code: res.statusCode });
    logger.info('HTTP Request', {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode
    });
  });
  next();
});

initSocket(server);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wrapskinwise', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => logger.info('MongoDB connected'))
  .catch(err => logger.error('MongoDB connection error:', err));

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', userRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/routine', routineRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/admin/analytics', adminAnalyticsRoutes);
app.use('/api/v1/partner', brandRoutes);

// Swagger Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.get('/health', async (req, res) => {
  try {
    const mongoState = mongoose.connection.readyState;
    if (mongoState !== 1) throw new Error('MongoDB is down');
    // We could check redis here too but we will skip deep Redis pinging for simplicity unless required
    res.status(200).json({ status: 'ok', mongo: 'connected' });
  } catch (err) {
    logger.error('Healthcheck failed', { error: err.message });
    res.status(503).json({ status: 'error', message: err.message });
  }
});

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');
createBullBoard({
  queues: [new BullAdapter(analysisQueue)],
  serverAdapter: serverAdapter,
});
app.use('/admin/queues', serverAdapter.getRouter());

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Bull-board UI available at http://localhost:${PORT}/admin/queues`);
});