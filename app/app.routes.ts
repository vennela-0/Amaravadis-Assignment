import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tasks',
    loadComponent: () =>
      import('./pages/task-list/task-list.page').then((m) => m.TaskListPage),
  },
  {
    path: 'tasks/new',
    loadComponent: () =>
      import('./pages/task-form/task-form.page').then((m) => m.TaskFormPage),
  },
  {
    path: 'tasks/edit/:id',
    loadComponent: () =>
      import('./pages/task-form/task-form.page').then((m) => m.TaskFormPage),
  },
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full',
  },
];
