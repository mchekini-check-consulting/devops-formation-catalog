// Lot 0 of the RAG shopping assistant: products need real textual content to
// be embedded/indexed. Nullable at the DB level (existing rows have none yet);
// enforced as required on creation at the request-validation layer instead
// (src/middleware/validation.js), same pattern already used for `solde`.
module.exports = {
  name: '20260916000000-add-description-to-products',

  async up({ context: queryInterface }) {
    await queryInterface.sequelize.query(
      'ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS description TEXT;'
    );
  },

  async down({ context: queryInterface }) {
    await queryInterface.sequelize.query(
      'ALTER TABLE IF EXISTS products DROP COLUMN IF EXISTS description;'
    );
  },
};
