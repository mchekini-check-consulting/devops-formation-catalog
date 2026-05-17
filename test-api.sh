#!/bin/bash

BASE_URL="http://localhost:4000/api"

echo "=== Health Check ==="
curl -s "$BASE_URL/health" | jq .
echo ""

echo "=== POST - Create Product 1 ==="
curl -s -X POST "$BASE_URL/products" \
  -H "Content-Type: application/json" \
  -H "x-correlation-id: req-test-001" \
  -H "x-user-id: user-42" \
  -d '{"name": "Clavier mécanique", "price": 89.99, "category": "peripherals"}' | jq .
echo ""

echo "=== POST - Create Product 2 ==="
curl -s -X POST "$BASE_URL/products" \
  -H "Content-Type: application/json" \
  -H "x-correlation-id: req-test-002" \
  -H "x-user-id: user-42" \
  -d '{"name": "Souris gaming", "price": 49.99, "category": "peripherals"}' | jq .
echo ""

echo "=== POST - Create Product 3 ==="
curl -s -X POST "$BASE_URL/products" \
  -H "Content-Type: application/json" \
  -H "x-correlation-id: req-test-003" \
  -d '{"name": "Ecran 27 pouces", "price": 349.00, "category": "monitors"}' | jq .
echo ""

echo "=== GET - List all products ==="
curl -s "$BASE_URL/products" \
  -H "x-correlation-id: req-test-004" | jq .
echo ""

echo "=== GET - Search by category ==="
curl -s "$BASE_URL/products?category=peripherals" \
  -H "x-correlation-id: req-test-005" | jq .
echo ""

echo "=== GET - Search by price range ==="
curl -s "$BASE_URL/products?minPrice=50&maxPrice=100" \
  -H "x-correlation-id: req-test-006" | jq .
echo ""

echo "=== GET - Search by name ==="
curl -s "$BASE_URL/products?name=souris" \
  -H "x-correlation-id: req-test-007" | jq .
echo ""

echo "=== POST - Validation error (missing fields) ==="
curl -s -X POST "$BASE_URL/products" \
  -H "Content-Type: application/json" \
  -d '{"name": ""}' | jq .
echo ""

echo "=== GET - Route not found (404) ==="
curl -s "$BASE_URL/nonexistent" | jq .
echo ""

echo "=== Done ==="
