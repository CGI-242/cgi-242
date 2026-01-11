import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { TenantService } from './tenant.service';
import { environment } from '@env/environment';
import { LoggerService } from './logger.service';

/**
 * Types d'actions auditees
 * SECURITE: Journalisation des actions sensibles pour detection d'abus de privileges
 */
export type AuditAction =
  // Organisation
  | 'org.create'
  | 'org.update'
  | 'org.delete'
  // Membres
  | 'member.invite'
  | 'member.remove'
  | 'member.role_update'
  | 'invitation.cancel'
  // Authentification
  | 'auth.login'
  | 'auth.logout'
  | 'auth.password_change'
  | 'auth.failed_login'
  // Donnees sensibles
  | 'data.export'
  | 'data.delete'
  // Administration
  | 'admin.user_impersonate'
  | 'admin.config_change';

export interface AuditEntry {
  action: AuditAction;
  details?: Record<string, unknown>;
  targetUserId?: string;
  targetOrgId?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Service de journalisation des actions sensibles
 *
 * Permet de:
 * - Tracer les actions privilegiees (invitations, suppressions, changements de role)
 * - Detecter les tentatives d'abus de privileges
 * - Fournir un historique pour les audits de securite
 *
 * Les logs sont envoyes au backend pour stockage persistant
 */
@Injectable({ providedIn: 'root' })
export class AuditService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private tenantService = inject(TenantService);
  private logger = inject(LoggerService);

  private readonly apiUrl = `${environment.apiUrl}/audit`;

  /**
   * Enregistre une action dans le journal d'audit
   *
   * @param action - Type d'action (ex: 'member.invite', 'member.remove')
   * @param details - Details additionnels (ex: { email: 'user@example.com', role: 'ADMIN' })
   */
  log(action: AuditAction, details?: Record<string, unknown>): void {
    const user = this.authService.user();
    const orgId = this.tenantService.organizationId();

    const entry: AuditEntry = {
      action,
      details,
      targetOrgId: orgId ?? undefined,
      userAgent: navigator.userAgent,
    };

    // Log local pour debug
    this.logger.info(`[AUDIT] ${action}`, 'AuditService', { userId: user?.id, orgId, details });

    // Envoi au backend (fire-and-forget pour ne pas bloquer l'UI)
    this.http.post(this.apiUrl, entry, { withCredentials: true }).subscribe({
      error: (err) => {
        this.logger.warn('[AUDIT] Failed to send audit log', 'AuditService', { action, error: err.message });
      }
    });
  }

  /**
   * Log specifique pour les actions de membre
   */
  logMemberAction(
    action: 'member.invite' | 'member.remove' | 'member.role_update',
    targetEmail: string,
    role?: string
  ): void {
    this.log(action, { targetEmail, role });
  }

  /**
   * Log specifique pour les tentatives d'elevation de privileges
   */
  logPrivilegeEscalationAttempt(attemptedRole: string, currentRole: string): void {
    this.logger.warn('[SECURITY] Privilege escalation attempt detected', 'AuditService', {
      attemptedRole,
      currentRole,
      userId: this.authService.user()?.id,
    });

    this.log('member.invite', {
      blocked: true,
      reason: 'privilege_escalation_attempt',
      attemptedRole,
      currentRole,
    });
  }

  /**
   * Log des echecs de connexion (pour detection brute force)
   */
  logFailedLogin(email: string): void {
    this.log('auth.failed_login', { email });
  }
}
