import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { Student } from '../../models/student.model';
// import { QRCodeModule } from 'angularx-qrcode';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './student-detail.component.html',
  styleUrl: './student-detail.component.scss'
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