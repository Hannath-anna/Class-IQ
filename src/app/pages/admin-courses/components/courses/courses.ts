import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  isEditMode = false;
  editingCourseId: string | null = null;
  courseForm: FormGroup;
  selectedFile: File | null = null;

  constructor(private backendService: BackendService, private fb: FormBuilder) {
    this.courseForm = this.fb.group({
      course_name: ['', Validators.required],
      description: ['', Validators.required],
      sub_description: [''],
      duration_text: ['', Validators.required],
      fee: [null, [Validators.required, Validators.min(0)]],
      course_steps: this.fb.array([ this.createStep()]),
      courseImage: [null],
      isBlocked: [false]
    });
  }

  createStep(): FormGroup {
    return this.fb.group({
      duration: [null, [Validators.required, Validators.min(1)]],
      unit: ['Months', Validators.required], 
      description: ['', Validators.required]
    });
  }

  get courseSteps(): FormArray {
    return this.courseForm.get('course_steps') as FormArray;
  }

  addStep(): void {
    this.courseSteps.push(this.createStep());
  }

  removeStep(index: number): void {
    this.courseSteps.removeAt(index);
  }

  ngOnInit() {
    this.loadCourses()
  }

  openModale = false
  addClicked() {
    this.isEditMode = false;
    this.courseForm.reset({ isBlocked: false });
    this.courseSteps.clear();
    this.addStep();
    this.selectedFile = null;
    this.openModale = true
  }

  editClicked(course: any) {
    this.isEditMode = true;
    this.editingCourseId = course.id;
    this.openModale = true;

    // Pre-fill the form with the course data
    this.courseForm.patchValue({
      course_name: course.course_name,
      description: course.description,
      sub_description: course.sub_description,
      duration_text: course.duration_text,
      fee: course.fee,
      isBlocked: course.isBlocked,
    });

    // Handle pre-filling the FormArray for course_steps
    this.courseSteps.clear();
    const steps = typeof course.course_steps === 'string' ? JSON.parse(course.course_steps) : course.course_steps;
    if (steps && steps.length > 0) {
      steps.forEach((step: any) => this.courseSteps.push(this.fb.group(step)));
    } else {
      this.addStep(); // Add one empty step if none exist
    }

    // Clear previous file selections
    this.selectedFile = null;
    this.courseForm.get('courseImage')?.setValue(null);
  }

  closeModal() {
    this.openModale = false;
    this.courseForm.reset({
      isBlocked: false 
    });
    this.courseForm.reset(); 
    this.courseSteps.clear(); 
    this.addStep();
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

  toggleBlockStatus(course: any) {
    const newStatus = !course.isBlocked;

    this.backendService.updateCourseBlockStatus(course.id, newStatus).subscribe({
      next: (response) => {
        console.log(response.message);
        course.isBlocked = newStatus;
      },
      error: (err) => {
        console.error('Failed to update block status:', err);
      }
    });
  }

  onSubmit() {
     if (this.courseForm.invalid || (!this.isEditMode && !this.selectedFile)) {
      console.error("Form is invalid or file not selected for new course.");
      this.courseForm.markAllAsTouched();
      return;
    }

    // Create a FormData object to send both file and text data
    const formData = new FormData();

    if (this.selectedFile) {
      formData.append('courseImage', this.selectedFile, this.selectedFile.name);
    }
    formData.append('course_name', this.courseForm.value.course_name);
    formData.append('description', this.courseForm.value.description);
    formData.append('sub_description', this.courseForm.value.sub_description);
    formData.append('duration_text', this.courseForm.value.duration_text);
    formData.append('fee', this.courseForm.value.fee);
    formData.append('course_steps', JSON.stringify(this.courseForm.value.course_steps));
    formData.append('isBlocked', this.courseForm.value.isBlocked);

    if (this.isEditMode) {
      this.backendService.updateCourse(this.editingCourseId!, formData).subscribe({
        next: (response) => {
          console.log('Course updated successfully!', response);
          this.loadCourses(); 
          this.closeModal();
        },
        error: (err) => console.error('Error updating course:', err)
      });
    } else {
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
}
