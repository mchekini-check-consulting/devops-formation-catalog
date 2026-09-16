const { Umzug, SequelizeStorage } = require('umzug');
const sequelize = require('./database');
const logger = require('./logger');

// Migrations are required statically (not glob-resolved at runtime) so that
// esbuild's bundling in the Dockerfile builder stage picks them up into
// dist/app.js — the production image only ships that single bundled file,
// nothing else from src/.
const migrations = [
  require('../migrations/20260201000000-create-products-table'),
  require('../migrations/20260215000000-add-solde-to-products'),
  require('../migrations/20260916000000-add-description-to-products'),
  require('../migrations/20260917000000-create-rag-product-chunks'),
];

async function runMigrations() {
  const umzug = new Umzug({
    migrations,
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: undefined,
  });
  const executed = await umzug.up();
  if (executed.length > 0) {
    logger.info(`Migrations applied: ${executed.map((m) => m.name).join(', ')}`);
  } else {
    logger.info('No pending migrations.');
  }
}

module.exports = runMigrations;
