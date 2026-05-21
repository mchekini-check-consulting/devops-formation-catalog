const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const {
  createProductValidation,
  updateProductValidation,
  searchProductValidation,
} = require('../middleware/validation');

router.post('/', createProductValidation, productController.create);
router.put('/:id', updateProductValidation, productController.update);
router.delete('/:id', productController.delete);
router.get('/', searchProductValidation, productController.search);
router.get('/:id', productController.getById);

module.exports = router;
