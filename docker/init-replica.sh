#!/bin/bash
# Script d'initialisation pour la réplication PostgreSQL

set -e

# Créer l'utilisateur de réplication
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Créer l'utilisateur de réplication s'il n'existe pas
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'replicator') THEN
            CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'replicator_password';
        END IF;
    END
    \$\$;

    -- Configurer pg_hba.conf pour autoriser la réplication
    -- (Cette partie est gérée par Docker, mais on peut vérifier)
EOSQL

# Ajouter l'entrée dans pg_hba.conf pour la réplication
echo "host replication replicator all md5" >> "$PGDATA/pg_hba.conf"

echo "Replication user 'replicator' created successfully"
