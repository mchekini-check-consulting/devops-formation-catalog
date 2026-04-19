const { Op } = require('sequelize');
const Product = require('../models/product.model');

class ProductService {
  async createProduct(data) {
    const product = await Product.create(data);
    return product;
  }

  async updateProduct(id, data) {
    const product = await Product.findByPk(id);
    if (!product) return null;
    await product.update(data);
    return product;
  }

  async deleteProduct(id) {
    const product = await Product.findByPk(id);
    if (!product) return false;
    await product.destroy();
    return true;
  }

  async searchProducts({ name, category, minPrice, maxPrice }) {
    const where = {};

    if (name) {
      where.name = { [Op.iLike]: `%${name}%` };
    }

    if (category) {
      where.category = { [Op.iLike]: `%${category}%` };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice !== undefined) where.price[Op.lte] = parseFloat(maxPrice);
    }

    const products = await Product.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    return products;
  }

  async getProductById(id) {
    return Product.findByPk(id);
  }
}

module.exports = new ProductService();
