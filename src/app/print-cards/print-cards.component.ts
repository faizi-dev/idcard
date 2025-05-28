import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../services/student.service';
import { Student } from '../models/student.model';

@Component({
  selector: 'app-print-cards',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="print-cards fade-in">
      <h2 class="section-title">Print ID Cards</h2>
      
      <div class="row">
        <div class="col-md-4">
          <div class="card">
            <h3>Select Students</h3>
            <p>Choose students whose ID cards you want to print.</p>
            
            <div class="filter-options mt-3">
              <div class="form-group">
                <label for="searchQuery">Search</label>
                <input type="text" id="searchQuery" class="form-control" 
                       [(ngModel)]="searchQuery" 
                       placeholder="Search by name, PRN, roll number..." 
                       (input)="applyFilters()">
              </div>
              
              <div class="form-group">
                <label for="courseFilter">Course</label>
                <select id="courseFilter" class="form-control" [(ngModel)]="courseFilter" (change)="applyFilters()">
                  <option value="">All Courses</option>
                  <option *ngFor="let course of courseOptions" [value]="course">{{course}}</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="yearFilter">Year of Joining</label>
                <select id="yearFilter" class="form-control" [(ngModel)]="yearFilter" (change)="applyFilters()">
                  <option value="">All Years</option>
                  <option *ngFor="let year of yearOptions" [value]="year">{{year}}</option>
                </select>
              </div>
            </div>
            
            <div class="student-list mt-3">
              <div class="select-all-option">
                <label>
                  <input type="checkbox" [checked]="areAllSelected()" (change)="toggleSelectAll()">
                  Select All Students
                </label>
              </div>
              
              <div class="list-container">
                <div *ngFor="let student of filteredStudents" class="student-item">
                  <label>
                    <input type="checkbox" 
                           [checked]="isSelected(student._id || '')" 
                           (change)="toggleSelection(student._id || '')">
                    <span class="student-name">{{student.fullName}}</span>
                    <span class="student-info">{{student.prnNumber}} - {{student.courseName}}</span>
                  </label>
                </div>
                
                <div *ngIf="filteredStudents.length === 0" class="empty-list">
                  <p>No students match the filter criteria.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-8">
          <div class="card">
            <h3>Print Options</h3>
            <p>Configure how you want the ID cards to be printed.</p>
            
            <div class="print-options mt-3">
              <div class="form-group">
                <label for="cardLayout">Card Layout</label>
                <select id="cardLayout" class="form-control" [(ngModel)]="printSettings.layout">
                  <option value="single">Single Card per Page</option>
                  <option value="double">Two Cards per Page</option>
                  <option value="grid">Grid Layout (4 per Page)</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="paperSize">Paper Size</label>
                <select id="paperSize" class="form-control" [(ngModel)]="printSettings.paperSize">
                  <option value="a4">A4</option>
                  <option value="letter">Letter</option>
                  <option value="legal">Legal</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Additional Options</label>
                <div class="checkbox-option">
                  <label>
                    <input type="checkbox" [(ngModel)]="printSettings.includeQR">
                    Include QR Code
                  </label>
                </div>
                <div class="checkbox-option">
                  <label>
                    <input type="checkbox" [(ngModel)]="printSettings.doubleSided">
                    Double-sided Printing
                  </label>
                </div>
                <div class="checkbox-option">
                  <label>
                    <input type="checkbox" [(ngModel)]="printSettings.showValidity">
                    Show Card Validity
                  </label>
                </div>
              </div>
            </div>
            
            <div class="preview-section mt-3">
              <h4>Preview</h4>
              <p>{{selectedStudents.length}} student(s) selected for printing.</p>
              
              <div class="preview-cards" *ngIf="selectedStudents.length > 0">
                <div class="preview-card-layout" [ngClass]="printSettings.layout">
                  <div class="id-card" *ngFor="let id of previewIds">
                    <div class="id-card-header">
                      <h4>Medical College Student ID</h4>
                    </div>
                    <div class="id-card-body">
                      <img src="https://randomuser.me/api/portraits/men/{{id}}.jpg" alt="Student Photo" class="id-card-photo">
                      <div class="id-card-info">
                        <p><strong>Name:</strong> Student {{id}}</p>
                        <p><strong>PRN No:</strong> PRN2025{{id.toString().padStart(3, '0')}}</p>
                        <p><strong>Roll No:</strong> ROLL{{id.toString().padStart(3, '0')}}</p>
                        <p><strong>Course:</strong> MBBS</p>
                        <p><strong>Year:</strong> 2023</p>
                      </div>
                    </div>
                    <div class="id-card-footer" *ngIf="printSettings.showValidity">
                      <p>Valid till: {{cardValidTill | date:'mediumDate'}}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="empty-preview" *ngIf="selectedStudents.length === 0">
                <p>Select students to see a preview.</p>
              </div>
            </div>
            
            <div class="print-actions mt-3">
              <button class="btn btn-primary" 
                      [disabled]="selectedStudents.length === 0"
                      (click)="printCards()">
                Print {{selectedStudents.length}} Card(s)
              </button>
              <button class="btn btn-secondary ml-2"
                      [disabled]="selectedStudents.length === 0"
                      (click)="clearSelection()">
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .print-cards {
      animation: fadeIn 0.5s ease-in;
    }
    
    .section-title {
      margin-bottom: var(--space-3);
      color: var(--primary-700);
      border-bottom: 2px solid var(--primary-200);
      padding-bottom: var(--space-1);
    }
    
    .student-list {
      margin-top: var(--space-2);
    }
    
    .select-all-option {
      padding: var(--space-1) 0;
      border-bottom: 1px solid var(--neutral-200);
      margin-bottom: var(--space-1);
    }
    
    .list-container {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid var(--neutral-200);
      border-radius: var(--radius-sm);
    }
    
    .student-item {
      padding: var(--space-1) var(--space-2);
      border-bottom: 1px solid var(--neutral-200);
      transition: background-color 0.2s ease;
    }
    
    .student-item:last-child {
      border-bottom: none;
    }
    
    .student-item:hover {
      background-color: var(--neutral-100);
    }
    
    .student-item label {
      display: flex;
      flex-direction: column;
      cursor: pointer;
      width: 100%;
      margin: 0;
    }
    
    .student-name {
      font-weight: 500;
    }
    
    .student-info {
      font-size: 0.875rem;
      color: var(--neutral-600);
    }
    
    .checkbox-option {
      margin-bottom: var(--space-1);
    }
    
    .preview-cards {
      margin-top: var(--space-2);
      overflow-x: auto;
    }
    
    .preview-card-layout {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--space-2);
      padding: var(--space-2);
      background-color: var(--neutral-100);
      border-radius: var(--radius-md);
    }
    
    .preview-card-layout.single .id-card {
      width: 100%;
      max-width: 3.375in;
    }
    
    .preview-card-layout.double .id-card {
      width: calc(50% - var(--space-1));
      max-width: 3.375in;
    }
    
    .preview-card-layout.grid .id-card {
      width: calc(50% - var(--space-1));
      max-width: 3.375in;
    }
    
    .empty-preview, .empty-list {
      padding: var(--space-3);
      text-align: center;
      color: var(--neutral-500);
    }
    
    @media (max-width: 768px) {
      .preview-card-layout.double .id-card,
      .preview-card-layout.grid .id-card {
        width: 100%;
      }
    }
  `]
})
export class PrintCardsComponent implements OnInit {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  selectedStudents: string[] = [];
  isLoading = true;
  
  // Filters
  searchQuery = '';
  courseFilter = '';
  yearFilter = '';
  
  // Print settings
  printSettings = {
    layout: 'single',
    paperSize: 'a4',
    includeQR: true,
    doubleSided: false,
    showValidity: true
  };
  
  // Options for dropdowns
  yearOptions: number[] = [];
  courseOptions: string[] = ['MBBS', 'BDS', 'BAMS', 'BHMS', 'B.Pharma', 'Nursing', 'Allied Health Sciences'];
  
  // For preview
  previewIds = [1, 2, 3, 4];
  cardValidTill = new Date(new Date().setFullYear(new Date().getFullYear() + 1));

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
    
    this.filteredStudents = filtered;
  }

  isSelected(id: string): boolean {
    return this.selectedStudents.includes(id);
  }

  toggleSelection(id: string): void {
    const index = this.selectedStudents.indexOf(id);
    if (index === -1) {
      this.selectedStudents.push(id);
    } else {
      this.selectedStudents.splice(index, 1);
    }
    
    // Update preview
    this.updatePreview();
  }

  areAllSelected(): boolean {
    return this.filteredStudents.length > 0 && 
           this.filteredStudents.every(student => 
             this.selectedStudents.includes(student._id || '')
           );
  }

  toggleSelectAll(): void {
    if (this.areAllSelected()) {
      // Deselect all
      this.filteredStudents.forEach(student => {
        const index = this.selectedStudents.indexOf(student._id || '');
        if (index !== -1) {
          this.selectedStudents.splice(index, 1);
        }
      });
    } else {
      // Select all
      this.filteredStudents.forEach(student => {
        if (student._id && !this.selectedStudents.includes(student._id)) {
          this.selectedStudents.push(student._id);
        }
      });
    }
    
    // Update preview
    this.updatePreview();
  }

  clearSelection(): void {
    this.selectedStudents = [];
    this.updatePreview();
  }

  updatePreview(): void {
    // For demo purposes, we're just using static preview IDs
    // In a real application, you would use actual student data
    this.previewIds = this.selectedStudents.length > 0 
      ? [1, 2, 3, 4].slice(0, Math.min(4, this.selectedStudents.length))
      : [];
  }

  printCards(): void {
    if (this.selectedStudents.length === 0) return;
    
    // In a real application, you would implement printing functionality
    alert(`Printing ${this.selectedStudents.length} ID cards...`);
    
    // You could use the StudentService to handle printing
    /*
    this.studentService.printMultipleCards(this.selectedStudents).subscribe(
      response => {
        console.log('Cards printed successfully:', response);
      },
      error => {
        console.error('Error printing cards:', error);
        alert('An error occurred while printing the cards. Please try again.');
      }
    );
    */
  }

  // Load mock data for preview purposes
  loadMockData(): void {
    const mockStudents: Student[] = [];
    
    // Generate mock student data
    for (let i = 1; i <= 30; i++) {
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