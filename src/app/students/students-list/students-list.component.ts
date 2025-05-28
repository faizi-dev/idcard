import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../services/student.service';
import { Student } from '../../models/student.model';

@Component({
  selector: 'app-students-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './students-list.component.html',
  styleUrl: './students-list.component.scss'
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