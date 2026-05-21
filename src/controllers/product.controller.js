const { validationResult } = require('express-validator');
const productService = require('../services/product.service');
const logger = require('../config/logger');

class ProductController {
  async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const product = await productService.createProduct(req.body);
      return res.status(201).json(product);
    } catch (error) {
      logger.error('Failed to create product', { error });
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async update(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const product = await productService.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ message: `Product with id '${req.params.id}' not found` });
      }
      return res.status(200).json(product);
    } catch (error) {
      logger.error('Failed to update product', { error });
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await productService.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: `Product with id '${req.params.id}' not found` });
      }
      return res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      logger.error('Failed to delete product', { error });
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const product = await productService.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: `Product with id '${req.params.id}' not found` });
      }
      return res.status(200).json(product);
    } catch (error) {
      logger.error('Failed to get product', { error });
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async search(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, category, minPrice, maxPrice } = req.query;
      const products = await productService.searchProducts({ name, category, minPrice, maxPrice });
      return res.status(200).json(products);
    } catch (error) {
      logger.error('Failed to search products', { error });
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }
}

module.exports = new ProductController();
