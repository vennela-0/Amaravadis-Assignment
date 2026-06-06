import { Component, Input } from '@angular/core';
import { IonBadge, IonIcon, IonSpinner } from '@ionic/angular/standalone';

/**
 * StatusBadge
 * ------------
 * Reusable connectivity badge. Renders Online / Offline / Syncing
 * depending on the inputs. Used in the dashboard header.
 */
@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [IonBadge, IonIcon, IonSpinner],
  template: `
    @if (syncing) {
      <ion-badge color="primary">
        <ion-spinner name="dots" class="badge-spinner"></ion-spinner>
        Syncing…
      </ion-badge>
    } @else if (online) {
      <ion-badge color="success">
        <ion-icon name="cloud-done-outline"></ion-icon>
        Online
      </ion-badge>
    } @else {
      <ion-badge color="danger">
        <ion-icon name="cloud-offline-outline"></ion-icon>
        Offline
      </ion-badge>
    }
  `,
  styles: [
    `
      ion-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        padding: 6px 10px;
        border-radius: 12px;
      }
      .badge-spinner {
        width: 14px;
        height: 14px;
      }
    `,
  ],
})
export class StatusBadgeComponent {
  @Input() online = true;
  @Input() syncing = false;
}
