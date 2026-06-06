import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  add,
  cloudDoneOutline,
  cloudOfflineOutline,
  cloudUploadOutline,
  createOutline,
  trashOutline,
  checkmarkCircle,
  ellipseOutline,
  wifiOutline,
  closeCircleOutline,
  syncOutline,
  saveOutline,
  arrowBackOutline,
  listOutline,
  refreshOutline,
} from 'ionicons/icons';

import { DatabaseService } from './services/database.service';
import { NetworkService } from './services/network.service';
import { SyncService } from './services/sync.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
  template: `
    <ion-app>
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `,
})
export class AppComponent implements OnInit {
  constructor(
    private database: DatabaseService,
    private network: NetworkService,
    private sync: SyncService
  ) {
    // Register the Ionicons used across the app (tree-shakable standalone setup).
    addIcons({
      add,
      'cloud-done-outline': cloudDoneOutline,
      'cloud-offline-outline': cloudOfflineOutline,
      'cloud-upload-outline': cloudUploadOutline,
      'create-outline': createOutline,
      'trash-outline': trashOutline,
      'checkmark-circle': checkmarkCircle,
      'ellipse-outline': ellipseOutline,
      'wifi-outline': wifiOutline,
      'close-circle-outline': closeCircleOutline,
      'sync-outline': syncOutline,
      'save-outline': saveOutline,
      'arrow-back-outline': arrowBackOutline,
      'list-outline': listOutline,
      'refresh-outline': refreshOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    // 1. Initialise SQLite (creates the web store + opens the DB and tables).
    await this.database.initializeDatabase();

    // 2. Start listening for connectivity changes.
    await this.network.initialize();

    // 3. Wire up automatic sync whenever the device comes back online.
    this.sync.startAutoSync();
  }
}
