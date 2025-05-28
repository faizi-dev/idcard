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
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss'
})
export class RegistrationComponent {
  registrationForm: FormGroup;
  isSubmitting = false;
  photoFile: File | null = null;
  photoPreviewUrl: string | ArrayBuffer | null = null;
  idCardGenerated = false;
  cardValidTill = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
  
  showWebcam = false;
  trigger = new Subject<void>();
  
  yearOptions: number[] = [];
  courseOptions: string[] = ['MBBS', 'BDS', 'BAMS', 'BHMS', 'B.Pharma', 'Nursing', 'Allied Health Sciences'];

  get f() { return this.registrationForm.controls; }

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private router: Router
  ) {
    const currentYear = new Date().getFullYear();
    for (let i = 0; i <= 5; i++) {
      this.yearOptions.unshift(currentYear - i);
    }
    
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

  toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }
  
  capturePhoto(): void {
    this.trigger.next();
  }
  
  handleImage(webcamImage: WebcamImage): void {
    this.photoPreviewUrl = webcamImage.imageAsDataUrl;
    this.showWebcam = false;
    
    fetch(webcamImage.imageAsDataUrl)
      .then(res => res.blob())
      .then(blob => {
        this.photoFile = new File([blob], 'webcam-photo.jpg', { type: 'image/jpeg' });
      });
  }
  
  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.photoFile = input.files[0];
      
      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreviewUrl = reader.result;
      };
      reader.readAsDataURL(this.photoFile);
    }
  }
  
  clearPhoto(): void {
    this.photoFile = null;
    this.photoPreviewUrl = null;
  }
  
  onSubmit(): void {
    if (this.registrationForm.invalid) {
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
    
    const formData = new FormData();
    formData.append('photo', this.photoFile);
    
    Object.keys(this.registrationForm.value).forEach(key => {
      formData.append(key, this.registrationForm.value[key]);
    });
    
    this.studentService.registerStudent(formData).subscribe(
      response => {
        console.log('Student registered successfully:', response);
        this.isSubmitting = false;
        this.idCardGenerated = true;
      },
      error => {
        console.error('Error registering student:', error);
        this.isSubmitting = false;
        alert('An error occurred while registering the student. Please try again.');
        
        this.idCardGenerated = true;
      }
    );
  }
  
  resetForm(): void {
    this.registrationForm.reset();
    this.clearPhoto();
    this.idCardGenerated = false;
  }
  
  printIDCard(): void {
    alert('Printing ID Card...');
  }
}