# Guide DevOps - CGI 242

## Outils de Sécurité Implémentés

Ce guide documente les outils DevOps mis en place conformément aux recommandations de cybersécurité.

---

## 1. Sauvegardes Automatiques (Protection Ransomware)

### Script: `scripts/devops/backup-database.sh`

**Objectif:** Sauvegardes régulières des données pour récupération en cas d'attaque ransomware.

### Utilisation

```bash
# Backup local
./scripts/devops/backup-database.sh

# Backup + upload S3
./scripts/devops/backup-database.sh --upload-s3

# Lister les backups
./scripts/devops/backup-database.sh --list

# Restauration
./scripts/devops/backup-database.sh --restore backups/cgi_engine_backup_20260111.sql.gz
```

### Configuration Cron (quotidien à 2h)

```bash
# Éditer crontab
crontab -e

# Ajouter cette ligne
0 2 * * * /home/christelle-mabika/cgi-engine/scripts/devops/backup-database.sh >> /var/log/cgi-backup.log 2>&1
```

### Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `BACKUP_DIR` | Répertoire des backups | `./backups` |
| `RETENTION_DAYS` | Jours de rétention | `7` |
| `AWS_S3_BUCKET` | Bucket S3 (optionnel) | - |
| `WEBHOOK_URL` | Notifications Discord/Slack | - |

---

## 2. Scan de Sécurité (Mises à jour)

### Script: `scripts/devops/security-scan.sh`

**Objectif:** Détection des vulnérabilités dans les dépendances npm.

### Utilisation

```bash
# Scan standard
./scripts/devops/security-scan.sh

# Scan + correction automatique
./scripts/devops/security-scan.sh --fix

# Rapport complet
./scripts/devops/security-scan.sh --report
```

### Configuration Cron (hebdomadaire le lundi)

```bash
0 8 * * 1 /home/christelle-mabika/cgi-engine/scripts/devops/security-scan.sh --report >> /var/log/cgi-security.log 2>&1
```

### Ce que le script vérifie

1. **Vulnérabilités npm** (npm audit)
   - Backend (server)
   - Frontend (client)
2. **Secrets exposés** dans le code
3. **Dépendances obsolètes**
4. **Score de sécurité** global

---

## 3. GitHub Actions (CI/CD Sécurisé)

### Workflow: `.github/workflows/security-scan.yml`

**Exécution automatique:**
- Chaque lundi à 8h UTC
- Sur chaque PR modifiant package.json
- Manuellement via GitHub Actions

### Vérifications effectuées

| Check | Description |
|-------|-------------|
| NPM Audit | Vulnérabilités des dépendances |
| CodeQL | Analyse statique du code |
| TruffleHog | Détection de secrets |
| Gitleaks | Secrets dans l'historique git |
| Dependency Review | Revue des nouvelles deps (PR) |

---

## 4. Mises à Jour Automatiques (Dependabot)

### Fichier: `.github/dependabot.yml`

**Déjà configuré pour:**
- Dépendances frontend (Angular)
- Dépendances backend (Express)
- GitHub Actions

**Fréquence:** Hebdomadaire (lundi 9h, fuseau Brazzaville)

---

## 5. Plan de Continuité

### Éléments en place

| Élément | Statut | Fichier/Endpoint |
|---------|--------|------------------|
| Health checks | ✅ | `/health` |
| Métriques Prometheus | ✅ | `/metrics` |
| Réplication PostgreSQL | ✅ | docker-compose.prod.yml |
| Load balancing | ✅ | 2 instances backend |
| SSL auto-renew | ✅ | Certbot |
| Logging centralisé | ✅ | Winston + Sentry |

### En cas d'incident

1. **Vérifier les health checks**
   ```bash
   curl https://api.cgi242.normx-ai.com/health
   ```

2. **Vérifier les logs**
   ```bash
   docker compose -f docker/docker-compose.prod.yml logs -f --tail=100
   ```

3. **Restaurer depuis backup**
   ```bash
   ./scripts/devops/backup-database.sh --restore <backup_file>
   ```

4. **Rollback Docker**
   ```bash
   docker compose -f docker/docker-compose.prod.yml down
   docker compose -f docker/docker-compose.prod.yml up -d --no-build
   ```

---

## 6. Checklist de Sécurité Mensuelle

- [ ] Exécuter le scan de sécurité complet
- [ ] Vérifier les alertes Dependabot
- [ ] Tester la restauration d'un backup
- [ ] Revoir les logs d'audit
- [ ] Vérifier les certificats SSL (expiration)
- [ ] Mettre à jour les secrets (rotation)

---

## Conformité aux Cours Cybersécurité

| Règle du Cours | Implémentation |
|----------------|----------------|
| Antivirus/mise à jour | GitHub Actions + Dependabot |
| Sauvegardes régulières | backup-database.sh (quotidien) |
| Protection DDoS | Rate limiting + Nginx |
| Surveillance trafic | Prometheus + Health checks |
| Plan de continuité | Réplication + Load balancing |
| Plan de réponse incidents | Guide de restauration |

---

*Document mis à jour le: 11 janvier 2026*
