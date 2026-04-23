require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const productRoutes = require('./routes/product.routes');
const sequelize = require('./config/database');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'catalogue-service' });
});

app.use('/products', productRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
if (require.main === module) {
const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');
    await sequelize.sync({ alter: true });
    console.log('Database synced.');
    app.listen(PORT, () => {
      console.log(`Catalogue service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start service:', error);
    process.exit(1);
  }
};
start();
}

module.exports = app;
