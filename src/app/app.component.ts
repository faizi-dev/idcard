import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-container">
      <!-- Mobile Menu Toggle -->
      <button class="mobile-menu-toggle lg:hidden" (click)="toggleSidebar()">
        <span class="material-icons">menu</span>
      </button>

      <!-- Sidebar -->
      <aside class="sidebar" [class.open]="isSidebarOpen">
        <div class="sidebar-header">
          <div class="sidebar-logo">
            <span class="material-icons">school</span>
            <span>Medical College ID</span>
          </div>
        </div>
        
        <nav class="sidebar-nav">
          <a routerLink="/" 
             routerLinkActive="active" 
             [routerLinkActiveOptions]="{exact: true}"
             class="nav-item">
            <span class="material-icons">dashboard</span>
            <span>Dashboard</span>
          </a>
          
          <a routerLink="/register" 
             routerLinkActive="active"
             class="nav-item">
            <span class="material-icons">person_add</span>
            <span>Register Student</span>
          </a>
          
          <a routerLink="/students" 
             routerLinkActive="active"
             class="nav-item">
            <span class="material-icons">people</span>
            <span>View Students</span>
          </a>
          
          <a routerLink="/bulk-upload" 
             routerLinkActive="active"
             class="nav-item">
            <span class="material-icons">upload_file</span>
            <span>Bulk Upload</span>
          </a>
          
          <a routerLink="/print-cards" 
             routerLinkActive="active"
             class="nav-item">
            <span class="material-icons">credit_card</span>
            <span>Print Cards</span>
          </a>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AppComponent {
  isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}