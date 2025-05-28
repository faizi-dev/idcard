import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../services/student.service';

@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bulk-upload.component.html',
  styleUrl: './bulk-upload.component.scss'
})
export class BulkUploadComponent {
  selectedFile: File | null = null;
  isDragOver = false;
  isUploading = false;
  uploadProgress = 0;
  processedRecords: any[] = [];
  successCount = 0;
  errorCount = 0;

  constructor(private studentService: StudentService) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(): void {
    this.isDragOver = false;
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (this.isValidFileType(file)) {
        this.selectedFile = file;
      } else {
        alert('Please upload a valid Excel (.xlsx, .xls) or CSV file.');
      }
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (this.isValidFileType(file)) {
        this.selectedFile = file;
      } else {
        alert('Please upload a valid Excel (.xlsx, .xls) or CSV file.');
        input.value = '';
      }
    }
  }

  isValidFileType(file: File): boolean {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    return allowedTypes.includes(file.type);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  clearFile(): void {
    this.selectedFile = null;
  }

  uploadFile(): void {
    if (!this.selectedFile) return;
    
    this.isUploading = true;
    this.uploadProgress = 0;
    
    // Simulate upload progress
    const interval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        this.processFile();
      }
    }, 300);
    
    // In a real application, you would use the StudentService
    /*
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    
    this.studentService.bulkUpload(formData).subscribe(
      response => {
        this.isUploading = false;
        this.processedRecords = response.records;
        this.successCount = response.success;
        this.errorCount = response.errors;
      },
      error => {
        console.error('Error uploading file:', error);
        this.isUploading = false;
        alert('An error occurred while uploading the file. Please try again.');
      }
    );
    */
  }

  // For demo purposes, simulate file processing
  processFile(): void {
    // Generate mock processed records
    this.processedRecords = [];
    const totalRecords = 10;
    
    for (let i = 1; i <= totalRecords; i++) {
      const success = Math.random() > 0.2; // 80% success rate
      this.processedRecords.push({
        fullName: `Student ${i}`,
        prnNumber: `PRN2025${i.toString().padStart(3, '0')}`,
        rollNumber: `ROLL${i.toString().padStart(3, '0')}`,
        courseName: ['MBBS', 'BDS', 'BAMS'][i % 3],
        yearOfJoining: 2023,
        success: success,
        error: success ? null : ['Missing date of birth', 'Invalid mobile number', 'Duplicate PRN number'][i % 3]
      });
    }
    
    this.successCount = this.processedRecords.filter(r => r.success).length;
    this.errorCount = this.processedRecords.length - this.successCount;
    this.isUploading = false;
  }

  downloadTemplate(): void {
    // In a real application, you would provide a template file for download
    //alert('Downloading template file...');
    
    // You could use a service or direct URL to download the file
    const url = 'assets/templates/student_bulk_upload_template.xlsx';
    window.open(url, '_blank');
  }

  generateIDCards(): void {
    // In a real application, you would implement ID card generation
    alert('Generating ID cards for successful records...');
  }

  clearResults(): void {
    this.processedRecords = [];
    this.successCount = 0;
    this.errorCount = 0;
  }
}