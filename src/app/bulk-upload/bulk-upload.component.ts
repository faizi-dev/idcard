import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../services/student.service';

@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="bulk-upload fade-in">
      <h2 class="section-title">Bulk Upload Students</h2>
      
      <div class="row">
        <div class="col-md-6">
          <div class="card">
            <h3>Upload Excel/CSV File</h3>
            <p>Upload a file containing student data for bulk registration.</p>
            
            <div class="file-upload-container mt-3">
              <div class="file-upload-area" 
                   [class.file-drag-over]="isDragOver"
                   (dragover)="onDragOver($event)" 
                   (dragleave)="onDragLeave()" 
                   (drop)="onFileDrop($event)">
                
                <div class="file-upload-content">
                  <span class="material-icons">cloud_upload</span>
                  <p>Drag and drop your file here or</p>
                  <div class="file-input-wrapper">
                    <input type="file" id="fileUpload" 
                           (change)="onFileSelected($event)"
                           accept=".xlsx,.xls,.csv">
                    <label for="fileUpload" class="btn btn-primary">Browse Files</label>
                  </div>
                </div>
                
                <div class="file-details" *ngIf="selectedFile">
                  <p><strong>Selected File:</strong> {{selectedFile.name}}</p>
                  <p><strong>Size:</strong> {{formatFileSize(selectedFile.size)}}</p>
                </div>
              </div>
            </div>
            
            <div class="upload-actions mt-3" *ngIf="selectedFile">
              <button class="btn btn-primary" (click)="uploadFile()" [disabled]="isUploading">
                <span *ngIf="isUploading">Uploading...</span>
                <span *ngIf="!isUploading">Upload and Process</span>
              </button>
              <button class="btn btn-secondary ml-2" (click)="clearFile()">Clear</button>
            </div>
            
            <div class="upload-progress mt-3" *ngIf="isUploading">
              <div class="progress">
                <div class="progress-bar" [style.width.%]="uploadProgress"></div>
              </div>
              <p class="text-center">{{uploadProgress}}% Complete</p>
            </div>
          </div>
          
          <div class="card mt-3">
            <h3>Template and Instructions</h3>
            <p>Download the template file and follow the instructions to prepare your data.</p>
            
            <div class="mt-3">
              <button class="btn btn-primary" (click)="downloadTemplate()">Download Template</button>
            </div>
            
            <div class="instructions mt-3">
              <h4>Instructions:</h4>
              <ol>
                <li>Download and open the template file.</li>
                <li>Fill in student details according to the column headers.</li>
                <li>Save the file as Excel (.xlsx) or CSV.</li>
                <li>Upload the file using the form above.</li>
                <li>Review the processed data before confirming.</li>
              </ol>
              
              <div class="alert mt-3">
                <strong>Note:</strong> For uploading photos in bulk, you'll need to include a URL column in your spreadsheet or upload photos separately.
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-6">
          <div class="card">
            <h3>Upload Status</h3>
            
            <div class="status-container">
              <div *ngIf="!processedRecords.length && !isUploading" class="empty-status">
                <p>No data has been processed yet. Upload a file to start.</p>
              </div>
              
              <div *ngIf="isUploading" class="processing-status">
                <p>Processing your file... Please wait.</p>
              </div>
              
              <div *ngIf="processedRecords.length" class="result-status">
                <div class="status-summary">
                  <div class="status-item">
                    <div class="status-count">{{processedRecords.length}}</div>
                    <div class="status-label">Total Records</div>
                  </div>
                  
                  <div class="status-item success">
                    <div class="status-count">{{successCount}}</div>
                    <div class="status-label">Success</div>
                  </div>
                  
                  <div class="status-item error">
                    <div class="status-count">{{errorCount}}</div>
                    <div class="status-label">Errors</div>
                  </div>
                </div>
                
                <div class="table-responsive mt-3">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>PRN Number</th>
                        <th>Course</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let record of processedRecords" 
                          [class.error-row]="!record.success">
                        <td>{{record.fullName}}</td>
                        <td>{{record.prnNumber}}</td>
                        <td>{{record.courseName}}</td>
                        <td>
                          <span *ngIf="record.success" class="status-badge success">Success</span>
                          <span *ngIf="!record.success" class="status-badge error">Error: {{record.error}}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div class="actions mt-3">
                  <button class="btn btn-primary" (click)="generateIDCards()" [disabled]="!successCount">
                    Generate ID Cards
                  </button>
                  <button class="btn btn-secondary ml-2" (click)="clearResults()">
                    Clear Results
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .bulk-upload {
      animation: fadeIn 0.5s ease-in;
    }
    
    .section-title {
      margin-bottom: var(--space-3);
      color: var(--primary-700);
      border-bottom: 2px solid var(--primary-200);
      padding-bottom: var(--space-1);
    }
    
    .file-upload-container {
      margin-bottom: var(--space-2);
    }
    
    .file-upload-area {
      border: 2px dashed var(--neutral-300);
      border-radius: var(--radius-md);
      padding: var(--space-3);
      transition: all 0.3s ease;
      background-color: var(--neutral-50);
    }
    
    .file-drag-over {
      border-color: var(--primary-400);
      background-color: var(--primary-50);
    }
    
    .file-upload-content {
      text-align: center;
    }
    
    .file-upload-content .material-icons {
      font-size: 3rem;
      color: var(--neutral-500);
      margin-bottom: var(--space-1);
    }
    
    .file-input-wrapper {
      position: relative;
      display: inline-block;
      margin-top: var(--space-2);
    }
    
    .file-input-wrapper input {
      position: absolute;
      left: 0;
      top: 0;
      opacity: 0;
      width: 0.1px;
      height: 0.1px;
      overflow: hidden;
    }
    
    .file-details {
      margin-top: var(--space-2);
      padding-top: var(--space-2);
      border-top: 1px solid var(--neutral-200);
    }
    
    .progress {
      height: 10px;
      background-color: var(--neutral-200);
      border-radius: 5px;
      overflow: hidden;
    }
    
    .progress-bar {
      height: 100%;
      background-color: var(--primary-500);
      transition: width 0.3s ease;
    }
    
    .status-container {
      min-height: 300px;
    }
    
    .empty-status, .processing-status {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 300px;
      color: var(--neutral-500);
    }
    
    .status-summary {
      display: flex;
      justify-content: space-around;
      margin-bottom: var(--space-3);
    }
    
    .status-item {
      text-align: center;
      padding: var(--space-2);
      border-radius: var(--radius-md);
      background-color: var(--neutral-100);
      width: 100px;
    }
    
    .status-count {
      font-size: 2rem;
      font-weight: 500;
    }
    
    .status-item.success {
      background-color: var(--success-50);
    }
    
    .status-item.success .status-count {
      color: var(--success-700);
    }
    
    .status-item.error {
      background-color: var(--error-50);
    }
    
    .status-item.error .status-count {
      color: var(--error-700);
    }
    
    .error-row {
      background-color: var(--error-50);
    }
    
    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
    }
    
    .status-badge.success {
      background-color: var(--success-50);
      color: var(--success-700);
    }
    
    .status-badge.error {
      background-color: var(--error-50);
      color: var(--error-700);
    }
    
    .alert {
      background-color: var(--warning-50);
      color: var(--warning-700);
      padding: var(--space-2);
      border-radius: var(--radius-sm);
    }
    
    .instructions ol {
      padding-left: var(--space-3);
    }
    
    .instructions li {
      margin-bottom: var(--space-1);
    }
  `]
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