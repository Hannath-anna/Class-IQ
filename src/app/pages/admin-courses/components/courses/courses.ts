import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BackendService } from '../../../../../core/services/backend.service';
import { environments } from '../../../../../../environments/environment';

@Component({
  selector: 'app-courses',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './courses.html',
  styleUrl: './courses.css'
})
export class Courses {
  courses: any = []
  backendUrl = environments.api_url

  courseForm: FormGroup;
  selectedFile: File | null = null;
  constructor(private backendService: BackendService, private fb: FormBuilder) {
    this.courseForm = this.fb.group({
      course_name: ['', Validators.required],
      description: ['', Validators.required],
      sub_description: [''],
      duration_months: [null, [Validators.required, Validators.min(1)]],
      fee: [null, [Validators.required, Validators.min(0)]],
      course_steps_1: ['', Validators.required], 
      course_steps_2: ['', Validators.required],
      course_steps_3: ['', Validators.required],
      courseImage: [null, Validators.required] 
    });
  }

  ngOnInit() {
    this.loadCourses()
  }

  openModale = false
  addClicked() {
    this.openModale = true
  }

  closeModal() {
    this.openModale = false;
    this.courseForm.reset(); 
    this.selectedFile = null;
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
      this.courseForm.patchValue({ courseImage: this.selectedFile });
    }
  }

  loadCourses() {
    this.backendService.getCourses().subscribe({
      next: (res) => { 
        this.courses = res.reverse()
      },
      error: (err) => { 
        console.error(err); 
      }
    }); 
  }

  onSubmit() {
    if (this.courseForm.invalid || !this.selectedFile) {
      console.error("Form is invalid or file not selected.");
      return; // Stop if the form is invalid
    }

    const steps = {
      "0-6": this.courseForm.value.course_steps_1,
      "6-12": this.courseForm.value.course_steps_2,
      "12-18": this.courseForm.value.course_steps_3,
    };

    // Create a FormData object to send both file and text data
    const formData = new FormData();
    formData.append('courseImage', this.selectedFile, this.selectedFile.name);
    formData.append('course_name', this.courseForm.value.course_name);
    formData.append('description', this.courseForm.value.description);
    formData.append('sub_description', this.courseForm.value.sub_description);
    formData.append('duration_months', this.courseForm.value.duration_months);
    formData.append('fee', this.courseForm.value.fee);
    formData.append('course_steps', JSON.stringify(steps));

    this.backendService.addCourse(formData).subscribe({
      next: (response) => {
        console.log('Course added successfully!', response);
        this.loadCourses(); 
        this.closeModal();  
      },
      error: (err) => {
        console.error('Error adding course:', err);
      }
    });
  }
}
