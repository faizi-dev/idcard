import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentService } from '../services/student.service';
import { RouterLink } from '@angular/router';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="dashboard fade-in">
      <h2 class="section-title">Dashboard</h2>
      
      <div class="row">
        <!-- Total Students Card -->
        <div class="col-md-6 col-lg-3 mb-3">
          <div class="dashboard-card">
            <div class="dashboard-card-header">
              <h3>Total Students</h3>
            </div>
            <div class="dashboard-card-body text-center">
              <div class="dashboard-stat">{{stats.totalStudents || 0}}</div>
              <p>Registered students</p>
              <a routerLink="/students" class="btn btn-primary">View All</a>
            </div>
          </div>
        </div>
        
        <!-- IDs Generated Card -->
        <div class="col-md-6 col-lg-3 mb-3">
          <div class="dashboard-card">
            <div class="dashboard-card-header" style="background-color: var(--secondary-500);">
              <h3>IDs Generated</h3>
            </div>
            <div class="dashboard-card-body text-center">
              <div class="dashboard-stat" style="color: var(--secondary-600);">{{stats.totalCards || 0}}</div>
              <p>ID cards generated</p>
              <a routerLink="/print-cards" class="btn btn-secondary">Print Cards</a>
            </div>
          </div>
        </div>
        
        <!-- New Registrations Card -->
        <div class="col-md-6 col-lg-3 mb-3">
          <div class="dashboard-card">
            <div class="dashboard-card-header" style="background-color: var(--accent-500);">
              <h3>New Registrations</h3>
            </div>
            <div class="dashboard-card-body text-center">
              <div class="dashboard-stat" style="color: var(--accent-600);">{{stats.newRegistrations || 0}}</div>
              <p>In the last 7 days</p>
              <a routerLink="/register" class="btn btn-accent">New Registration</a>
            </div>
          </div>
        </div>
        
        <!-- Course Distribution Card -->
        <div class="col-md-6 col-lg-3 mb-3">
          <div class="dashboard-card">
            <div class="dashboard-card-header" style="background-color: var(--success-500);">
              <h3>Course Distribution</h3>
            </div>
            <div class="dashboard-card-body text-center">
              <div class="dashboard-stat" style="color: var(--success-600);">{{stats.courseCount || 0}}</div>
              <p>Different courses</p>
              <a routerLink="/students" class="btn" style="background-color: var(--success-500); color: white;">View Details</a>
            </div>
          </div>
        </div>
      </div>
      
      <div class="row mt-3">
        <!-- Chart for Course Distribution -->
        <div class="col-md-6 mb-3">
          <div class="card">
            <h3>Course Distribution</h3>
            <div>
              <canvas id="courseChart"></canvas>
            </div>
          </div>
        </div>
        
        <!-- Chart for Yearly Registration -->
        <div class="col-md-6 mb-3">
          <div class="card">
            <h3>Yearly Registration</h3>
            <div>
              <canvas id="yearlyChart"></canvas>
            </div>
          </div>
        </div>
      </div>
      
      <div class="row mt-3">
        <!-- Recent Registrations -->
        <div class="col-12">
          <div class="card">
            <h3>Recent Registrations</h3>
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>PRN Number</th>
                    <th>Course</th>
                    <th>Registration Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let student of recentStudents">
                    <td>{{student.fullName}}</td>
                    <td>{{student.prnNumber}}</td>
                    <td>{{student.courseName}}</td>
                    <td>{{student.createdAt | date:'medium'}}</td>
                    <td>
                      <a [routerLink]="['/students', student._id]" class="btn btn-sm btn-primary">View</a>
                    </td>
                  </tr>
                  <tr *ngIf="!recentStudents.length">
                    <td colspan="5" class="text-center">No recent registrations</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .dashboard {
      animation: fadeIn 0.5s ease-in;
    }
    
    .section-title {
      margin-bottom: var(--space-3);
      color: var(--primary-700);
      border-bottom: 2px solid var(--primary-200);
      padding-bottom: var(--space-1);
    }
    
    .table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .table th, .table td {
      padding: var(--space-1);
      text-align: left;
      border-bottom: 1px solid var(--neutral-200);
    }
    
    .table th {
      background-color: var(--neutral-100);
      font-weight: 500;
    }
    
    .table-responsive {
      overflow-x: auto;
    }
    
    .btn-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: any = {};
  recentStudents: any[] = [];
  courseChart: any;
  yearlyChart: any;

  constructor(private studentService: StudentService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.studentService.getDashboardStats().subscribe(
      data => {
        this.stats = data;
        this.recentStudents = data.recentStudents || [];
        
        // Initialize charts after data is loaded
        setTimeout(() => {
          this.initCourseChart(data.courseDistribution || []);
          this.initYearlyChart(data.yearlyRegistration || []);
        }, 100);
      },
      error => {
        console.error('Error loading dashboard data:', error);
        // Use mock data for demo purposes
        this.loadMockData();
      }
    );
  }

  // Initialize course distribution chart
  initCourseChart(courseData: any[]): void {
    const ctx = document.getElementById('courseChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    const labels = courseData.map(item => item.course);
    const data = courseData.map(item => item.count);
    
    this.courseChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          label: 'Students per Course',
          data: data,
          backgroundColor: [
            'rgba(25, 118, 210, 0.7)',
            'rgba(0, 137, 123, 0.7)',
            'rgba(173, 20, 87, 0.7)',
            'rgba(76, 175, 80, 0.7)',
            'rgba(255, 193, 7, 0.7)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right'
          }
        }
      }
    });
  }

  // Initialize yearly registration chart
  initYearlyChart(yearlyData: any[]): void {
    const ctx = document.getElementById('yearlyChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    const labels = yearlyData.map(item => item.year.toString());
    const data = yearlyData.map(item => item.count);
    
    this.yearlyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Registrations by Year',
          data: data,
          backgroundColor: 'rgba(25, 118, 210, 0.7)',
          borderColor: 'rgba(25, 118, 210, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });
  }

  // Load mock data for preview purposes
  loadMockData(): void {
    this.stats = {
      totalStudents: 152,
      totalCards: 145,
      newRegistrations: 8,
      courseCount: 5
    };
    
    this.recentStudents = [
      {
        _id: '1',
        fullName: 'John Smith',
        prnNumber: 'PRN2025001',
        courseName: 'MBBS',
        createdAt: new Date()
      },
      {
        _id: '2',
        fullName: 'Sarah Johnson',
        prnNumber: 'PRN2025002',
        courseName: 'BDS',
        createdAt: new Date(Date.now() - 86400000)
      },
      {
        _id: '3',
        fullName: 'Michael Williams',
        prnNumber: 'PRN2025003',
        courseName: 'BAMS',
        createdAt: new Date(Date.now() - 172800000)
      }
    ];
    
    // Initialize mock charts
    setTimeout(() => {
      this.initCourseChart([
        { course: 'MBBS', count: 80 },
        { course: 'BDS', count: 35 },
        { course: 'BAMS', count: 20 },
        { course: 'BHMS', count: 12 },
        { course: 'Nursing', count: 5 }
      ]);
      
      this.initYearlyChart([
        { year: 2021, count: 30 },
        { year: 2022, count: 42 },
        { year: 2023, count: 35 },
        { year: 2024, count: 45 },
        { year: 2025, count: 8 }
      ]);
    }, 100);
  }
}