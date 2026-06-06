import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DatabaseService } from './database.service';
import { Task, TaskInput } from '../models/task.model';

/** Raw row shape as stored in SQLite (completed is an INTEGER). */
interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  completed: number;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'pending' | 'synced';
}

/**
 * TaskService
 * ------------
 * The single source of truth for tasks. All CRUD goes through SQLite and
 * the in-memory `tasks$` stream is refreshed after every mutation so the
 * UI stays reactive.
 */
@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly tasksSubject = new BehaviorSubject<Task[]>([]);
  readonly tasks$ = this.tasksSubject.asObservable();

  constructor(private db: DatabaseService) {}

  /** Reactive list of tasks (newest first). */
  getTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  /** Reactive count of all tasks. */
  getTaskCount(): Observable<number> {
    return this.tasks$.pipe(map((tasks) => tasks.length));
  }

  /** Reactive count of tasks still waiting to sync. */
  getPendingCount(): Observable<number> {
    return this.tasks$.pipe(
      map((tasks) => tasks.filter((t) => t.syncStatus === 'pending').length)
    );
  }

  /** Load all tasks from the database into the stream. */
  async loadTasks(): Promise<void> {
    const rows = await this.db.query<TaskRow>(
      'SELECT * FROM tasks ORDER BY datetime(createdAt) DESC;'
    );
    this.tasksSubject.next(rows.map(this.mapRow));
  }

  /** Fetch a single task by id (used by the edit form). */
  async getTaskById(id: string): Promise<Task | null> {
    const rows = await this.db.query<TaskRow>(
      'SELECT * FROM tasks WHERE id = ? LIMIT 1;',
      [id]
    );
    return rows.length ? this.mapRow(rows[0]) : null;
  }

  /** Create a new task. Always starts life as "pending" until synced. */
  async createTask(input: TaskInput): Promise<Task> {
    const now = new Date().toISOString();
    const task: Task = {
      id: this.generateId(),
      title: input.title.trim(),
      description: input.description?.trim() ?? '',
      completed: input.completed ?? false,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending',
    };

    await this.db.run(
      `INSERT INTO tasks
        (id, title, description, completed, createdAt, updatedAt, syncStatus)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        task.id,
        task.title,
        task.description,
        task.completed ? 1 : 0,
        task.createdAt,
        task.updatedAt,
        task.syncStatus,
      ]
    );

    await this.loadTasks();
    return task;
  }

  /** Update an existing task. Edits flip it back to "pending" to re-sync. */
  async updateTask(id: string, input: TaskInput): Promise<void> {
    const now = new Date().toISOString();
    await this.db.run(
      `UPDATE tasks
         SET title = ?, description = ?, completed = ?, updatedAt = ?, syncStatus = 'pending'
       WHERE id = ?;`,
      [
        input.title.trim(),
        input.description?.trim() ?? '',
        input.completed ? 1 : 0,
        now,
        id,
      ]
    );
    await this.loadTasks();
  }

  /** Toggle the completed flag. Also marks the task pending again. */
  async toggleComplete(task: Task): Promise<void> {
    const now = new Date().toISOString();
    await this.db.run(
      `UPDATE tasks
         SET completed = ?, updatedAt = ?, syncStatus = 'pending'
       WHERE id = ?;`,
      [task.completed ? 0 : 1, now, task.id]
    );
    await this.loadTasks();
  }

  /** Delete a task. */
  async deleteTask(id: string): Promise<void> {
    await this.db.run('DELETE FROM tasks WHERE id = ?;', [id]);
    await this.loadTasks();
  }

  /** All tasks currently awaiting sync. */
  async getPendingTasks(): Promise<Task[]> {
    const rows = await this.db.query<TaskRow>(
      "SELECT * FROM tasks WHERE syncStatus = 'pending';"
    );
    return rows.map(this.mapRow);
  }

  /** Mark a single task as synced (called by SyncService). */
  async markAsSynced(id: string): Promise<void> {
    await this.db.run(
      "UPDATE tasks SET syncStatus = 'synced' WHERE id = ?;",
      [id]
    );
    await this.loadTasks();
  }

  // --- helpers ---------------------------------------------------------

  private mapRow(row: TaskRow): Task {
    return {
      id: row.id,
      title: row.title,
      description: row.description ?? '',
      completed: row.completed === 1,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      syncStatus: row.syncStatus,
    };
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `task_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}
