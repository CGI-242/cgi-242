import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TenantService } from './tenant.service';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

// Types de permissions disponibles
export const PERMISSIONS = {
  // Organisation
  ORG_VIEW: 'org:view',
  ORG_UPDATE: 'org:update',
  ORG_DELETE: 'org:delete',
  ORG_TRANSFER: 'org:transfer',

  // Membres
  MEMBERS_VIEW: 'members:view',
  MEMBERS_INVITE: 'members:invite',
  MEMBERS_REMOVE: 'members:remove',
  MEMBERS_ROLE_UPDATE: 'members:role_update',

  // Facturation
  BILLING_VIEW: 'billing:view',
  BILLING_MANAGE: 'billing:manage',
  BILLING_INVOICES: 'billing:invoices',

  // Conversations
  CONV_CREATE: 'conversations:create',
  CONV_VIEW_ALL: 'conversations:view_all',
  CONV_DELETE_ANY: 'conversations:delete_any',
  CONV_SHARE: 'conversations:share',

  // API
  API_KEYS_VIEW: 'api:keys_view',
  API_KEYS_CREATE: 'api:keys_create',
  API_KEYS_DELETE: 'api:keys_delete',

  // Analytics
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_EXPORT: 'analytics:export',
  AUDIT_VIEW: 'audit:view',

  // Articles (plan-based)
  ARTICLES_READ: 'articles:read',
  ARTICLES_UNLIMITED: 'articles:unlimited',
  ARTICLES_EXPORT: 'articles:export',

  // Chat IA (plan-based)
  CHAT_ACCESS: 'chat:access',
  CHAT_UNLIMITED: 'chat:unlimited',

  // Simulateurs (plan-based)
  SIMULATORS_ACCESS: 'simulators:access',

  // Admin
  USERS_MANAGE: 'users:manage',
  ADMIN_BILLING_VIEW: 'admin:billing_view',
  ADMIN_ORGS_MANAGE: 'admin:orgs_manage',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export interface PermissionState {
  rolePermissions: Permission[];
  planPermissions: Permission[];
  combined: Permission[];
  plan: string;
  role: string | null;
  loading: boolean;
  error: string | null;
}

const PERMISSIONS_CACHE_KEY = 'cgi_permissions_cache';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

interface CachedPermissions {
  data: PermissionState;
  timestamp: number;
  organizationId?: string;
}

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private http = inject(HttpClient);
  private tenantService = inject(TenantService);

  private permissionsSignal = signal<PermissionState>({
    rolePermissions: [],
    planPermissions: [],
    combined: [],
    plan: 'FREE',
    role: null,
    loading: false,
    error: null,
  });

  permissions = this.permissionsSignal.asReadonly();

  // Computed signals pour accès facile
  allPermissions = computed(() => this.permissionsSignal().combined);
  currentPlan = computed(() => this.permissionsSignal().plan);
  isLoading = computed(() => this.permissionsSignal().loading);

  constructor() {
    this.loadCachedPermissions();
  }

  /**
   * Charge les permissions depuis le serveur
   */
  async loadPermissions(): Promise<void> {
    const orgId = this.tenantService.organizationId();

    // Vérifier le cache
    const cached = this.getCachedPermissions(orgId);
    if (cached) {
      this.permissionsSignal.set(cached);
      return;
    }

    this.permissionsSignal.update((state) => ({ ...state, loading: true, error: null }));

    try {
      const response = await firstValueFrom(
        this.http.get<{ data: PermissionState }>(
          `${environment.apiUrl}/permissions/my`,
          { withCredentials: true }
        )
      );

      const newState: PermissionState = {
        ...response.data,
        loading: false,
        error: null,
      };

      this.permissionsSignal.set(newState);
      this.cachePermissions(newState, orgId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de chargement des permissions';
      this.permissionsSignal.update((state) => ({
        ...state,
        loading: false,
        error: message,
      }));
    }
  }

  /**
   * Vérifie si l'utilisateur a une permission spécifique
   */
  hasPermission(permission: Permission): boolean {
    return this.permissionsSignal().combined.includes(permission);
  }

  /**
   * Vérifie si l'utilisateur a toutes les permissions spécifiées
   */
  hasAllPermissions(...permissions: Permission[]): boolean {
    const userPerms = this.permissionsSignal().combined;
    return permissions.every((p) => userPerms.includes(p));
  }

  /**
   * Vérifie si l'utilisateur a au moins une des permissions spécifiées
   */
  hasAnyPermission(...permissions: Permission[]): boolean {
    const userPerms = this.permissionsSignal().combined;
    return permissions.some((p) => userPerms.includes(p));
  }

  /**
   * Vérifie une permission de manière synchrone (depuis le cache local)
   */
  can(permission: Permission): boolean {
    return this.hasPermission(permission);
  }

  /**
   * Vérifie une permission auprès du serveur (pour les actions critiques)
   */
  async checkPermission(permission: Permission): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ data: { hasPermission: boolean } }>(
          `${environment.apiUrl}/permissions/check/${permission}`,
          { withCredentials: true }
        )
      );
      return response.data.hasPermission;
    } catch {
      return false;
    }
  }

  /**
   * Invalide le cache des permissions (après changement de contexte)
   */
  invalidateCache(): void {
    localStorage.removeItem(PERMISSIONS_CACHE_KEY);
    this.permissionsSignal.set({
      rolePermissions: [],
      planPermissions: [],
      combined: [],
      plan: 'FREE',
      role: null,
      loading: false,
      error: null,
    });
  }

  /**
   * Recharge les permissions depuis le serveur
   */
  async refreshPermissions(): Promise<void> {
    this.invalidateCache();
    await this.loadPermissions();
  }

  // ========================================
  // Méthodes de cache privées
  // ========================================

  private getCachedPermissions(organizationId?: string): PermissionState | null {
    const cached = localStorage.getItem(PERMISSIONS_CACHE_KEY);
    if (!cached) return null;

    try {
      const parsed: CachedPermissions = JSON.parse(cached);

      // Vérifier si le cache est encore valide
      const isExpired = Date.now() - parsed.timestamp > CACHE_DURATION_MS;
      const isSameOrg = parsed.organizationId === organizationId;

      if (!isExpired && isSameOrg) {
        return parsed.data;
      }
    } catch {
      // Cache invalide, le supprimer
      localStorage.removeItem(PERMISSIONS_CACHE_KEY);
    }

    return null;
  }

  private cachePermissions(state: PermissionState, organizationId?: string): void {
    const cacheData: CachedPermissions = {
      data: state,
      timestamp: Date.now(),
      organizationId,
    };
    localStorage.setItem(PERMISSIONS_CACHE_KEY, JSON.stringify(cacheData));
  }

  private loadCachedPermissions(): void {
    const orgId = this.tenantService.organizationId();
    const cached = this.getCachedPermissions(orgId);
    if (cached) {
      this.permissionsSignal.set(cached);
    }
  }
}
