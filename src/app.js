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
const app = express();

app.use(cors());
app.use(httpLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'catalogue-service' });
});

app.use('/api/products', productRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
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
