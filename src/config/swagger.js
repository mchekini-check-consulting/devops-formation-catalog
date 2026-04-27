const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Catalogue Service API',
    version: '1.0.0',
    description: 'REST API for managing products in the catalogue service',
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Local server',
    },
  ],
  components: {
    schemas: {
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
          name: { type: 'string', example: 'Wireless Headphones' },
          price: { type: 'number', format: 'float', example: 49.99 },
          category: { type: 'string', example: 'Electronics' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ProductInput: {
        type: 'object',
        required: ['name', 'price', 'category'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 255, example: 'Wireless Headphones' },
          price: { type: 'number', format: 'float', minimum: 0, example: 49.99 },
          category: { type: 'string', example: 'Electronics' },
        },
      },
      ValidationError: {
        type: 'object',
        properties: {
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                msg: { type: 'string' },
                param: { type: 'string' },
                location: { type: 'string' },
              },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
      NotFoundResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: "Product with id 'xxx' not found" },
        },
      },
      DeleteResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Product deleted successfully' },
        },
      },
    },
  },
  paths: {
    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'Search products',
        description: 'Search products by name, category, and price range',
        parameters: [
          { in: 'query', name: 'name', schema: { type: 'string' }, example: 'Headphones' },
          { in: 'query', name: 'category', schema: { type: 'string' }, example: 'Electronics' },
          { in: 'query', name: 'minPrice', schema: { type: 'number' }, example: 10 },
          { in: 'query', name: 'maxPrice', schema: { type: 'number' }, example: 100 },
        ],
        responses: {
          200: {
            description: 'List of matching products',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Product' } } } },
          },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } },
          500: { description: 'Internal server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
      post: {
        tags: ['Products'],
        summary: 'Create a product',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductInput' } } },
        },
        responses: {
          201: { description: 'Product created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } },
          500: { description: 'Internal server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/products/{id}': {
      put: {
        tags: ['Products'],
        summary: 'Update a product',
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductInput' } } },
        },
        responses: {
          200: { description: 'Product updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } },
          404: { description: 'Product not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/NotFoundResponse' } } } },
          500: { description: 'Internal server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete a product',
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Product deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/DeleteResponse' } } } },
          404: { description: 'Product not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/NotFoundResponse' } } } },
          500: { description: 'Internal server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
  },
};

module.exports = swaggerSpec;