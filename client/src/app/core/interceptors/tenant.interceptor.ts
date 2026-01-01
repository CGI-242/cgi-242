import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TenantService } from '../services/tenant.service';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tenantService = inject(TenantService);
  const orgId = tenantService.organizationId();

  if (orgId) {
    const tenantReq = req.clone({
      setHeaders: {
        'X-Organization-ID': orgId,
      },
    });
    return next(tenantReq);
  }

  return next(req);
};
