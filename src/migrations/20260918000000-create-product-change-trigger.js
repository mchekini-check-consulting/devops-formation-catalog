// Lot 2 of the RAG shopping assistant: notify the ingestion worker whenever a
// product is created, updated or deleted, so rag.product_chunks stays in
// sync without the worker having to poll. No message broker exists in this
// stack — Postgres's own LISTEN/NOTIFY is the lightest mechanism available.
module.exports = {
  name: '20260918000000-create-product-change-trigger',

  async up({ context: queryInterface }) {
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION rag.notify_product_change() RETURNS trigger AS $$
      DECLARE
        changed_id uuid;
      BEGIN
        IF TG_OP = 'DELETE' THEN
          changed_id := OLD.id;
        ELSE
          changed_id := NEW.id;
        END IF;

        PERFORM pg_notify(
          'product_changed',
          json_build_object('op', TG_OP, 'id', changed_id)::text
        );

        IF TG_OP = 'DELETE' THEN
          RETURN OLD;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS product_changed_trigger ON products;

      CREATE TRIGGER product_changed_trigger
        AFTER INSERT OR UPDATE OR DELETE ON products
        FOR EACH ROW EXECUTE FUNCTION rag.notify_product_change();
    `);
  },

  async down({ context: queryInterface }) {
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS product_changed_trigger ON products;
      DROP FUNCTION IF EXISTS rag.notify_product_change();
    `);
  },
};
