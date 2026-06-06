import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { NetworkService } from './network.service';
import { TaskService } from './task.service';

/**
 * SyncService
 * ------------
 * Simulates synchronising pending tasks with a backend. There is NO real
 * server: when the device is online we wait a short, randomised delay to
 * mimic network latency and then flip each pending task to "synced".
 */
@Injectable({ providedIn: 'root' })
export class SyncService {
  private readonly syncing$ = new BehaviorSubject<boolean>(false);
  /** True while a sync run is in progress (used to show a spinner). */
  readonly isSyncing$ = this.syncing$.asObservable();

  constructor(
    private network: NetworkService,
    private tasks: TaskService,
    private toastCtrl: ToastController
  ) {}

  /** Subscribe to connectivity: every time we come back online, sync. */
  startAutoSync(): void {
    this.network.isOnline$
      .pipe(filter((online) => online === true))
      .subscribe(() => this.syncPendingTasks());
  }

  /**
   * Find all pending tasks, simulate API calls, then mark them synced.
   * Safe to call manually (e.g. from a "Sync now" button or pull-to-refresh).
   */
  async syncPendingTasks(): Promise<void> {
    // Guard: don't run while offline or if a sync is already in flight.
    if (!this.network.isOnline || this.syncing$.value) {
      return;
    }

    const pending = await this.tasks.getPendingTasks();
    if (pending.length === 0) {
      return;
    }

    this.syncing$.next(true);
    await this.showToast(`Syncing ${pending.length} task(s)…`, 'medium', 1500);

    try {
      for (const task of pending) {
        // Simulate a per-task API round-trip of ~1–2 seconds.
        await this.delay(1000 + Math.random() * 1000);
        await this.tasks.markAsSynced(task.id);
        console.log(`[SyncService] ✓ Synced: ${task.title}`);
      }
      await this.showToast(
        `✓ ${pending.length} task(s) synced successfully`,
        'success'
      );
    } catch (error) {
      console.error('[SyncService] Sync failed:', error);
      await this.showToast('Sync failed. Will retry later.', 'danger');
    } finally {
      this.syncing$.next(false);
    }
  }

  // --- helpers ---------------------------------------------------------

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async showToast(
    message: string,
    color: 'success' | 'danger' | 'medium',
    duration = 2000
  ): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration,
      color,
      position: 'top',
    });
    await toast.present();
  }
}
