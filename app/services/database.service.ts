import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
  capSQLiteSet,
} from '@capacitor-community/sqlite';

/**
 * DatabaseService
 * ----------------
 * Owns the SQLite connection and exposes thin query helpers.
 * Works on native (Android/iOS) and on the web via the `jeep-sqlite`
 * web component + a WASM build of SQLite that persists to IndexedDB.
 */
@Injectable({ providedIn: 'root' })
export class DatabaseService {
  private static readonly DB_NAME = 'task_manager_db';
  private static readonly DB_VERSION = 1;

  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  private db!: SQLiteDBConnection;
  private ready = false;
  private initPromise: Promise<void> | null = null;

  /** Idempotent initialisation — safe to call from multiple places. */
  initializeDatabase(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this.doInitialize();
    }
    return this.initPromise;
  }

  private async doInitialize(): Promise<void> {
    try {
      const platform = Capacitor.getPlatform();

      // On the web we must boot the jeep-sqlite element + WASM store first.
      if (platform === 'web') {
        await customElements.whenDefined('jeep-sqlite');
        await this.sqlite.initWebStore();
      }

      // Reuse an existing connection if one is already registered.
      const isConn = (
        await this.sqlite.isConnection(DatabaseService.DB_NAME, false)
      ).result;

      this.db = isConn
        ? await this.sqlite.retrieveConnection(DatabaseService.DB_NAME, false)
        : await this.sqlite.createConnection(
            DatabaseService.DB_NAME,
            false,
            'no-encryption',
            DatabaseService.DB_VERSION,
            false
          );

      await this.db.open();
      await this.createSchema();

      this.ready = true;
      console.log('[DatabaseService] SQLite ready on', platform);
    } catch (error) {
      console.error('[DatabaseService] Initialization failed:', error);
      throw error;
    }
  }

  private async createSchema(): Promise<void> {
    const schema = `
      CREATE TABLE IF NOT EXISTS tasks (
        id          TEXT PRIMARY KEY NOT NULL,
        title       TEXT NOT NULL,
        description TEXT,
        completed   INTEGER NOT NULL DEFAULT 0,
        createdAt   TEXT NOT NULL,
        updatedAt   TEXT NOT NULL,
        syncStatus  TEXT NOT NULL DEFAULT 'pending'
      );
    `;
    await this.db.execute(schema);
  }

  /** Ensure init has finished before any read/write. */
  private async ensureReady(): Promise<void> {
    if (!this.ready) {
      await this.initializeDatabase();
    }
  }

  /** SELECT helper — returns the array of rows. */
  async query<T = unknown>(
    statement: string,
    values: unknown[] = []
  ): Promise<T[]> {
    await this.ensureReady();
    const res = await this.db.query(statement, values as never[]);
    return (res.values ?? []) as T[];
  }

  /** INSERT/UPDATE/DELETE helper. Persists the web store after writing. */
  async run(statement: string, values: unknown[] = []): Promise<void> {
    await this.ensureReady();
    await this.db.run(statement, values as never[]);
    await this.persist();
  }

  /** Execute several statements in a single transaction. */
  async executeSet(set: capSQLiteSet[]): Promise<void> {
    await this.ensureReady();
    await this.db.executeSet(set);
    await this.persist();
  }

  /** On web, flush the in-memory DB to the persistent IndexedDB store. */
  private async persist(): Promise<void> {
    if (Capacitor.getPlatform() === 'web') {
      await this.sqlite.saveToStore(DatabaseService.DB_NAME);
    }
  }
}
