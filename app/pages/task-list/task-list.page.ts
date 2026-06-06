import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonFab,
  IonFabButton,
  IonIcon,
  IonButton,
  IonButtons,
  IonRefresher,
  IonRefresherContent,
  AlertController,
} from '@ionic/angular/standalone';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TaskService } from '../../services/task.service';
import { NetworkService } from '../../services/network.service';
import { SyncService } from '../../services/sync.service';
import { Task } from '../../models/task.model';
import { TaskItemComponent } from '../../components/task-item/task-item.component';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';

/**
 * TaskListPage (Dashboard)
 * -------------------------
 * The home screen: connectivity status, live counts and the task list.
 * All data is reactive — adding/editing/deleting elsewhere reflects here
 * automatically.
 */
@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonFab,
    IonFabButton,
    IonIcon,
    IonButton,
    IonButtons,
    IonRefresher,
    IonRefresherContent,
    TaskItemComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './task-list.page.html',
  styleUrls: ['./task-list.page.scss'],
})
export class TaskListPage implements OnInit {
  visibleTasks$!: Observable<Task[]>;
  totalCount$!: Observable<number>;
  doneCount$!: Observable<number>;
  pendingCount$!: Observable<number>;
  isOnline$!: Observable<boolean>;
  isSyncing$!: Observable<boolean>;

  constructor(
    private taskService: TaskService,
    private networkService: NetworkService,
    private syncService: SyncService,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit(): Promise<void> {
    const tasks$ = this.taskService.getTasks();

    this.totalCount$ = tasks$.pipe(map((t) => t.length));
    // A task counts as "Completed" once it has synced to the server.
    this.doneCount$ = tasks$.pipe(
      map((t) => t.filter((x) => x.syncStatus === 'synced').length)
    );
    this.pendingCount$ = this.taskService.getPendingCount();
    this.isOnline$ = this.networkService.isOnline$;
    this.isSyncing$ = this.syncService.isSyncing$;

    // Show the full live task stream (most recent first is handled upstream).
    this.visibleTasks$ = tasks$;

    await this.taskService.loadTasks();
  }

  addTask(): void {
    this.router.navigate(['/tasks/new']);
  }

  editTask(task: Task): void {
    this.router.navigate(['/tasks/edit', task.id]);
  }

  async confirmDelete(task: Task): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Delete task?',
      message: `"${task.title}" will be permanently removed.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => this.taskService.deleteTask(task.id),
        },
      ],
    });
    await alert.present();
  }

  /** Manual sync trigger (toolbar button + pull-to-refresh). */
  async sync(event?: CustomEvent): Promise<void> {
    await this.syncService.syncPendingTasks();
    (event?.target as HTMLIonRefresherElement | undefined)?.complete();
  }

  trackById(_: number, task: Task): string {
    return task.id;
  }
}
