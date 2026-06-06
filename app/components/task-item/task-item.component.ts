import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  IonItemSliding,
  IonItem,
  IonItemOptions,
  IonItemOption,
  IonIcon,
} from '@ionic/angular/standalone';

import { Task } from '../../models/task.model';

/**
 * TaskItem
 * ---------
 * Card-style row for a single task. Purely presentational — it raises
 * events (edit/remove) and lets the page own the logic.
 * Supports swipe-to-delete AND visible action buttons.
 */
@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [
    DatePipe,
    IonItemSliding,
    IonItem,
    IonItemOptions,
    IonItemOption,
    IonIcon,
  ],
  template: `
    <ion-item-sliding>
      <ion-item lines="none" class="card-host">
        <div class="card">
          <div class="body">
            <h2 class="title">{{ task.title }}</h2>
            @if (task.description) {
              <p class="desc">{{ task.description }}</p>
            }

            <div class="meta">
              <span
                class="badge"
                [class.synced]="task.syncStatus === 'synced'"
                [class.pending]="task.syncStatus === 'pending'"
              >
                <ion-icon
                  [name]="
                    task.syncStatus === 'synced'
                      ? 'cloud-done-outline'
                      : 'cloud-upload-outline'
                  "
                ></ion-icon>
                {{ task.syncStatus === 'synced' ? 'Synced' : 'Pending Sync' }}
              </span>
              <span class="date">{{ task.updatedAt | date: 'MMM d, h:mm a' }}</span>
            </div>
          </div>

          <div class="actions">
            <button class="icon-btn edit" (click)="edit.emit(task)" aria-label="Edit">
              <ion-icon name="create-outline"></ion-icon>
            </button>
            <button class="icon-btn del" (click)="remove.emit(task)" aria-label="Delete">
              <ion-icon name="trash-outline"></ion-icon>
            </button>
          </div>
        </div>
      </ion-item>

      <ion-item-options side="end">
        <ion-item-option color="danger" (click)="remove.emit(task)">
          <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
        </ion-item-option>
      </ion-item-options>
    </ion-item-sliding>
  `,
  styles: [
    `
      .card-host {
        --background: transparent;
        --padding-start: 0;
        --inner-padding-end: 0;
        --min-height: 0;
      }

      .card {
        width: 100%;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin: 6px 0;
        padding: 14px;
        border-radius: 16px;
        background: var(--ion-card-background, #fff);
        box-shadow: 0 2px 10px rgba(31, 41, 71, 0.07);
        border: 1px solid rgba(31, 41, 71, 0.05);
      }

      .body {
        flex: 1;
        min-width: 0;
      }

      .title {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--ion-text-color, #1f2947);
        word-break: break-word;
      }

      .desc {
        margin: 3px 0 0;
        font-size: 13px;
        color: var(--ion-color-medium);
        line-height: 1.35;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .meta {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 10px;
        flex-wrap: wrap;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        font-weight: 600;
        padding: 4px 9px;
        border-radius: 20px;
      }
      .badge ion-icon {
        font-size: 13px;
      }
      .badge.pending {
        color: #9a6700;
        background: #fff4d6;
      }
      .badge.synced {
        color: #0a7c42;
        background: #d8f7e6;
      }

      .date {
        font-size: 11px;
        color: var(--ion-color-medium);
      }

      .actions {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .icon-btn {
        width: 34px;
        height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        border-radius: 10px;
        background: var(--ion-color-light, #f1f2f6);
        color: var(--ion-color-medium-shade);
        font-size: 17px;
      }
      .icon-btn.edit {
        color: var(--ion-color-primary);
      }
      .icon-btn.del {
        color: var(--ion-color-danger);
      }
    `,
  ],
})
export class TaskItemComponent {
  @Input({ required: true }) task!: Task;

  @Output() edit = new EventEmitter<Task>();
  @Output() remove = new EventEmitter<Task>();
}
