# Task Manager — Angular + Ionic + Capacitor

An **offline-first** cross-platform Task Manager for **Android, iOS and Web**.
Tasks are stored locally in **SQLite**, connectivity is detected with the
**Capacitor Network** plugin, and a **SyncService** simulates pushing pending
changes to a backend when the device comes back online (no real API/server).

---

## ✨ Features

- View, create, edit, delete tasks
- Mark tasks as completed
- **Works fully offline** — all data stored in SQLite
- Data persists across **app restart, device restart and page refresh**
- Real-time **Online / Offline** status badge
- Tasks created/edited offline are flagged **Pending Sync**
- When connectivity returns, pending tasks are **auto-synced** (simulated)
  with a success toast
- Manual sync button + pull-to-refresh

---

## 🧱 Project Structure

```
.
├── capacitor.config.ts          # Capacitor app config + SQLite options
├── angular.json                 # Angular build (copies sql-wasm.wasm to assets)
├── ionic.config.json
├── package.json
└── src/
    ├── index.html               # contains <jeep-sqlite> element for web SQLite
    ├── main.ts                  # standalone bootstrap (router + Ionic)
    ├── global.scss
    ├── theme/variables.scss
    └── app/
        ├── app.component.ts     # initialises DB + Network + auto-sync
        ├── app.routes.ts        # lazy-loaded routes
        ├── models/
        │   └── task.model.ts    # Task interface + SyncStatus type
        ├── services/
        │   ├── database.service.ts   # SQLite (native + web/WASM)
        │   ├── network.service.ts    # Capacitor Network wrapper (RxJS)
        │   ├── sync.service.ts       # simulated sync + toasts
        │   └── task.service.ts       # CRUD + reactive tasks$ stream
        ├── components/
        │   ├── status-badge/         # Online / Offline / Syncing badge
        │   └── task-item/            # single task row (swipe to edit/delete)
        └── pages/
            ├── task-list/            # dashboard: status, counts, list
            └── task-form/            # add / edit form
```
## 🚀 Installation

> Requires Node 18+ and npm. Angular CLI / Ionic CLI optional but recommended.

```bash
# 1. Install dependencies
npm install

# (optional) global tooling
npm install -g @ionic/cli @capacitor/cli

# 2. Run in the browser (web SQLite via WASM)
npm start
```

### Required packages (already in package.json)

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/network
npm install @capacitor-community/sqlite
npm install jeep-sqlite sql.js          # web SQLite support
```
--

## 🤖 Android Configuration

```bash
# Build web assets and add the Android platform
ionic build
npx cap add android
npx cap sync android

# Open in Android Studio and run
npx cap open android
```

The `@capacitor-community/sqlite` plugin auto-registers — no extra native code
required for a non-encrypted database.

---

## 🍏 iOS Configuration

```bash
ionic build
npx cap add ios
npx cap sync ios
npx cap open ios          # opens Xcode
```

The database location is set in `capacitor.config.ts`
(`iosDatabaseLocation: 'Library/CapacitorDatabase'`). Run on a simulator or
device from Xcode. (Requires macOS + Xcode + CocoaPods.)

---

## 🔄 How the simulated sync works

1. A task created/edited offline is saved with `syncStatus = 'pending'`.
2. `NetworkService` emits `true` when connectivity returns.
3. `SyncService` picks up the event, fetches all pending tasks, waits
   **1–2 seconds per task** (simulated API latency), then sets
   `syncStatus = 'synced'` and shows a success toast.
4. The dashboard's **Pending Sync** counter and each task's badge update live.

> There is **no backend** — the delay + status flip is the entire simulation.

### Try it
- Open DevTools → Network → set to **Offline** (or toggle device airplane mode).
- Create a couple of tasks → they show **Pending Sync**.
- Go back **Online** → watch them auto-flip to **Synced** with a toast.
- Refresh the page / restart the app → data is still there.

---

## 📜 NPM Scripts

| Script            | Description                              |
| ----------------- | ---------------------------------------- |
| `npm start`       | Dev server in the browser                |
| `npm run build`   | Production web build → `www/`            |
| `npm run android` | Build + sync + open Android Studio       |
| `npm run ios`     | Build + sync + open Xcode                |
| `npm run sync`    | `ionic build && npx cap sync`            |
