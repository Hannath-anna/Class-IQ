import { Component } from '@angular/core';
import { Courses } from './components/courses/courses';

@Component({
  selector: 'app-admin-courses',
  imports: [
    Courses
  ],
  templateUrl: './admin-courses.html',
  styleUrl: './admin-courses.css'
})
export class AdminCourses {

}
