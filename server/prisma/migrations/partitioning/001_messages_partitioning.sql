-- ============================================
-- Migration: Partitioning de la table messages
-- Date: 2026-01-03
-- ============================================
--
-- Cette migration convertit la table 'messages' en table partitionnée
-- par plage de dates (RANGE) sur la colonne createdAt.
--
-- Avantages:
-- - Amélioration des performances de lecture sur les messages récents
-- - Archivage facile des anciennes partitions
-- - Maintenance simplifiée (VACUUM, REINDEX par partition)
--
-- ATTENTION: Exécuter cette migration pendant une fenêtre de maintenance
-- car elle nécessite une réécriture complète de la table.
-- ============================================

-- 1. Créer la nouvelle table partitionnée
CREATE TABLE messages_partitioned (
    id UUID NOT NULL,
    "conversationId" UUID NOT NULL,
    "authorId" UUID,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    citations JSONB,
    confidence DOUBLE PRECISION,
    "tokensUsed" INTEGER,
    "responseTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, "createdAt")
) PARTITION BY RANGE ("createdAt");

-- 2. Créer les partitions par année/mois
-- Partition pour les données historiques (avant 2026)
CREATE TABLE messages_2025 PARTITION OF messages_partitioned
    FOR VALUES FROM (MINVALUE) TO ('2026-01-01');

-- Partitions 2026 par trimestre
CREATE TABLE messages_2026_q1 PARTITION OF messages_partitioned
    FOR VALUES FROM ('2026-01-01') TO ('2026-04-01');

CREATE TABLE messages_2026_q2 PARTITION OF messages_partitioned
    FOR VALUES FROM ('2026-04-01') TO ('2026-07-01');

CREATE TABLE messages_2026_q3 PARTITION OF messages_partitioned
    FOR VALUES FROM ('2026-07-01') TO ('2026-10-01');

CREATE TABLE messages_2026_q4 PARTITION OF messages_partitioned
    FOR VALUES FROM ('2026-10-01') TO ('2027-01-01');

-- Partition pour les données futures
CREATE TABLE messages_future PARTITION OF messages_partitioned
    FOR VALUES FROM ('2027-01-01') TO (MAXVALUE);

-- 3. Créer les index sur chaque partition (automatiquement hérités)
CREATE INDEX idx_messages_part_conversation ON messages_partitioned("conversationId");
CREATE INDEX idx_messages_part_conv_created ON messages_partitioned("conversationId", "createdAt");
CREATE INDEX idx_messages_part_author ON messages_partitioned("authorId");

-- 4. Migrer les données existantes
INSERT INTO messages_partitioned
SELECT
    id,
    "conversationId",
    "authorId",
    role::TEXT,
    content,
    citations,
    confidence,
    "tokensUsed",
    "responseTime",
    "createdAt"
FROM messages;

-- 5. Renommer les tables (transaction atomique)
BEGIN;
ALTER TABLE messages RENAME TO messages_old;
ALTER TABLE messages_partitioned RENAME TO messages;
COMMIT;

-- 6. Recréer les contraintes de clé étrangère
ALTER TABLE messages
    ADD CONSTRAINT fk_messages_conversation
    FOREIGN KEY ("conversationId")
    REFERENCES conversations(id)
    ON DELETE CASCADE;

ALTER TABLE messages
    ADD CONSTRAINT fk_messages_author
    FOREIGN KEY ("authorId")
    REFERENCES users(id)
    ON DELETE SET NULL;

-- 7. Créer une fonction pour créer automatiquement les nouvelles partitions
CREATE OR REPLACE FUNCTION create_messages_partition_if_needed()
RETURNS void AS $$
DECLARE
    partition_date DATE;
    partition_name TEXT;
    partition_start DATE;
    partition_end DATE;
BEGIN
    -- Créer la partition pour le prochain trimestre si elle n'existe pas
    partition_date := DATE_TRUNC('quarter', CURRENT_DATE + INTERVAL '3 months');
    partition_name := 'messages_' || TO_CHAR(partition_date, 'YYYY') || '_q' ||
                      EXTRACT(QUARTER FROM partition_date);
    partition_start := partition_date;
    partition_end := partition_date + INTERVAL '3 months';

    -- Vérifier si la partition existe déjà
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = partition_name
    ) THEN
        EXECUTE format(
            'CREATE TABLE %I PARTITION OF messages FOR VALUES FROM (%L) TO (%L)',
            partition_name,
            partition_start,
            partition_end
        );
        RAISE NOTICE 'Created partition: %', partition_name;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 8. Créer un job cron pour créer les partitions automatiquement
-- (À configurer dans pg_cron ou via un cron job externe)
-- SELECT cron.schedule('create-messages-partition', '0 0 1 * *',
--     'SELECT create_messages_partition_if_needed()');

-- 9. Vérification
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as size
FROM pg_tables
WHERE tablename LIKE 'messages%'
ORDER BY tablename;

-- 10. Nettoyer l'ancienne table (APRÈS validation)
-- DROP TABLE messages_old;
