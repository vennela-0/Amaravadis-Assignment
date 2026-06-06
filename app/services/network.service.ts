import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

/**
 * NetworkService
 * ---------------
 * Wraps the Capacitor Network plugin and exposes the connectivity state
 * as an RxJS stream so the rest of the app can react in real time.
 */
@Injectable({ providedIn: 'root' })
export class NetworkService {
  private readonly online$ = new BehaviorSubject<boolean>(true);
  private initialized = false;

  /** Read the initial status and subscribe to live changes. */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    this.initialized = true;

    const status = await Network.getStatus();
    this.online$.next(status.connected);

    Network.addListener('networkStatusChange', (status) => {
      console.log('[NetworkService] Status change ->', status.connected);
      this.online$.next(status.connected);
    });
  }

  /** Live connectivity stream (true = online). Emits only on real changes. */
  get isOnline$(): Observable<boolean> {
    return this.online$.pipe(distinctUntilChanged());
  }

  /** Current connectivity snapshot. */
  get isOnline(): boolean {
    return this.online$.value;
  }
}
