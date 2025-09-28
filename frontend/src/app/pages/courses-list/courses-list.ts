import { ChangeDetectorRef, Component } from '@angular/core';
import { BackendService } from '../../../core/services/backend.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environments } from '../../../../environments/environment';
import { Router } from '@angular/router';

interface CourseStep {
  duration: number;
  unit: string;
  description: string;
}

interface Course {
  id: string;
  course_name: string;
  description: string;
  duration_text: string;
  fee: number;
  batch_strength: number;
  course_steps: CourseStep[] | [];
  image_url?: string;
  isBlocked: boolean;
}

@Component({
  selector: 'app-courses-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './courses-list.html',
  styleUrl: './courses-list.css'
})
export class CoursesList {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  selectedCourse: Course | null = null;
  searchTerm: string = '';
  isEnrolling: boolean = false;
  loadingCourse = true;
  backendUrl = environments.api_url;
  constructor(private router: Router, private bs: BackendService, private toastr: ToastrService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadCourses();
  }

  loadCourses() {
    this.loadingCourse = true;
    this.bs.getCourses().subscribe({
      next: (res) => { 
        this.courses = res.map((c: any) => ({
        ...c,
        course_steps: typeof c.course_steps === 'string' ? JSON.parse(c.course_steps) : c.course_steps
      }));
        this.filteredCourses = this.courses.filter(course => !course.isBlocked)        
        this.loadingCourse = false;
        this.cdr.markForCheck()
      }, 
      error: (err) => { this.toastr.error('Failed to load courses.', 'Load Error'); this.loadingCourse = false; this.cdr.markForCheck()}
    });
    // Mock data - replace with your API call
    // this.courses = [
    //   {
    //     id: '1',
    //     course_name: 'Full Stack Web Development',
    //     description: 'Learn modern web development with React, Node.js, and MongoDB. Build real-world projects and gain hands-on experience.',
    //     sub_description: 'Master frontend and backend development',
    //     duration_text: '6 Months',
    //     fee: 25000,
    //     batch_strength: 30,
    //     course_steps: [
    //       { duration: 1, unit: 'Month', description: 'HTML, CSS, and JavaScript fundamentals' },
    //       { duration: 2, unit: 'Months', description: 'React.js and modern frontend development' },
    //       { duration: 2, unit: 'Months', description: 'Node.js, Express.js, and backend development' },
    //       { duration: 1, unit: 'Month', description: 'Database design with MongoDB and final projects' }
    //     ],
    //     courseImage: '',
    //     isBlocked: false
    //   }
    //   // Add more mock courses as needed
    // ];
    // this.filteredCourses = [...this.courses];
  }

  filterCourses() {
    if (!this.searchTerm.trim()) {
      this.filteredCourses = [...this.courses];
    } else {
      this.filteredCourses = this.courses.filter(course =>
        course.course_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  selectCourse(course: Course) {
    this.selectedCourse = course;    
  }

  goBack() {
    this.selectedCourse = null;
  }

  enrollCourse(course: Course) {
    if (course.isBlocked) return;
    
    this.router.navigate(['signup'], { queryParams: { id: course.id } });
  } 

  registerAsFaculty(course: Course) {
    this.router.navigate(['faculty/signup'], { queryParams: { id: course.id } });
  }
}