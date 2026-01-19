#!/bin/bash

# ============================================================
# CGI 242 - Script de Sauvegarde PostgreSQL
# ============================================================
# Conforme aux recommandations cybersécurité:
# - Sauvegardes régulières (protection ransomware)
# - Stockage hors-site recommandé
# - Rotation automatique des backups
# ============================================================
# Usage:
#   ./backup-database.sh                    # Backup local
#   ./backup-database.sh --upload-s3        # Backup + upload S3
#   ./backup-database.sh --restore backup.sql.gz  # Restauration
#
# Cron (quotidien à 2h du matin):
#   0 2 * * * /path/to/backup-database.sh >> /var/log/cgi-backup.log 2>&1
# ============================================================

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_DIR/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="cgi_engine_backup_${TIMESTAMP}"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Variables de connexion (depuis .env ou environnement)
if [ -f "$PROJECT_DIR/server/.env" ]; then
    source "$PROJECT_DIR/server/.env"
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-cgi_engine}"
DB_USER="${DB_USER:-cgiengine}"

# Pour Docker
DOCKER_CONTAINER="${DOCKER_CONTAINER:-cgi-242-db-master}"

log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Créer le répertoire de backup
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        log_info "Répertoire de backup créé: $BACKUP_DIR"
    fi
}

# Backup via Docker
backup_docker() {
    log_info "Démarrage du backup PostgreSQL via Docker..."

    if ! docker ps --format '{{.Names}}' | grep -q "$DOCKER_CONTAINER"; then
        log_error "Container $DOCKER_CONTAINER non trouvé ou non démarré"
        return 1
    fi

    # Dump compressé
    docker exec "$DOCKER_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" -Fc \
        | gzip > "$BACKUP_DIR/${BACKUP_NAME}.dump.gz"

    # Dump SQL pour compatibilité
    docker exec "$DOCKER_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" --clean \
        | gzip > "$BACKUP_DIR/${BACKUP_NAME}.sql.gz"

    log_info "Backup terminé: ${BACKUP_NAME}.dump.gz"
}

# Backup direct (sans Docker)
backup_direct() {
    log_info "Démarrage du backup PostgreSQL direct..."

    export PGPASSWORD="$DB_PASSWORD"

    # Dump compressé
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -Fc \
        | gzip > "$BACKUP_DIR/${BACKUP_NAME}.dump.gz"

    # Dump SQL
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --clean \
        | gzip > "$BACKUP_DIR/${BACKUP_NAME}.sql.gz"

    unset PGPASSWORD

    log_info "Backup terminé: ${BACKUP_NAME}.dump.gz"
}

# Vérifier l'intégrité du backup
verify_backup() {
    local backup_file="$BACKUP_DIR/${BACKUP_NAME}.dump.gz"

    log_info "Vérification de l'intégrité du backup..."

    if gzip -t "$backup_file" 2>/dev/null; then
        local size=$(du -h "$backup_file" | cut -f1)
        log_info "Backup valide - Taille: $size"

        # Créer checksum
        sha256sum "$backup_file" > "$backup_file.sha256"
        log_info "Checksum SHA256 créé"
        return 0
    else
        log_error "Backup corrompu!"
        return 1
    fi
}

# Rotation des anciens backups
rotate_backups() {
    log_info "Rotation des backups (rétention: $RETENTION_DAYS jours)..."

    local deleted=0
    while IFS= read -r -d '' file; do
        rm -f "$file" "${file}.sha256"
        ((deleted++))
    done < <(find "$BACKUP_DIR" -name "cgi_engine_backup_*.gz" -type f -mtime +$RETENTION_DAYS -print0)

    log_info "$deleted ancien(s) backup(s) supprimé(s)"
}

# Upload vers S3 (optionnel)
upload_to_s3() {
    if [ -z "$AWS_S3_BUCKET" ]; then
        log_warn "AWS_S3_BUCKET non défini - Upload S3 ignoré"
        return 0
    fi

    log_info "Upload vers S3: s3://$AWS_S3_BUCKET/backups/"

    aws s3 cp "$BACKUP_DIR/${BACKUP_NAME}.dump.gz" \
        "s3://$AWS_S3_BUCKET/backups/${BACKUP_NAME}.dump.gz" \
        --storage-class STANDARD_IA

    aws s3 cp "$BACKUP_DIR/${BACKUP_NAME}.dump.gz.sha256" \
        "s3://$AWS_S3_BUCKET/backups/${BACKUP_NAME}.dump.gz.sha256"

    log_info "Upload S3 terminé"
}

