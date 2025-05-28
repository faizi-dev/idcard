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
    <section class="dashboard">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-semibold text-surface-900">Dashboard Overview</h2>
        <div class="flex gap-3">
          <button class="btn btn-primary" routerLink="/register">
            <span class="material-icons">person_add</span>
            New Student
          </button>
          <button class="btn btn-secondary" routerLink="/print-cards">
            <span class="material-icons">print</span>
            Print Cards
          </button>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <!-- Total Students Card -->
        <div class="card hover:shadow-lg transition-all">
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-lg bg-primary-100">
              <span class="material-icons text-primary-600">people</span>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-surface-900">{{stats.totalStudents || 0}}</h3>
              <p class="text-surface-500">Total Students</p>
            </div>
          </div>
        </div>
        
        <!-- IDs Generated Card -->
        <div class="card hover:shadow-lg transition-all">
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-lg bg-success-50">
              <span class="material-icons text-success-500">credit_card</span>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-surface-900">{{stats.totalCards || 0}}</h3>
              <p class="text-surface-500">IDs Generated</p>
            </div>
          </div>
        </div>
        
        <!-- New Registrations Card -->
        <div class="card hover:shadow-lg transition-all">
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-lg bg-warning-50">
              <span class="material-icons text-warning-500">how_to_reg</span>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-surface-900">{{stats.newRegistrations || 0}}</h3>
              <p class="text-surface-500">New This Week</p>
            </div>
          </div>
        </div>
        
        <!-- Course Distribution Card -->
        <div class="card hover:shadow-lg transition-all">
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-lg bg-error-50">
              <span class="material-icons text-error-500">school</span>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-surface-900">{{stats.courseCount || 0}}</h3>
              <p class="text-surface-500">Active Courses</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Course Distribution Chart -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-surface-900">Course Distribution</h3>
            <span class="material-icons text-surface-400">donut_large</span>
          </div>
          <div class="h-[300px]">
            <canvas id="courseChart"></canvas>
          </div>
        </div>
        
        <!-- Yearly Registration Chart -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-surface-900">Yearly Registration</h3>
            <span class="material-icons text-surface-400">trending_up</span>
          </div>
          <div class="h-[300px]">
            <canvas id="yearlyChart"></canvas>
          </div>
        </div>
      </div>
      
      <!-- Recent Registrations -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-surface-900">Recent Registrations</h3>
          <button class="btn btn-secondary" routerLink="/students">
            View All
          </button>
        </div>
        
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>PRN Number</th>
                <th>Course</th>
                <th>Registration Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let student of recentStudents">
                <td class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-surface-200 flex items-center justify-center">
                    <span class="material-icons text-surface-500">person</span>
                  </div>
                  <span>{{student.fullName}}</span>
                </td>
                <td>{{student.prnNumber}}</td>
                <td>
                  <span class="px-2 py-1 rounded-full text-sm" 
                        [ngClass]="{
                          'bg-primary-50 text-primary-700': student.courseName === 'MBBS',
                          'bg-success-50 text-success-700': student.courseName === 'BDS',
                          'bg-warning-50 text-warning-700': student.courseName === 'BAMS'
                        }">
                    {{student.courseName}}
                  </span>
                </td>
                <td>{{student.createdAt | date:'medium'}}</td>
                <td>
                  <button class="btn btn-secondary" [routerLink]="['/students', student._id]">
                    <span class="material-icons">visibility</span>
                    View
                  </button>
                </td>
              </tr>
              <tr *ngIf="!recentStudents.length">
                <td colspan="5" class="text-center py-8">
                  <div class="flex flex-col items-center gap-2 text-surface-500">
                    <span class="material-icons text-4xl">person_add_disabled</span>
                    <p>No recent registrations found</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `
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
        
        setTimeout(() => {
          this.initCourseChart(data.courseDistribution || []);
          this.initYearlyChart(data.yearlyRegistration || []);
        }, 100);
      },
      error => {
        console.error('Error loading dashboard data:', error);
        this.loadMockData();
      }
    );
  }

  initCourseChart(courseData: any[]): void {
    const ctx = document.getElementById('courseChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    const labels = courseData.map(item => item.course);
    const data = courseData.map(item => item.count);
    
    this.courseChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            'rgba(99, 102, 241, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 20,
              font: {
                family: 'Inter'
              }
            }
          }
        }
      }
    });
  }

  initYearlyChart(yearlyData: any[]): void {
    const ctx = document.getElementById('yearlyChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    const labels = yearlyData.map(item => item.year.toString());
    const data = yearlyData.map(item => item.count);
    
    this.yearlyChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Students Registered',
          data: data,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              font: {
                family: 'Inter'
              }
            }
          },
          x: {
            ticks: {
              font: {
                family: 'Inter'
              }
            }
          }
        }
      }
    });
  }

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