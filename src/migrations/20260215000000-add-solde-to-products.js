// Formalizes the `solde` column that was previously added ad hoc by the old
// hand-rolled src/config/migrate.js during the canary rollout (nullable, no
// default: v1 pods never write it, v2 writes it when the client sends it).
module.exports = {
  name: '20260215000000-add-solde-to-products',

  async up({ context: queryInterface }) {
    await queryInterface.sequelize.query(
      'ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS solde DECIMAL(10, 2);'
    );
  },

  async down({ context: queryInterface }) {
    await queryInterface.sequelize.query(
      'ALTER TABLE IF EXISTS products DROP COLUMN IF EXISTS solde;'
    );
  },
};
