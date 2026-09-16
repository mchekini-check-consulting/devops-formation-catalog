// Baseline migration: codifies the schema that used to be created implicitly
// by `sequelize.sync()`. Uses IF NOT EXISTS because dev/prod already have this
// table created by the old sync()-based bootstrap — this migration only takes
// over ownership going forward, it doesn't recreate anything that exists.
module.exports = {
  name: '20260201000000-create-products-table',

  async up({ context: queryInterface }) {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(255) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
  },

  async down({ context: queryInterface }) {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS products;');
  },
};
