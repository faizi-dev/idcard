import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentService } from '../services/student.service';
import { RouterLink } from '@angular/router';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss' 
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