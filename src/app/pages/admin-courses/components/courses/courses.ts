import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core'; // Import OnInit
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BackendService } from '../../../../../core/services/backend.service';
import { environments } from '../../../../../../environments/environment';

@Component({
  selector: 'app-courses',
  imports: [ CommonModule, ReactiveFormsModule ],
  templateUrl: './courses.html',
  styleUrl: './courses.css'
})
export class Courses implements OnInit {
  courses: any = [];
  backendUrl = environments.api_url;
  isEditMode = false;
  editingCourseId: string | null = null;
  courseForm: FormGroup;
  selectedFile: File | null = null;
  openModale = false;

  constructor(private backendService: BackendService, private fb: FormBuilder) {
    this.courseForm = this.fb.group({
      course_name: ['', Validators.required],
      description: ['', Validators.required],
      sub_description: [''],
      duration_text: ['', Validators.required],
      fee: [null, [Validators.required, Validators.min(0)]],
      course_steps: this.fb.array([this.createStep()]),
      courseImage: [null],
      isBlocked: [false]
    });
  }

  ngOnInit() {
    this.loadCourses();
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

  loadCourses() {
    this.backendService.getCourses().subscribe({
      next: (res) => { this.courses = res.reverse(); },
      error: (err) => { console.error(err); }
    });
  }

  addClicked() {
    this.isEditMode = false;
    this.editingCourseId = null;
    this.openModale = true;

    // Reset form to its initial state for adding a new course
    this.courseForm.reset({ isBlocked: false });
    this.courseSteps.clear();
    this.addStep();
    this.selectedFile = null;
  }

 editClicked(course: any) {
  this.isEditMode = true;
  this.editingCourseId = course.id;
  this.openModale = true;

  // Pre-fill top-level form fields (this part is likely fine)
  this.courseForm.patchValue({
    course_name: course.course_name,
    description: course.description,
    sub_description: course.sub_description,
    duration_text: course.duration_text,
    fee: course.fee,
    isBlocked: !!course.isBlocked, // Ensure it's a true boolean
  });

  // === DEBUGGING AND FIXING THE FORM ARRAY ===
  this.courseSteps.clear();
  const steps = typeof course.course_steps === 'string' 
                ? JSON.parse(course.course_steps) 
                : course.course_steps;

  if (steps && Array.isArray(steps) && steps.length > 0) {
    steps.forEach((stepData: any) => {
      // ** THE CRITICAL DEBUGGING STEP **
      // This will show you exactly what you're trying to patch.
      console.log('Attempting to patch step with this data:', stepData);
      
      const stepGroup = this.createStep();
      stepGroup.patchValue(stepData); // patchValue is case-sensitive!
      this.courseSteps.push(stepGroup);
    });
  } else {
    this.addStep();
  }
  // === END OF DEBUGGING SECTION ===

  this.selectedFile = null;
  this.courseForm.get('courseImage')?.setValue(null);
}

  closeModal() {
  this.openModale = false;
  this.isEditMode = false;
  this.editingCourseId = null;

  // Single, effective reset call with default values
  this.courseForm.reset({
    isBlocked: false,
    unit: 'Months' // It's good practice to reset select dropdowns too
  });

  // Clear and re-initialize the course steps
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

  toggleBlockStatus(course: any) {
    const newStatus = !course.isBlocked;
    this.backendService.updateCourseBlockStatus(course.id, newStatus).subscribe({
      next: (response) => {
        console.log(response.message);
        course.isBlocked = newStatus;
      },
      error: (err) => console.error('Failed to update block status:', err)
    });
  }
  
  deleteClicked(course: any) {
    const confirmation = window.confirm(`Are you sure you want to delete "${course.course_name}"?`);
    if (confirmation) {
      this.backendService.deleteCourse(course.id).subscribe({
        next: (response) => {
          console.log(response.message);
          this.courses = this.courses.filter((c: any) => c.id !== course.id);
        },
        error: (err) => console.error('Failed to delete course:', err)
      });
    }
  }

  onSubmit() {
    if (this.courseForm.invalid || (!this.isEditMode && !this.selectedFile)) {
      console.error("Form is invalid or file not selected for new course.");
      this.courseForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    if (this.selectedFile) {
      formData.append('courseImage', this.selectedFile, this.selectedFile.name);
    }
    Object.keys(this.courseForm.value).forEach(key => {
        if (key !== 'courseImage') { 
            const value = this.courseForm.value[key];
            if (key === 'course_steps') {
                formData.append(key, JSON.stringify(value));
            } else {
                formData.append(key, value);
            }
        }
    });

    if (this.isEditMode) {
      this.backendService.updateCourse(this.editingCourseId!, formData).subscribe({
        next: () => { this.loadCourses(); this.closeModal(); },
        error: (err) => console.error('Error updating course:', err)
      });
    } else {
      this.backendService.addCourse(formData).subscribe({
        next: () => { this.loadCourses(); this.closeModal(); },
        error: (err) => console.error('Error adding course:', err)
      });
    }
  }
}