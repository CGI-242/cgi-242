import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrganizationService, Member, Invitation } from '@core/services/organization.service';
import { TenantService } from '@core/services/tenant.service';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-org-members',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      <!-- Invite form -->
      @if (canInvite()) {
        <div class="card p-6">
          <h3 class="font-semibold text-secondary-900 mb-4">Inviter un membre</h3>
          <form [formGroup]="inviteForm" (ngSubmit)="onInvite()" class="flex gap-4">
            <input
              type="email"
              formControlName="email"
              class="input flex-1"
              placeholder="email@exemple.com">
            <select formControlName="role" class="input w-40">
              <option value="MEMBER">Membre</option>
              <option value="ADMIN">Admin</option>
              <option value="VIEWER">Lecteur</option>
            </select>
            <button
              type="submit"
              class="btn-primary"
              [disabled]="inviteForm.invalid || isInviting()">
              Inviter
            </button>
          </form>
          @if (inviteError()) {
            <p class="text-red-500 text-sm mt-2">{{ inviteError() }}</p>
          }
          @if (inviteSuccess()) {
            <p class="text-green-600 text-sm mt-2">Invitation envoyée !</p>
          }
        </div>
      }

      <!-- Pending invitations -->
      @if (invitations().length > 0) {
        <div class="card p-6">
          <h3 class="font-semibold text-secondary-900 mb-4">Invitations en attente</h3>
          <div class="space-y-2">
            @for (invitation of invitations(); track invitation.id) {
              <div class="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div>
                  <p class="text-sm font-medium text-secondary-900">{{ invitation.email }}</p>
                  <p class="text-xs text-secondary-500">{{ getRoleLabel(invitation.role) }}</p>
                </div>
                <button
                  (click)="cancelInvitation(invitation.id)"
                  class="text-sm text-red-600 hover:text-red-700">
                  Annuler
                </button>
              </div>
            }
          </div>
        </div>
      }

      <!-- Members list -->
      <div class="card p-6">
        <h3 class="font-semibold text-secondary-900 mb-4">Membres</h3>

        @if (isLoading()) {
          <app-loading-spinner />
        } @else {
          <div class="space-y-2">
            @for (member of members(); track member.id) {
              <div class="flex items-center justify-between p-3 hover:bg-secondary-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span class="text-primary-600 font-medium">
                      {{ getInitials(member.user) }}
                    </span>
                  </div>
                  <div>
                    <p class="font-medium text-secondary-900">
                      {{ member.user.firstName ?? '' }} {{ member.user.lastName ?? '' }}
                      @if (!member.user.firstName && !member.user.lastName) {
                        {{ member.user.email }}
                      }
                    </p>
                    <p class="text-sm text-secondary-500">{{ member.user.email }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <span class="text-sm px-2 py-1 rounded-full"
                    [class.bg-primary-100]="member.role === 'OWNER'"
                    [class.text-primary-700]="member.role === 'OWNER'"
                    [class.bg-secondary-100]="member.role !== 'OWNER'"
                    [class.text-secondary-700]="member.role !== 'OWNER'">
                    {{ getRoleLabel(member.role) }}
                  </span>
                  @if (canManageMember(member)) {
                    <button
                      (click)="removeMember(member.user.id)"
                      class="text-sm text-red-600 hover:text-red-700">
                      Retirer
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class OrgMembersComponent implements OnInit {
  private fb = inject(FormBuilder);
  private orgService = inject(OrganizationService);
  private tenantService = inject(TenantService);

  members = signal<Member[]>([]);
  invitations = signal<Invitation[]>([]);
  isLoading = signal(true);
  isInviting = signal(false);
  inviteError = signal('');
  inviteSuccess = signal(false);

  inviteForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    role: ['MEMBER' as const],
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const orgId = this.tenantService.organizationId();
    if (!orgId) return;

    this.orgService.getMembers(orgId).subscribe((members) => {
      this.members.set(members);
      this.isLoading.set(false);
    });

    if (this.tenantService.hasMinimumRole('ADMIN')) {
      this.orgService.getPendingInvitations(orgId).subscribe((invitations) => {
        this.invitations.set(invitations);
      });
    }
  }

  canInvite(): boolean {
    return this.tenantService.hasMinimumRole('ADMIN');
  }

  canManageMember(member: Member): boolean {
    if (member.role === 'OWNER') return false;
    return this.tenantService.hasMinimumRole('ADMIN');
  }

  onInvite(): void {
    const orgId = this.tenantService.organizationId();
    if (!orgId || this.inviteForm.invalid) return;

    this.isInviting.set(true);
    this.inviteError.set('');
    this.inviteSuccess.set(false);

    const { email, role } = this.inviteForm.getRawValue();

    this.orgService.inviteMember(orgId, email, role).subscribe({
      next: (res) => {
        this.isInviting.set(false);
        if (res.success) {
          this.inviteSuccess.set(true);
          this.inviteForm.reset({ email: '', role: 'MEMBER' });
          this.loadData();
        } else {
          this.inviteError.set(res.error ?? "Erreur lors de l'invitation");
        }
      },
      error: () => {
        this.isInviting.set(false);
        this.inviteError.set("Erreur lors de l'invitation");
      },
    });
  }

  cancelInvitation(invitationId: string): void {
    const orgId = this.tenantService.organizationId();
    if (!orgId) return;

    this.orgService.cancelInvitation(orgId, invitationId).subscribe(() => {
      this.invitations.update((inv) => inv.filter((i) => i.id !== invitationId));
    });
  }

  removeMember(userId: string): void {
    const orgId = this.tenantService.organizationId();
    if (!orgId) return;

    this.orgService.removeMember(orgId, userId).subscribe(() => {
      this.members.update((m) => m.filter((member) => member.user.id !== userId));
    });
  }

  getInitials(user: { firstName: string | null; lastName: string | null; email: string }): string {
    const first = user.firstName?.charAt(0) ?? '';
    const last = user.lastName?.charAt(0) ?? '';
    return (first + last).toUpperCase() || user.email.charAt(0).toUpperCase();
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      OWNER: 'Propriétaire',
      ADMIN: 'Admin',
      MEMBER: 'Membre',
      VIEWER: 'Lecteur',
    };
    return labels[role] ?? role;
  }
}
