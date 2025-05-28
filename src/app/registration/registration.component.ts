import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StudentService } from '../services/student.service';
import { WebcamModule, WebcamImage } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, WebcamModule],
  template: `
    <section class="registration fade-in">
      <h2 class="section-title">Student Registration</h2>
      
      <div class="row">
        <div class="col-md-8">
          <div class="card">
            <form [formGroup]="registrationForm" (ngSubmit)="onSubmit()">
              <div class="row">
                <!-- Personal Information -->
                <div class="col-md-6">
                  <h3>Personal Information</h3>
                  
                  <div class="form-group">
                    <label for="fullName">Full Name</label>
                    <input type="text" id="fullName" class="form-control" formControlName="fullName">
                    <div *ngIf="f['fullName'].touched && f['fullName'].invalid" class="error-message">
                      <div *ngIf="f['fullName'].errors?.['required']">Full name is required</div>
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label for="address">Address</label>
                    <textarea id="address" class="form-control" formControlName="address" rows="3"></textarea>
                    <div *ngIf="f['address'].touched && f['address'].invalid" class="error-message">
                      <div *ngIf="f['address'].errors?.['required']">Address is required</div>
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label for="dateOfBirth">Date of Birth</label>
                    <input type="date" id="dateOfBirth" class="form-control" formControlName="dateOfBirth">
                    <div *ngIf="f['dateOfBirth'].touched && f['dateOfBirth'].invalid" class="error-message">
                      <div *ngIf="f['dateOfBirth'].errors?.['required']">Date of birth is required</div>
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label for="mobileNumber">Mobile Number</label>
                    <input type="tel" id="mobileNumber" class="form-control" formControlName="mobileNumber">
                    <div *ngIf="f['mobileNumber'].touched && f['mobileNumber'].invalid" class="error-message">
                      <div *ngIf="f['mobileNumber'].errors?.['required']">Mobile number is required</div>
                      <div *ngIf="f['mobileNumber'].errors?.['pattern']">Enter a valid 10-digit mobile number</div>
                    </div>
                  </div>
                </div>
                
                <!-- Academic Information -->
                <div class="col-md-6">
                  <h3>Academic Information</h3>
                  
                  <div class="form-group">
                    <label for="prnNumber">PRN Number</label>
                    <input type="text" id="prnNumber" class="form-control" formControlName="prnNumber">
                    <div *ngIf="f['prnNumber'].touched && f['prnNumber'].invalid" class="error-message">
                      <div *ngIf="f['prnNumber'].errors?.['required']">PRN number is required</div>
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label for="rollNumber">Roll Number</label>
                    <input type="text" id="rollNumber" class="form-control" formControlName="rollNumber">
                    <div *ngIf="f['rollNumber'].touched && f['rollNumber'].invalid" class="error-message">
                      <div *ngIf="f['rollNumber'].errors?.['required']">Roll number is required</div>
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label for="yearOfJoining">Year of Joining</label>
                    <select id="yearOfJoining" class="form-control" formControlName="yearOfJoining">
                      <option value="">Select Year</option>
                      <option *ngFor="let year of yearOptions" [value]="year">{{year}}</option>
                    </select>
                    <div *ngIf="f['yearOfJoining'].touched && f['yearOfJoining'].invalid" class="error-message">
                      <div *ngIf="f['yearOfJoining'].errors?.['required']">Year of joining is required</div>
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label for="courseName">Course Name</label>
                    <select id="courseName" class="form-control" formControlName="courseName">
                      <option value="">Select Course</option>
                      <option *ngFor="let course of courseOptions" [value]="course">{{course}}</option>
                    </select>
                    <div *ngIf="f['courseName'].touched && f['courseName'].invalid" class="error-message">
                      <div *ngIf="f['courseName'].errors?.['required']">Course name is required</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="form-actions">
                <button type="submit" class="btn btn-primary" [disabled]="registrationForm.invalid || isSubmitting">
                  <span *ngIf="isSubmitting">Registering...</span>
                  <span *ngIf="!isSubmitting">Register Student</span>
                </button>
                <button type="button" class="btn btn-secondary ml-2" (click)="resetForm()">
                  Reset Form
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div class="col-md-4">
          <div class="card">
            <h3>Student Photo</h3>
            
            <div class="photo-container">
              <div *ngIf="photoPreviewUrl" class="photo-preview">
                <img [src]="photoPreviewUrl" alt="Student Photo Preview">
                <button type="button" class="btn btn-sm btn-danger mt-2" (click)="clearPhoto()">Remove Photo</button>
              </div>
              
              <div *ngIf="!photoPreviewUrl" class="photo-upload">
                <div class="webcam-container" *ngIf="showWebcam">
                  <webcam [height]="300" [width]="400" [trigger]="trigger" (imageCapture)="handleImage($event)"></webcam>
                  <button type="button" class="btn btn-primary mt-2" (click)="capturePhoto()">Capture Photo</button>
                  <button type="button" class="btn btn-secondary ml-2" (click)="toggleWebcam()">Cancel</button>
                </div>
                
                <div *ngIf="!showWebcam" class="upload-options">
                  <div class="upload-placeholder">
                    <span class="material-icons">add_a_photo</span>
                    <p>Upload or capture a photo</p>
                  </div>
                  <div class="upload-buttons">
                    <button type="button" class="btn btn-primary" (click)="toggleWebcam()">Use Camera</button>
                    <div class="or-divider">OR</div>
                    <div class="file-upload">
                      <input type="file" id="photoFile" (change)="onPhotoSelected($event)" accept="image/*">
                      <label for="photoFile" class="btn btn-secondary">Upload Photo</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card mt-3" *ngIf="idCardGenerated">
            <h3>ID Card Preview</h3>
            <div class="id-card">
              <div class="id-card-header">
                <h4>Medical College Student ID</h4>
              </div>
              <div class="id-card-body">
                <img [src]="photoPreviewUrl || 'assets/placeholder.jpg'" alt="Student Photo" class="id-card-photo">
                <div class="id-card-info">
                  <p><strong>Name:</strong> {{registrationForm.value.fullName}}</p>
                  <p><strong>PRN No:</strong> {{registrationForm.value.prnNumber}}</p>
                  <p><strong>Roll No:</strong> {{registrationForm.value.rollNumber}}</p>
                  <p><strong>Course:</strong> {{registrationForm.value.courseName}}</p>
                  <p><strong>Year:</strong> {{registrationForm.value.yearOfJoining}}</p>
                </div>
              </div>
              <div class="id-card-footer">
                <p>Valid till: {{cardValidTill | date:'mediumDate'}}</p>
              </div>
            </div>
            
            <div class="text-center mt-3">
              <button class="btn btn-primary" (click)="printIDCard()">Print ID Card</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .registration {
      animation: fadeIn 0.5s ease-in;
    }
    
    .section-title {
      margin-bottom: var(--space-3);
      color: var(--primary-700);
      border-bottom: 2px solid var(--primary-200);
      padding-bottom: var(--space-1);
    }
    
    .error-message {
      color: var(--error-700);
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    
    .form-actions {
      margin-top: var(--space-3);
      padding-top: var(--space-2);
      border-top: 1px solid var(--neutral-200);
    }
    
    .photo-container {
      min-height: 300px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .photo-preview {
      width: 100%;
      text-align: center;
    }
    
    .photo-preview img {
      max-width: 100%;
      max-height: 300px;
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-sm);
    }
    
    .upload-options {
      width: 100%;
      text-align: center;
    }
    
    .upload-placeholder {
      border: 2px dashed var(--neutral-300);
      border-radius: var(--radius-md);
      padding: var(--space-3);
      margin-bottom: var(--space-2);
    }
    
    .upload-placeholder .material-icons {
      font-size: 3rem;
      color: var(--neutral-400);
    }
    
    .upload-placeholder p {
      margin-top: var(--space-1);
      color: var(--neutral-600);
    }
    
    .upload-buttons {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .or-divider {
      margin: var(--space-1) 0;
      color: var(--neutral-500);
    }
    
    .file-upload {
      position: relative;
      width: 100%;
    }
    
    .file-upload input {
      position: absolute;
      width: 0.1px;
      height: 0.1px;
      opacity: 0;
      overflow: hidden;
      z-index: -1;
    }
    
    .file-upload label {
      width: 100%;
      cursor: pointer;
      display: inline-block;
      text-align: center;
    }
  `]
})
export class RegistrationComponent {
  registrationForm: FormGroup;
  isSubmitting = false;
  photoFile: File | null = null;
  photoPreviewUrl: string | ArrayBuffer | null = null;
  idCardGenerated = false;
  cardValidTill = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
  
