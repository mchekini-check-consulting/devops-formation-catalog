const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/database');

const Product = sequelize.define(
  'Product',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Name cannot be empty' },
        len: { args: [1, 255], msg: 'Name must be between 1 and 255 characters' },
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: { msg: 'Price must be a valid number' },
        min: { args: [0], msg: 'Price must be greater than or equal to 0' },
      },
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Category cannot be empty' },
      },
    },
  },
  {
    tableName: 'products',
    timestamps: true,
  }
);

module.exports = Product;
