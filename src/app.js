require('./config/tracing');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./config/logger');
const httpLogger = require('./middleware/httpLogger');
const productRoutes = require('./routes/product.routes');
const sequelize = require('./config/database');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { collectDefaultMetrics, register, Histogram } = require('prom-client');

collectDefaultMetrics();

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

const app = express();

app.use(cors());
app.use(httpLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Prometheus metrics middleware
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    const route = req.route ? req.route.path : req.path;
    end({ method: req.method, route, status_code: res.statusCode });
  });
  next();
});

app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'catalogue-service' });
});

app.get('/actuator/prometheus', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use('/api/products', productRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, _next) => {
  logger.error(err.message, {
    error: err,
    method: req.method,
    url: req.originalUrl,
  });
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
if (require.main === module) {
const start = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established.');
    await sequelize.sync();
    logger.info('Database synced.');
    app.listen(PORT, () => {
      logger.info(`Catalogue service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start service', { error });
    process.exit(1);
  }
};
start();
}

module.exports = app;
