import { Component } from '@angular/core';
import { Banner } from './components/banner/banner';
import { Courses } from './components/courses/courses';

@Component({
  selector: 'app-admin-courses',
  imports: [
    // Banner,
    Courses
  ],
  templateUrl: './admin-courses.html',
  styleUrl: './admin-courses.css'
})
export class AdminCourses {

}