# Restauration
restore_backup() {
    local backup_file="$1"

    if [ ! -f "$backup_file" ]; then
        log_error "Fichier de backup non trouvé: $backup_file"
        exit 1
    fi

    log_warn "ATTENTION: Cette opération va restaurer la base de données!"
    read -p "Continuer? (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        log_info "Restauration annulée"
        exit 0
    fi

    log_info "Restauration en cours..."

    if docker ps --format '{{.Names}}' | grep -q "$DOCKER_CONTAINER"; then
        # Restauration via Docker
        if [[ "$backup_file" == *.sql.gz ]]; then
            gunzip -c "$backup_file" | docker exec -i "$DOCKER_CONTAINER" \
                psql -U "$DB_USER" -d "$DB_NAME"
        else
            gunzip -c "$backup_file" | docker exec -i "$DOCKER_CONTAINER" \
                pg_restore -U "$DB_USER" -d "$DB_NAME" --clean --if-exists
        fi
    else
        # Restauration directe
        export PGPASSWORD="$DB_PASSWORD"
        if [[ "$backup_file" == *.sql.gz ]]; then
            gunzip -c "$backup_file" | psql -h "$DB_HOST" -p "$DB_PORT" \
                -U "$DB_USER" -d "$DB_NAME"
        else
            gunzip -c "$backup_file" | pg_restore -h "$DB_HOST" -p "$DB_PORT" \
                -U "$DB_USER" -d "$DB_NAME" --clean --if-exists
        fi
        unset PGPASSWORD
    fi

    log_info "Restauration terminée!"
}

# Liste des backups disponibles
list_backups() {
    echo ""
    echo "Backups disponibles dans $BACKUP_DIR:"
    echo "========================================"

    if [ -d "$BACKUP_DIR" ] && [ "$(ls -A "$BACKUP_DIR"/*.gz 2>/dev/null)" ]; then
        ls -lh "$BACKUP_DIR"/*.gz | awk '{print $9, "-", $5, "-", $6, $7, $8}'
    else
        echo "Aucun backup trouvé"
    fi
    echo ""
}

# Notification (optionnel - webhook Discord/Slack)
send_notification() {
    local status="$1"
    local message="$2"

    if [ -n "$WEBHOOK_URL" ]; then
        curl -s -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"content\": \"[CGI 242 Backup] $status: $message\"}" \
            > /dev/null 2>&1 || true
    fi
}

# Main
main() {
    echo ""
    echo "============================================"
    echo "CGI 242 - Système de Backup PostgreSQL"
    echo "============================================"
    echo ""

    case "${1:-}" in
        --restore)
            if [ -z "${2:-}" ]; then
                log_error "Spécifiez le fichier de backup à restaurer"
                list_backups
                exit 1
            fi
            restore_backup "$2"
            ;;
        --list)
            list_backups
            ;;
        --upload-s3)
            create_backup_dir
            if docker ps --format '{{.Names}}' | grep -q "$DOCKER_CONTAINER"; then
                backup_docker
            else
                backup_direct
            fi
            verify_backup && rotate_backups && upload_to_s3
            send_notification "SUCCESS" "Backup ${BACKUP_NAME} créé et uploadé"
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  (aucune)      Créer un backup local"
            echo "  --upload-s3   Créer un backup et l'uploader vers S3"
            echo "  --restore FILE Restaurer depuis un fichier backup"
            echo "  --list        Lister les backups disponibles"
            echo "  --help        Afficher cette aide"
            echo ""
            echo "Variables d'environnement:"
            echo "  BACKUP_DIR        Répertoire des backups (défaut: ./backups)"
            echo "  RETENTION_DAYS    Jours de rétention (défaut: 7)"
            echo "  AWS_S3_BUCKET     Bucket S3 pour upload"
            echo "  WEBHOOK_URL       URL webhook pour notifications"
            ;;
        *)
            create_backup_dir
            if docker ps --format '{{.Names}}' | grep -q "$DOCKER_CONTAINER" 2>/dev/null; then
                backup_docker
            else
                backup_direct
            fi
            verify_backup && rotate_backups
            send_notification "SUCCESS" "Backup ${BACKUP_NAME} créé avec succès"
            ;;
    esac
}

main "$@"
