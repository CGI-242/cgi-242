import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-external-redirect',
  standalone: true,
  template: `
    <div class="min-h-screen bg-normx-off-white flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-secondary-600">Redirection en cours...</p>
      </div>
    </div>
  `
})
export class ExternalRedirectComponent implements OnInit {
  private route = inject(ActivatedRoute);

  ngOnInit() {
    const url = this.route.snapshot.data['externalUrl'];
    if (url) {
      window.location.href = url;
    }
  }
}
