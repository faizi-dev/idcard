import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = 'http://localhost:3000/api/students';

  constructor(private http: HttpClient) {}

  // Get all students
  getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(this.apiUrl);
  }

  // Get a single student by ID
  getStudent(id: string): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}`);
  }

  // Register a new student
  registerStudent(studentData: FormData): Observable<Student> {
    return this.http.post<Student>(this.apiUrl, studentData);
  }

  // Update an existing student
  updateStudent(id: string, studentData: FormData): Observable<Student> {
    return this.http.put<Student>(`${this.apiUrl}/${id}`, studentData);
  }

  // Delete a student
  deleteStudent(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Bulk upload students
  bulkUpload(fileData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk`, fileData);
  }

  // Get dashboard statistics
  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }

  // Generate QR code for a student
  generateQRCode(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/qr-code`);
  }

  // Print multiple ID cards
  printMultipleCards(ids: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/print`, { ids });
  }
}