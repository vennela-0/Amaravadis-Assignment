/** Sync state of a task relative to the (simulated) remote backend. */
export type SyncStatus = 'pending' | 'synced';

/** Core Task entity persisted in SQLite. */
export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  syncStatus: SyncStatus;
}

/** Shape used when creating/editing a task from the form. */
export interface TaskInput {
  title: string;
  description: string;
  completed?: boolean;
}
