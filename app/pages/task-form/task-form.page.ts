import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonItem,
  IonInput,
  IonTextarea,
  ToastController,
} from '@ionic/angular/standalone';

import { TaskService } from '../../services/task.service';
import { NetworkService } from '../../services/network.service';
import { SyncService } from '../../services/sync.service';
import { Task } from '../../models/task.model';

/**
 * TaskFormPage
 * -------------
 * Single form reused for both "Add" and "Edit". Edit mode is detected
 * from the `:id` route parameter.
 */
@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonItem,
    IonInput,
    IonTextarea,
  ],
  templateUrl: './task-form.page.html',
  styleUrls: ['./task-form.page.scss'],
})
export class TaskFormPage implements OnInit {
  form!: FormGroup;
  isEdit = false;
  private taskId: string | null = null;
  private existing: Task | null = null;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private networkService: NetworkService,
    private syncService: SyncService,
    private route: ActivatedRoute,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(120)]],
      description: ['', [Validators.maxLength(500)]],
      completed: [false],
    });

    this.taskId = this.route.snapshot.paramMap.get('id');
    if (this.taskId) {
      this.isEdit = true;
      this.existing = await this.taskService.getTaskById(this.taskId);
      if (this.existing) {
        this.form.patchValue({
          title: this.existing.title,
          description: this.existing.description,
          completed: this.existing.completed,
        });
      }
    }
  }

  get title() {
    return this.form.get('title');
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;

    try {
      // 1. Always persist to SQLite first (works online AND offline).
      //    A freshly saved task is marked syncStatus = 'pending'.
      if (this.isEdit && this.taskId) {
        await this.taskService.updateTask(this.taskId, value);
      } else {
        await this.taskService.createTask(value);
      }

      // 2. Tell the user what happened, based on connectivity.
      if (this.networkService.isOnline) {
        await this.toast('Saved — syncing…', 'success');
      } else {
        await this.toast(
          'You are offline. Saved locally — will sync when back online.',
          'warning'
        );
      }

      // 3. Return to the list. Its data is reactive, so it updates live.
      this.router.navigate(['/tasks']);

      // 4. If we are online, push the pending task to the (simulated) server
      //    right now. If offline, this is a no-op and the task stays pending
      //    until the connection returns (handled by SyncService auto-sync).
      this.syncService.syncPendingTasks();
    } catch (error) {
      // Surface DB failures instead of silently doing nothing.
      console.error('[TaskFormPage] Failed to save task:', error);
      await this.toast(
        'Could not save task: ' + (error as Error)?.message,
        'danger'
      );
    }
  }

  private async toast(
    message: string,
    color: 'medium' | 'success' | 'warning' | 'danger' = 'medium'
  ): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: color === 'danger' || color === 'warning' ? 3500 : 1500,
      position: 'top',
      color,
    });
    await toast.present();
  }
}
