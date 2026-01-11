#!/bin/bash

# ============================================================
# CGI 242 - Script de Scan de Sécurité
# ============================================================
# Conforme aux recommandations cybersécurité:
# - Mises à jour régulières des dépendances
# - Détection des vulnérabilités connues
# - Audit de sécurité automatisé
# ============================================================
# Usage:
#   ./security-scan.sh              # Scan complet
#   ./security-scan.sh --fix        # Scan + correction auto
#   ./security-scan.sh --report     # Générer rapport MD
#
# Cron (hebdomadaire le lundi à 8h):
#   0 8 * * 1 /path/to/security-scan.sh --report >> /var/log/cgi-security.log 2>&1
# ============================================================

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
REPORTS_DIR="$PROJECT_DIR/docs/rapports-securite"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="$REPORTS_DIR/security-scan_${TIMESTAMP}.md"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Compteurs
TOTAL_VULNS=0
CRITICAL_VULNS=0
HIGH_VULNS=0
MODERATE_VULNS=0

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_section() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Créer le répertoire de rapports
init_report() {
    mkdir -p "$REPORTS_DIR"

    cat > "$REPORT_FILE" << EOF
# Rapport de Scan de Sécurité - CGI 242

**Date:** $(date '+%Y-%m-%d %H:%M:%S')
**Projet:** cgi-engine
**Outil:** security-scan.sh

---

EOF
}

# Scanner les vulnérabilités npm (serveur)
scan_server() {
    log_section "Scan du Backend (server)"

    cd "$PROJECT_DIR/server"

    echo "## Backend (Node.js/Express)" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"

    if [ -f "package-lock.json" ]; then
        log_info "Exécution de npm audit..."

        # Capturer le résultat
        local audit_result
        audit_result=$(npm audit --json 2>/dev/null || true)

        # Parser les résultats
        local total=$(echo "$audit_result" | jq -r '.metadata.vulnerabilities.total // 0')
        local critical=$(echo "$audit_result" | jq -r '.metadata.vulnerabilities.critical // 0')
        local high=$(echo "$audit_result" | jq -r '.metadata.vulnerabilities.high // 0')
        local moderate=$(echo "$audit_result" | jq -r '.metadata.vulnerabilities.moderate // 0')
        local low=$(echo "$audit_result" | jq -r '.metadata.vulnerabilities.low // 0')

        TOTAL_VULNS=$((TOTAL_VULNS + total))
        CRITICAL_VULNS=$((CRITICAL_VULNS + critical))
        HIGH_VULNS=$((HIGH_VULNS + high))
        MODERATE_VULNS=$((MODERATE_VULNS + moderate))

        # Afficher et logger
        if [ "$total" -eq 0 ]; then
            log_info "Aucune vulnérabilité détectée"
            echo "| Statut | Aucune vulnérabilité |" >> "$REPORT_FILE"
        else
            log_warn "Vulnérabilités détectées: $total"
            echo "| Sévérité | Nombre |" >> "$REPORT_FILE"
            echo "|----------|--------|" >> "$REPORT_FILE"
            echo "| Critical | $critical |" >> "$REPORT_FILE"
            echo "| High | $high |" >> "$REPORT_FILE"
            echo "| Moderate | $moderate |" >> "$REPORT_FILE"
            echo "| Low | $low |" >> "$REPORT_FILE"
        fi

        echo "" >> "$REPORT_FILE"

        # Lister les vulnérabilités critiques
        if [ "$critical" -gt 0 ] || [ "$high" -gt 0 ]; then
            echo "### Vulnérabilités Critiques/High" >> "$REPORT_FILE"
            echo '```' >> "$REPORT_FILE"
            npm audit --omit=dev 2>/dev/null | head -50 >> "$REPORT_FILE" || true
            echo '```' >> "$REPORT_FILE"
            echo "" >> "$REPORT_FILE"
        fi
    else
        log_warn "package-lock.json non trouvé"
    fi
}

