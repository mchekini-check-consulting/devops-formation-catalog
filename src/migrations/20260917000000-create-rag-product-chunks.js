// Lot 1 of the RAG shopping assistant: semantic storage for product content.
// Requires the `vector` extension, which is activated as a superuser step in
// devops-formation-utils/k8s/helm/postgres (init-users.sh) — pgvector isn't
// marked "trusted" on this Spilo image, so the `formation` app user cannot
// CREATE EXTENSION itself. ArgoCD sync-waves guarantee that job runs before
// this service is ever deployed/restarted.
module.exports = {
  name: '20260917000000-create-rag-product-chunks',

  async up({ context: queryInterface }) {
    await queryInterface.sequelize.query(`
      CREATE SCHEMA IF NOT EXISTS rag;

      CREATE TABLE IF NOT EXISTS rag.product_chunks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        chunk_text TEXT NOT NULL,
        embedding vector(384),
        search_vector tsvector GENERATED ALWAYS AS (to_tsvector('french', chunk_text)) STORED,
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS product_chunks_product_id_idx
        ON rag.product_chunks (product_id);

      CREATE INDEX IF NOT EXISTS product_chunks_embedding_hnsw_idx
        ON rag.product_chunks USING hnsw (embedding vector_cosine_ops);

      CREATE INDEX IF NOT EXISTS product_chunks_search_vector_idx
        ON rag.product_chunks USING gin (search_vector);
    `);
  },

  async down({ context: queryInterface }) {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS rag.product_chunks;
      DROP SCHEMA IF EXISTS rag;
    `);
  },
};
