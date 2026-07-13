# Catalogue Service

A REST microservice for product management built with Node.js, Express and PostgreSQL.

## Stack
- **Node.js / Express** — REST API
- **Sequelize** — ORM for PostgreSQL
- **PostgreSQL** — persistence
- **Docker / Docke r Compose** — containerisation 

## Project structure
```
catalogue/
├── src/
│   ├── app.js                  # Entry point
│   ├── config/
│   │   └── database.js         # Sequelize connection
│   ├── models/
│   │   └── product.model.js    # Product schema
│   ├── services/
│   │   └── product.service.js  # Business logic
│   ├── controllers/
│   │   └── product.controller.js
│   ├── routes/
│   │   └── product.routes.js
│   └── middleware/
│       └── validation.js       # express-validator rules
├── tests/
│   └── product.test.js
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

## Quick start

### With Docker (recommended)
```bash
docker-compose up --build
```

### Local development
```bash
cp .env.pgtst .env    # fill in your DB credentials
npm install
npm run dev
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/products` | Create a product |
| `PUT` | `/products/:id` | Update a product |
| `DELETE` | `/products/:id` | Delete a product |
| `GET` | `/products` | Search products |

### Search query parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Partial, case-insensitive name filter |
| `category` | string | Partial, case-insensitive category filter |
| `minPrice` | number | Minimum price |
| `maxPrice` | number | Maximum price |

**Example:** `GET /products?name=shoe&category=sport&minPrice=20&maxPrice=100`

### Product payload

```json
{
  "name": "Running Shoes",
  "price": 79.99,
  "category": "Sport"
}
```

## Tests
```bash
npm test
```
