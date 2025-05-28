import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-container">
      <header class="main-header">
        <div class="container">
          <div class="header-content">
            <h1 class="logo">
              <span class="material-icons">school</span>
              Medical College ID System
            </h1>
            <nav class="main-nav">
              <ul>
                <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Dashboard</a></li>
                <li><a routerLink="/register" routerLinkActive="active">Register Student</a></li>
                <li><a routerLink="/students" routerLinkActive="active">View Students</a></li>
                <li><a routerLink="/bulk-upload" routerLinkActive="active">Bulk Upload</a></li>
                <li><a routerLink="/print-cards" routerLinkActive="active">Print Cards</a></li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
      
      <main class="main-content">
        <div class="container">
          <router-outlet></router-outlet>
        </div>
      </main>
      
      <footer class="main-footer">
        <div class="container">
          <p>&copy; 2025 Medical College ID Card System</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    .main-header {
      background-color: var(--primary-600);
      color: white;
      padding: var(--space-2) 0;
      box-shadow: var(--shadow-md);
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo {
      display: flex;
      align-items: center;
      font-size: 1.5rem;
      margin: 0;
    }
    
    .logo .material-icons {
      margin-right: var(--space-1);
    }
    
    .main-nav ul {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    
    .main-nav li {
      margin-left: var(--space-2);
    }
    
    .main-nav a {
      color: white;
      text-decoration: none;
      padding: var(--space-1);
      transition: all 0.3s ease;
      border-radius: var(--radius-sm);
    }
    
    .main-nav a:hover, .main-nav a.active {
      background-color: rgba(255, 255, 255, 0.2);
    }
    
    .main-content {
      flex: 1;
      padding: var(--space-3) 0;
    }
    
    .main-footer {
      background-color: var(--neutral-800);
      color: white;
      padding: var(--space-2) 0;
      margin-top: auto;
    }
    
    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
      }
      
      .main-nav {
        margin-top: var(--space-2);
        width: 100%;
        overflow-x: auto;
      }
      
      .main-nav ul {
        width: max-content;
      }
    }
  `]
})
export class AppComponent {
  title = 'Medical Student ID System';
}