#!/bin/bash

# ============================================================
# CGI 242 - Script de Deploiement Production (Docker)
# ============================================================
# Usage: ./deploy-production.sh
#
# Ce script deploie le serveur Node.js via Docker.
# Les services postgres, redis, qdrant et nginx tournent
# deja sur le VPS hote, seul le serveur est dockerise.
#
# Rollback si echec:
#   docker compose -f docker/docker-compose.server.yml down
#   pm2 start "npx tsx src/server.ts" --name cgi-server --cwd /opt/cgi-242/server
# ============================================================

set -e

echo "=========================================="
echo "CGI 242 - Deploiement Production (Docker)"
echo "=========================================="

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Repertoire du projet
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# Detecter docker compose v2 ou v1
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

echo "Utilisation de: $DOCKER_COMPOSE"

echo -e "${YELLOW}1. Recuperation des dernieres modifications...${NC}"
git fetch origin
git pull origin main

echo -e "${YELLOW}2. Build et demarrage du serveur Docker...${NC}"
$DOCKER_COMPOSE -f docker/docker-compose.server.yml up -d --build

echo -e "${YELLOW}3. Attente du demarrage (40s max)...${NC}"
sleep 10

echo -e "${YELLOW}4. Verification du health check...${NC}"
MAX_RETRIES=6
RETRY=0
while [ $RETRY -lt $MAX_RETRIES ]; do
    if curl -sf http://localhost:3002/health > /dev/null 2>&1; then
        echo -e "${GREEN}Health check OK${NC}"
        break
    fi
    RETRY=$((RETRY + 1))
    if [ $RETRY -eq $MAX_RETRIES ]; then
        echo -e "${RED}ERREUR: Le serveur ne repond pas apres ${MAX_RETRIES} tentatives${NC}"
        echo -e "${RED}Verifier les logs: $DOCKER_COMPOSE -f docker/docker-compose.server.yml logs${NC}"
        exit 1
    fi
    echo "  Tentative $RETRY/$MAX_RETRIES - attente 5s..."
    sleep 5
done

echo -e "${YELLOW}5. Statut des conteneurs...${NC}"
$DOCKER_COMPOSE -f docker/docker-compose.server.yml ps
docker stats --no-stream cgi-242-server

echo ""
echo -e "${GREEN}=========================================="
echo "Deploiement termine avec succes!"
echo "==========================================${NC}"
echo ""
echo "Service deploye:"
echo "  - Serveur Node.js (cgi-242-server) sur 127.0.0.1:3002"
echo ""
echo "Commandes utiles:"
echo "  Logs:     $DOCKER_COMPOSE -f docker/docker-compose.server.yml logs -f"
echo "  Restart:  $DOCKER_COMPOSE -f docker/docker-compose.server.yml restart"
echo "  Stop:     $DOCKER_COMPOSE -f docker/docker-compose.server.yml down"
echo "  Stats:    docker stats cgi-242-server"
echo ""
