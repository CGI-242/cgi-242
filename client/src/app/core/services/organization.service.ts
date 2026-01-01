import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  website?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  subscription?: {
    plan: string;
    questionsPerMonth: number;
    questionsUsed: number;
    maxMembers: number;
  };
  _count?: { members: number };
}

export interface OrganizationMembership {
  organization: Organization;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  joinedAt: string;
}

export interface Member {
  id: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  joinedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    avatar?: string;
    profession?: string;
  };
}

export interface Invitation {
  id: string;
  email: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  expiresAt: string;
  createdAt: string;
  invitedBy: {
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export interface CreateOrgData {
  name: string;
  slug?: string;
  website?: string;
  phone?: string;
}

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private api = inject(ApiService);

  getUserOrganizations(): Observable<OrganizationMembership[]> {
    return this.api.get<OrganizationMembership[]>('/organizations').pipe(
      map((res) => res.data ?? [])
    );
  }

  getOrganization(orgId: string): Observable<Organization | null> {
    return this.api.get<Organization>(`/organizations/${orgId}`).pipe(
      map((res) => res.data ?? null)
    );
  }

  createOrganization(data: CreateOrgData): Observable<ApiResponse<Organization>> {
    return this.api.post<Organization, CreateOrgData>('/organizations', data);
  }

  updateOrganization(orgId: string, data: Partial<CreateOrgData>): Observable<ApiResponse<Organization>> {
    return this.api.put<Organization, Partial<CreateOrgData>>(`/organizations/${orgId}`, data);
  }

  deleteOrganization(orgId: string): Observable<ApiResponse<null>> {
    return this.api.delete<null>(`/organizations/${orgId}`);
  }

  getMembers(orgId: string): Observable<Member[]> {
    return this.api.get<Member[]>(`/organizations/${orgId}/members`).pipe(
      map((res) => res.data ?? [])
    );
  }

  inviteMember(orgId: string, email: string, role: string): Observable<ApiResponse<Invitation>> {
    return this.api.post<Invitation, { email: string; role: string }>(
      `/organizations/${orgId}/members/invite`,
      { email, role }
    );
  }

  updateMemberRole(orgId: string, userId: string, role: string): Observable<ApiResponse<Member>> {
    return this.api.put<Member, { role: string }>(
      `/organizations/${orgId}/members/${userId}/role`,
      { role }
    );
  }

  removeMember(orgId: string, userId: string): Observable<ApiResponse<null>> {
    return this.api.delete<null>(`/organizations/${orgId}/members/${userId}`);
  }

  getPendingInvitations(orgId: string): Observable<Invitation[]> {
    return this.api.get<Invitation[]>(`/organizations/${orgId}/invitations`).pipe(
      map((res) => res.data ?? [])
    );
  }

  cancelInvitation(orgId: string, invitationId: string): Observable<ApiResponse<null>> {
    return this.api.delete<null>(`/organizations/${orgId}/invitations/${invitationId}`);
  }

  acceptInvitation(token: string): Observable<ApiResponse<Member>> {
    return this.api.post<Member, { token: string }>('/organizations/accept-invitation', { token });
  }
}
