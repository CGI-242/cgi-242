#!/bin/bash

# ============================================================
# CGI 242 - Script de Déploiement Production
# ============================================================
# Usage: ./deploy-production.sh
# ============================================================

set -e

echo "=========================================="
echo "CGI 242 - Déploiement Production"
echo "=========================================="

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Répertoire du projet
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo -e "${YELLOW}1. Récupération des dernières modifications...${NC}"
git fetch origin
git pull origin feat/landing-refonte-hero-pricing

echo -e "${YELLOW}2. Installation des dépendances serveur...${NC}"
cd server
npm ci --production=false

echo -e "${YELLOW}3. Migration de la base de données...${NC}"
npx prisma generate
npx prisma db push --accept-data-loss

echo -e "${YELLOW}4. Build du serveur...${NC}"
npm run build

echo -e "${YELLOW}5. Installation des dépendances client...${NC}"
cd ../client
npm ci --production=false

echo -e "${YELLOW}6. Build du client (production)...${NC}"
npm run build -- --configuration=production

echo -e "${YELLOW}7. Redémarrage des services Docker...${NC}"
cd ../docker

# Vérifier si docker compose (v2) ou docker-compose (v1) est disponible
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

echo "Utilisation de: $DOCKER_COMPOSE"

# Arrêter les anciens conteneurs
$DOCKER_COMPOSE -f docker-compose.prod.yml down --remove-orphans || true

# Reconstruire et démarrer
$DOCKER_COMPOSE -f docker-compose.prod.yml up -d --build

echo -e "${YELLOW}8. Vérification des services...${NC}"
sleep 10
$DOCKER_COMPOSE -f docker-compose.prod.yml ps

echo ""
echo -e "${GREEN}=========================================="
echo "Déploiement terminé avec succès!"
echo "==========================================${NC}"
echo ""
echo "Services déployés:"
echo "  - PostgreSQL Master + Replica"
echo "  - Redis Cache"
echo "  - Backend (2 instances)"
echo "  - Nginx Load Balancer + SSL"
echo ""
echo "Vérifier les logs:"
echo "  $DOCKER_COMPOSE -f docker-compose.prod.yml logs -f"
echo ""
