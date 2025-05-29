import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../services/student.service';
import { Student } from '../models/student.model';

@Component({
  selector: 'app-students-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <section class="students-list fade-in">
      <h2 class="section-title">Students List</h2>
      
      <div class="card">
        <div class="filter-bar">
          <div class="row">
            <div class="col-md-4">
              <div class="form-group">
                <label for="searchQuery">Search</label>
                <input type="text" id="searchQuery" class="form-control" 
                       [(ngModel)]="searchQuery" 
                       placeholder="Search by name, PRN, roll number..." 
                       (input)="applyFilters()">
              </div>
            </div>
            
            <div class="col-md-3">
              <div class="form-group">
                <label for="courseFilter">Course</label>
                <select id="courseFilter" class="form-control" [(ngModel)]="courseFilter" (change)="applyFilters()">
                  <option value="">All Courses</option>
                  <option *ngFor="let course of courseOptions" [value]="course">{{course}}</option>
                </select>
              </div>
            </div>
            
            <div class="col-md-3">
              <div class="form-group">
                <label for="yearFilter">Year of Joining</label>
                <select id="yearFilter" class="form-control" [(ngModel)]="yearFilter" (change)="applyFilters()">
                  <option value="">All Years</option>
                  <option *ngFor="let year of yearOptions" [value]="year">{{year}}</option>
                </select>
              </div>
            </div>
            
            <div class="col-md-2">
              <div class="form-group">
                <label>&nbsp;</label>
                <button class="btn btn-primary form-control" (click)="resetFilters()">Reset Filters</button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Name</th>
                <th>PRN Number</th>
                <th>Roll Number</th>
                <th>Course</th>
                <th>Year</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let student of filteredStudents">
                <td>
                  <img [src]="student.photoUrl || 'assets/placeholder.jpg'" alt="Student Photo" class="student-thumbnail">
                </td>
                <td>{{student.fullName}}</td>
                <td>{{student.prnNumber}}</td>
                <td>{{student.rollNumber}}</td>
                <td>{{student.courseName}}</td>
                <td>{{student.yearOfJoining}}</td>
                <td>
                  <a [routerLink]="['/students', student._id]" class="btn btn-sm btn-primary mr-1">View</a>
                  <button class="btn btn-sm btn-secondary" (click)="printIDCard(student)">Print ID</button>
                </td>
              </tr>
              <tr *ngIf="!filteredStudents.length">
                <td colspan="7" class="text-center">
                  <p *ngIf="isLoading">Loading students...</p>
                  <p *ngIf="!isLoading && !filteredStudents.length">No students found matching the criteria</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="pagination-controls" *ngIf="totalPages > 1">
          <button class="btn btn-sm" 
                  [disabled]="currentPage === 1"
                  (click)="changePage(currentPage - 1)">
            Previous
          </button>
          
          <span class="page-info">Page {{currentPage}} of {{totalPages}}</span>
          
          <button class="btn btn-sm" 
                  [disabled]="currentPage === totalPages"
                  (click)="changePage(currentPage + 1)">
            Next
          </button>
        </div>
      </div>
      
      <div class="card mt-3">
        <div class="row">
          <div class="col-md-6">
            <h3>Bulk Actions</h3>
            <p>Select students from the list above to perform bulk actions.</p>
          </div>
          <div class="col-md-6 text-right">
            <button class="btn btn-primary" [routerLink]="['/print-cards']">Print Multiple ID Cards</button>
            <button class="btn btn-secondary ml-2" [routerLink]="['/register']">Register New Student</button>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .students-list {
      animation: fadeIn 0.5s ease-in;
    }
    
    .section-title {
      margin-bottom: var(--space-3);
      color: var(--primary-700);
      border-bottom: 2px solid var(--primary-200);
      padding-bottom: var(--space-1);
    }
    
    .filter-bar {
      margin-bottom: var(--space-3);
      padding-bottom: var(--space-2);
      border-bottom: 1px solid var(--neutral-200);
    }
    
    .student-thumbnail {
      width: 50px;
      height: 50px;
      object-fit: cover;
      border-radius: 50%;
      border: 1px solid var(--neutral-300);
    }
    
    .table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .table th, .table td {
      padding: var(--space-1);
      text-align: left;
      border-bottom: 1px solid var(--neutral-200);
      vertical-align: middle;
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
    
    .pagination-controls {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: var(--space-2);
    }
    
    .page-info {
      margin: 0 var(--space-2);
    }
  `]
})
export class StudentsListComponent implements OnInit {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  isLoading = true;
  
  // Filters
  searchQuery = '';
  courseFilter = '';
  yearFilter = '';
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  
  // Options for dropdowns
  yearOptions: number[] = [];
  courseOptions: string[] = ['MBBS', 'BDS', 'BAMS', 'BHMS', 'B.Pharma', 'Nursing', 'Allied Health Sciences'];

  constructor(private studentService: StudentService) {
    // Generate year options (current year and 5 years back)
    const currentYear = new Date().getFullYear();
    for (let i = 0; i <= 5; i++) {
      this.yearOptions.unshift(currentYear - i);
    }
  }

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.isLoading = true;
    this.studentService.getStudents().subscribe(
      data => {
        this.students = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error => {
        console.error('Error loading students:', error);
        this.isLoading = false;
        
        // For demo purposes, load mock data
        this.loadMockData();
      }
    );
  }

  applyFilters(): void {
    let filtered = this.students;
    
    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(student => 
        student.fullName.toLowerCase().includes(query) || 
        student.prnNumber.toLowerCase().includes(query) || 
        student.rollNumber.toLowerCase().includes(query)
      );
    }
    
    // Apply course filter
    if (this.courseFilter) {
      filtered = filtered.filter(student => student.courseName === this.courseFilter);
    }
    
    // Apply year filter
    if (this.yearFilter) {
      filtered = filtered.filter(student => student.yearOfJoining === parseInt(this.yearFilter));
    }
    
    // Apply pagination
    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.filteredStudents = filtered.slice(startIndex, startIndex + this.pageSize);
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.courseFilter = '';
    this.yearFilter = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.applyFilters();
  }

  printIDCard(student: Student): void {
    // In a real application, you would implement printing functionality
    // For now, we'll just simulate it
    alert(`Printing ID Card for ${student.fullName}...`);
  }

  // Load mock data for preview purposes
  loadMockData(): void {
    const mockStudents: Student[] = [];
    
    // Generate mock student data
    for (let i = 1; i <= 50; i++) {
      const courseIndex = i % this.courseOptions.length;
      const yearIndex = i % this.yearOptions.length;
      
      mockStudents.push({
        _id: i.toString(),
        photoUrl: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${i % 70 + 1}.jpg`,
        fullName: `Student ${i}`,
        address: `Address ${i}, Medical College Road`,
        dateOfBirth: new Date(1990 + (i % 15), i % 12, i % 28 + 1),
        mobileNumber: `9${i.toString().padStart(9, '0')}`,
        prnNumber: `PRN2025${i.toString().padStart(3, '0')}`,
        rollNumber: `ROLL${i.toString().padStart(3, '0')}`,
        yearOfJoining: this.yearOptions[yearIndex],
        courseName: this.courseOptions[courseIndex]
      });
    }
    
    this.students = mockStudents;
    this.applyFilters();
  }
}