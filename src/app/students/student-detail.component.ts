import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StudentService } from '../services/student.service';
import { Student } from '../models/student.model';
// import { QRCodeModule } from 'angularx-qrcode';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="student-detail fade-in">
      <div class="section-header">
        <h2 class="section-title">Student Details</h2>
        <div class="actions">
          <button class="btn btn-secondary mr-2" (click)="goBack()">Back to List</button>
          <button class="btn btn-primary" (click)="printIDCard()">Print ID Card</button>
        </div>
      </div>
      
      <div class="row" *ngIf="student">
        <!-- ID Card Preview -->
        <div class="col-md-4">
          <div class="card">
            <h3>ID Card</h3>
            <div class="id-card">
              <div class="id-card-header">
                <h4>Medical College Student ID</h4>
              </div>
              <div class="id-card-body">
                <img [src]="student.photoUrl || 'assets/placeholder.jpg'" alt="Student Photo" class="id-card-photo">
                <div class="id-card-info">
                  <p><strong>Name:</strong> {{student.fullName}}</p>
                  <p><strong>PRN No:</strong> {{student.prnNumber}}</p>
                  <p><strong>Roll No:</strong> {{student.rollNumber}}</p>
                  <p><strong>Course:</strong> {{student.courseName}}</p>
                  <p><strong>Year:</strong> {{student.yearOfJoining}}</p>
                </div>
              </div>
              <div class="id-card-footer">
                <p>Valid till: {{cardValidTill | date:'mediumDate'}}</p>
              </div>
            </div>
            
            <div class="qr-code-container mt-3">
              <h4>QR Code</h4>
              <div class="text-center">
                <!-- <qrcode [qrdata]="qrCodeData" [width]="200" [errorCorrectionLevel]="'M'"></qrcode> -->
                <p class="mt-2">Scan to view student profile</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Student Details -->
        <div class="col-md-8">
          <div class="card">
            <h3>Personal Information</h3>
            <div class="student-info">
              <div class="info-group">
                <div class="info-label">Full Name</div>
                <div class="info-value">{{student.fullName}}</div>
              </div>
              
              <div class="info-group">
                <div class="info-label">Date of Birth</div>
                <div class="info-value">{{student.dateOfBirth | date:'mediumDate'}}</div>
              </div>
              
              <div class="info-group">
                <div class="info-label">Mobile Number</div>
                <div class="info-value">{{student.mobileNumber}}</div>
              </div>
              
              <div class="info-group">
                <div class="info-label">Address</div>
                <div class="info-value">{{student.address}}</div>
              </div>
            </div>
          </div>
          
          <div class="card mt-3">
            <h3>Academic Information</h3>
            <div class="student-info">
              <div class="info-group">
                <div class="info-label">PRN Number</div>
                <div class="info-value">{{student.prnNumber}}</div>
              </div>
              
              <div class="info-group">
                <div class="info-label">Roll Number</div>
                <div class="info-value">{{student.rollNumber}}</div>
              </div>
              
              <div class="info-group">
                <div class="info-label">Course</div>
                <div class="info-value">{{student.courseName}}</div>
              </div>
              
              <div class="info-group">
                <div class="info-label">Year of Joining</div>
                <div class="info-value">{{student.yearOfJoining}}</div>
              </div>
              
              <div class="info-group">
                <div class="info-label">Registration Date</div>
                <div class="info-value">{{student.createdAt | date:'medium'}}</div>
              </div>
            </div>
          </div>
          
          <div class="card mt-3">
            <h3>ID Card Information</h3>
            <div class="student-info">
              <div class="info-group">
                <div class="info-label">Card Validity</div>
                <div class="info-value">{{cardValidTill | date:'mediumDate'}}</div>
              </div>
              
              <div class="info-group">
                <div class="info-label">Last Printed</div>
                <div class="info-value">{{student.updatedAt | date:'medium'}}</div>
              </div>
            </div>
            
            <div class="mt-3">
              <button class="btn btn-primary" (click)="printIDCard()">Print ID Card</button>
              <button class="btn btn-secondary ml-2" [routerLink]="['/register']">Register New Student</button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card" *ngIf="!student && !isLoading">
        <p class="text-center">Student not found or has been removed.</p>
        <div class="text-center mt-3">
          <button class="btn btn-primary" [routerLink]="['/students']">View All Students</button>
        </div>
      </div>
      
      <div class="card" *ngIf="isLoading">
        <p class="text-center">Loading student details...</p>
      </div>
    </section>
  `,
  styles: [`
    .student-detail {
      animation: fadeIn 0.5s ease-in;
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-3);
    }
    
    .section-title {
      color: var(--primary-700);
      margin-bottom: 0;
    }
    
    .student-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-2);
    }
    
    .info-group {
      margin-bottom: var(--space-2);
    }
    
    .info-label {
      font-weight: 500;
      color: var(--neutral-600);
      margin-bottom: 0.25rem;
    }
    
    .info-value {
      color: var(--neutral-900);
    }
    
    .qr-code-container {
      text-align: center;
    }
    
    @media (max-width: 768px) {
      .section-header {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .actions {
        margin-top: var(--space-2);
      }
      
      .student-info {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class StudentDetailComponent implements OnInit {
  studentId: string = '';
  student: Student | null = null;
  isLoading = true;
  cardValidTill = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
  qrCodeData = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.studentId = id;
        this.loadStudentDetails();
        this.generateQRCodeData();
      } else {
        this.router.navigate(['/students']);
      }
    });
  }

  loadStudentDetails(): void {
    this.isLoading = true;
    this.studentService.getStudent(this.studentId).subscribe(
      data => {
        this.student = data;
        this.isLoading = false;
      },
      error => {
        console.error('Error loading student details:', error);
        this.isLoading = false;
        
        // For demo purposes, load mock data
        this.loadMockData();
      }
    );
  }

  generateQRCodeData(): void {
    // In a real application, this would be a URL to the student's profile
    this.qrCodeData = `http://medical-college.edu/students/${this.studentId}`;
  }

  printIDCard(): void {
    // In a real application, you would implement printing functionality
    // For now, we'll just simulate it
    alert('Printing ID Card...');
  }

  goBack(): void {
    this.router.navigate(['/students']);
  }

  // Load mock data for preview purposes
  loadMockData(): void {
    this.student = {
      _id: this.studentId,
      photoUrl: `https://randomuser.me/api/portraits/men/${parseInt(this.studentId) % 70 + 1}.jpg`,
      fullName: `Student ${this.studentId}`,
      address: `Address ${this.studentId}, Medical College Road, City`,
      dateOfBirth: new Date(1995, 5, 15),
      mobileNumber: '9876543210',
      prnNumber: `PRN2025${this.studentId.padStart(3, '0')}`,
      rollNumber: `ROLL${this.studentId.padStart(3, '0')}`,
      yearOfJoining: 2023,
      courseName: 'MBBS',
      createdAt: new Date(2023, 7, 10),
      updatedAt: new Date()
    };
  }
}