  // Webcam properties
  showWebcam = false;
  trigger = new Subject<void>();
  
  // Options for dropdowns
  yearOptions: number[] = [];
  courseOptions: string[] = ['MBBS', 'BDS', 'BAMS', 'BHMS', 'B.Pharma', 'Nursing', 'Allied Health Sciences'];

  // Convenience getter for form fields
  get f() { return this.registrationForm.controls; }

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private router: Router
  ) {
    // Generate year options (current year and 5 years back)
    const currentYear = new Date().getFullYear();
    for (let i = 0; i <= 5; i++) {
      this.yearOptions.unshift(currentYear - i);
    }
    
    // Initialize form
    this.registrationForm = this.fb.group({
      fullName: ['', Validators.required],
      address: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      prnNumber: ['', Validators.required],
      rollNumber: ['', Validators.required],
      yearOfJoining: ['', Validators.required],
      courseName: ['', Validators.required]
    });
  }

  // Toggle webcam visibility
  toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }
  
  // Trigger webcam photo capture
  capturePhoto(): void {
    this.trigger.next();
  }
  
  // Handle captured webcam image
  handleImage(webcamImage: WebcamImage): void {
    this.photoPreviewUrl = webcamImage.imageAsDataUrl;
    this.showWebcam = false;
    
    // Convert data URL to Blob and then to File
    fetch(webcamImage.imageAsDataUrl)
      .then(res => res.blob())
      .then(blob => {
        this.photoFile = new File([blob], 'webcam-photo.jpg', { type: 'image/jpeg' });
      });
  }
  
  // Handle file input change for photo upload
  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.photoFile = input.files[0];
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreviewUrl = reader.result;
      };
      reader.readAsDataURL(this.photoFile);
    }
  }
  
  // Clear selected photo
  clearPhoto(): void {
    this.photoFile = null;
    this.photoPreviewUrl = null;
  }
  
  // Form submission
  onSubmit(): void {
    if (this.registrationForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.registrationForm.controls).forEach(key => {
        const control = this.registrationForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    if (!this.photoFile) {
      alert('Please upload or capture a student photo');
      return;
    }
    
    this.isSubmitting = true;
    
    // Create FormData object for the API call
    const formData = new FormData();
    formData.append('photo', this.photoFile);
    
    // Append all form fields
    Object.keys(this.registrationForm.value).forEach(key => {
      formData.append(key, this.registrationForm.value[key]);
    });
    
    // Call API to register student
    this.studentService.registerStudent(formData).subscribe(
      response => {
        console.log('Student registered successfully:', response);
        this.isSubmitting = false;
        this.idCardGenerated = true;
        
        // In a real application, you would use the response data
        // Instead of using form values directly
        
        // You might want to navigate to the student details page
        // this.router.navigate(['/students', response._id]);
        
        // For now, we'll just show the ID card preview
      },
      error => {
        console.error('Error registering student:', error);
        this.isSubmitting = false;
        alert('An error occurred while registering the student. Please try again.');
        
        // For demo purposes, show the ID card anyway
        this.idCardGenerated = true;
      }
    );
  }
  
  // Reset the form
  resetForm(): void {
    this.registrationForm.reset();
    this.clearPhoto();
    this.idCardGenerated = false;
  }
  
  // Print ID card
  printIDCard(): void {
    // In a real application, you would implement printing functionality
    // For now, we'll just simulate it
    alert('Printing ID Card...');
    
    // You could use window.print() or a dedicated library for printing
    // Or navigate to a printable view
    // window.print();
  }
}