import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./dashboard/dashboard.component').then(c => c.DashboardComponent) 
  },
  { 
    path: 'register', 
    loadComponent: () => import('./registration/registration.component').then(c => c.RegistrationComponent) 
  },
  { 
    path: 'students', 
    loadComponent: () => import('./students/students-list/students-list.component').then(c => c.StudentsListComponent) 
  },
  { 
    path: 'students/:id', 
    loadComponent: () => import('./students/student-detail/student-detail.component').then(c => c.StudentDetailComponent) 
  },
  { 
    path: 'bulk-upload', 
    loadComponent: () => import('./bulk-upload/bulk-upload.component').then(c => c.BulkUploadComponent) 
  },
  { 
    path: 'print-cards', 
    loadComponent: () => import('./print-cards/print-cards.component').then(c => c.PrintCardsComponent) 
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];