# Scanner les vulnérabilités npm (client)
scan_client() {
    log_section "Scan du Frontend (client)"

    cd "$PROJECT_DIR/client"

    echo "## Frontend (Angular)" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"

    if [ -f "package-lock.json" ]; then
        log_info "Exécution de npm audit..."

        local audit_result
        audit_result=$(npm audit --json 2>/dev/null || true)

        local total=$(echo "$audit_result" | jq -r '.metadata.vulnerabilities.total // 0')
        local critical=$(echo "$audit_result" | jq -r '.metadata.vulnerabilities.critical // 0')
        local high=$(echo "$audit_result" | jq -r '.metadata.vulnerabilities.high // 0')
        local moderate=$(echo "$audit_result" | jq -r '.metadata.vulnerabilities.moderate // 0')
        local low=$(echo "$audit_result" | jq -r '.metadata.vulnerabilities.low // 0')

        TOTAL_VULNS=$((TOTAL_VULNS + total))
        CRITICAL_VULNS=$((CRITICAL_VULNS + critical))
        HIGH_VULNS=$((HIGH_VULNS + high))
        MODERATE_VULNS=$((MODERATE_VULNS + moderate))

        if [ "$total" -eq 0 ]; then
            log_info "Aucune vulnérabilité détectée"
            echo "| Statut | Aucune vulnérabilité |" >> "$REPORT_FILE"
        else
            log_warn "Vulnérabilités détectées: $total"
            echo "| Sévérité | Nombre |" >> "$REPORT_FILE"
            echo "|----------|--------|" >> "$REPORT_FILE"
            echo "| Critical | $critical |" >> "$REPORT_FILE"
            echo "| High | $high |" >> "$REPORT_FILE"
            echo "| Moderate | $moderate |" >> "$REPORT_FILE"
            echo "| Low | $low |" >> "$REPORT_FILE"
        fi

        echo "" >> "$REPORT_FILE"
    fi
}

# Vérifier les secrets exposés
scan_secrets() {
    log_section "Scan des Secrets Exposés"

    cd "$PROJECT_DIR"

    echo "## Secrets et Données Sensibles" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"

    log_info "Recherche de secrets potentiellement exposés..."

    # Patterns à rechercher
    local patterns=(
        "password.*=.*['\"]"
        "api_key.*=.*['\"]"
        "secret.*=.*['\"]"
        "token.*=.*['\"]"
        "private_key"
        "BEGIN RSA PRIVATE KEY"
        "BEGIN OPENSSH PRIVATE KEY"
    )

    local found_secrets=0

    for pattern in "${patterns[@]}"; do
        local matches
        matches=$(grep -r -l -i "$pattern" --include="*.ts" --include="*.js" --include="*.json" \
            --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git \
            --exclude="*.example" --exclude="*.test.*" 2>/dev/null | wc -l || echo "0")

        if [ "$matches" -gt 0 ]; then
            found_secrets=$((found_secrets + matches))
        fi
    done

    if [ "$found_secrets" -eq 0 ]; then
        log_info "Aucun secret exposé détecté"
        echo "| Statut | Aucun secret exposé dans le code |" >> "$REPORT_FILE"
    else
        log_warn "Fichiers potentiellement sensibles: $found_secrets"
        echo "| Attention | $found_secrets fichiers à vérifier |" >> "$REPORT_FILE"
    fi

    echo "" >> "$REPORT_FILE"

    # Vérifier .env.example existe
    if [ -f "$PROJECT_DIR/server/.env.example" ]; then
        log_info ".env.example présent (bonne pratique)"
    else
        log_warn ".env.example manquant"
    fi
}

# Vérifier les dépendances obsolètes
check_outdated() {
    log_section "Dépendances Obsolètes"

    echo "## Dépendances Obsolètes" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"

    log_info "Vérification des mises à jour disponibles..."

    echo "### Backend" >> "$REPORT_FILE"
    echo '```' >> "$REPORT_FILE"
    cd "$PROJECT_DIR/server"
    npm outdated 2>/dev/null | head -20 >> "$REPORT_FILE" || echo "Toutes les dépendances sont à jour" >> "$REPORT_FILE"
    echo '```' >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"

    echo "### Frontend" >> "$REPORT_FILE"
    echo '```' >> "$REPORT_FILE"
    cd "$PROJECT_DIR/client"
    npm outdated 2>/dev/null | head -20 >> "$REPORT_FILE" || echo "Toutes les dépendances sont à jour" >> "$REPORT_FILE"
    echo '```' >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
}

