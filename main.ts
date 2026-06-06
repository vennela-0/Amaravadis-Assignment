import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';
import { Capacitor } from '@capacitor/core';
import { defineCustomElements as defineJeepSqlite } from 'jeep-sqlite/loader';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

// On the web, register the <jeep-sqlite> custom element so the SQLite WASM
// store can boot. Without this, DatabaseService.initializeDatabase() would
// wait forever on customElements.whenDefined('jeep-sqlite').
if (Capacitor.getPlatform() === 'web') {
  defineJeepSqlite(window);
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes),
  ],
}).catch((err) => console.error(err));
