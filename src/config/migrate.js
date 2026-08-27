const sequelize = require('./database');
const logger = require('./logger');

// Expand step of the canary rollout: adds the `solde` column ahead of time so
// it exists whether the request lands on the v1 (stable) or v2 (canary) pod.
// Nullable, no default: v1 never writes it, v2 writes it when the client sends it.
async function runMigrations() {
  await sequelize.query(
    'ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS solde DECIMAL(10,2)'
  );
  logger.info('Migration: solde column ensured on products table.');
}

module.exports = runMigrations;