# Correction automatique
auto_fix() {
    log_section "Correction Automatique"

    log_info "Application des corrections automatiques..."

    cd "$PROJECT_DIR/server"
    log_info "Correction backend..."
    npm audit fix --force 2>/dev/null || true

    cd "$PROJECT_DIR/client"
    log_info "Correction frontend..."
    npm audit fix --force 2>/dev/null || true

    log_info "Corrections appliquées"
}

# Résumé final
generate_summary() {
    log_section "Résumé"

    cat >> "$REPORT_FILE" << EOF
---

## Résumé Global

| Métrique | Valeur |
|----------|--------|
| Total Vulnérabilités | $TOTAL_VULNS |
| Critical | $CRITICAL_VULNS |
| High | $HIGH_VULNS |
| Moderate | $MODERATE_VULNS |
| Date Scan | $(date '+%Y-%m-%d %H:%M') |

EOF

    # Score de sécurité
    local score=100
    score=$((score - CRITICAL_VULNS * 25))
    score=$((score - HIGH_VULNS * 10))
    score=$((score - MODERATE_VULNS * 2))
    [ $score -lt 0 ] && score=0

    cat >> "$REPORT_FILE" << EOF
### Score de Sécurité: ${score}/100

EOF

    if [ $CRITICAL_VULNS -gt 0 ]; then
        echo "**ACTION REQUISE:** Vulnérabilités critiques détectées!" >> "$REPORT_FILE"
    elif [ $HIGH_VULNS -gt 0 ]; then
        echo "**ATTENTION:** Vulnérabilités high à corriger." >> "$REPORT_FILE"
    elif [ $TOTAL_VULNS -eq 0 ]; then
        echo "**EXCELLENT:** Aucune vulnérabilité détectée." >> "$REPORT_FILE"
    else
        echo "**BON:** Vulnérabilités mineures uniquement." >> "$REPORT_FILE"
    fi

    echo "" >> "$REPORT_FILE"
    echo "---" >> "$REPORT_FILE"
    echo "*Rapport généré automatiquement par security-scan.sh*" >> "$REPORT_FILE"

    # Afficher résumé console
    echo ""
    echo "========================================"
    echo "RÉSUMÉ DU SCAN DE SÉCURITÉ"
    echo "========================================"
    echo "Total vulnérabilités: $TOTAL_VULNS"
    echo "  - Critical: $CRITICAL_VULNS"
    echo "  - High: $HIGH_VULNS"
    echo "  - Moderate: $MODERATE_VULNS"
    echo "Score: ${score}/100"
    echo ""
    echo "Rapport: $REPORT_FILE"
    echo "========================================"
}

# Notification webhook
send_notification() {
    if [ -n "$WEBHOOK_URL" ]; then
        local status="SUCCESS"
        [ $CRITICAL_VULNS -gt 0 ] && status="CRITICAL"
        [ $HIGH_VULNS -gt 0 ] && status="WARNING"

        curl -s -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"content\": \"[CGI 242 Security] $status: $TOTAL_VULNS vulnérabilités ($CRITICAL_VULNS critical)\"}" \
            > /dev/null 2>&1 || true
    fi
}

# Main
main() {
    echo ""
    echo "============================================"
    echo "CGI 242 - Scan de Sécurité"
    echo "============================================"
    echo ""

    case "${1:-}" in
        --fix)
            init_report
            scan_server
            scan_client
            scan_secrets
            auto_fix
            scan_server  # Re-scan après fix
            scan_client
            generate_summary
            ;;
        --report)
            init_report
            scan_server
            scan_client
            scan_secrets
            check_outdated
            generate_summary
            send_notification
            ;;
        --quick)
            init_report
            scan_server
            scan_client
            generate_summary
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  (aucune)   Scan rapide (vulnérabilités uniquement)"
            echo "  --fix      Scan + correction automatique"
            echo "  --report   Scan complet avec rapport détaillé"
            echo "  --quick    Scan rapide sans rapport fichier"
            echo "  --help     Afficher cette aide"
            echo ""
            echo "Variables d'environnement:"
            echo "  WEBHOOK_URL    URL webhook pour notifications"
            ;;
        *)
            init_report
            scan_server
            scan_client
            scan_secrets
            generate_summary
            ;;
    esac
}

main "$@"
