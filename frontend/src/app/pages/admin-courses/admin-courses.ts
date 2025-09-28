import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environments } from '../../../../environments/environment';
import { BackendService } from '../../../core/services/backend.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-courses',
  imports: [
    CommonModule, ReactiveFormsModule
  ],
  templateUrl: './admin-courses.html',
  styleUrl: './admin-courses.css'
})
export class AdminCourses {
  courses: any = [];
  backendUrl = environments.api_url;
  isEditMode = false;
  editingCourseId: string | null = null;
  courseForm: FormGroup;
  selectedFile: File | null = null;
  openModale = false;
  filteredCourses: any = [];
  activeFilter: 'all' | 'active' | 'blocked' = 'all'; 
//injucting services (first working fun in angular)
  constructor(private backendService: BackendService, private fb: FormBuilder, private toastr: ToastrService, private cdr: ChangeDetectorRef) {
    //form initialization
    this.courseForm = this.fb.group({
      course_name: ['', Validators.required],
      description: ['', Validators.required],
      sub_description: [''],
      duration_text: ['', Validators.required],
      fee: [null, [Validators.required, Validators.min(0)]],
      batch_strength: [null, [Validators.required, Validators.min(1)]],
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

  loadingCourse = false;
  loadCourses() {
    this.loadingCourse = true;
    this.backendService.getCourses().subscribe({
      next: (res) => { 
        this.courses = res; 
        this.loadingCourse = false;
        this.applyFilter(this.activeFilter); 
        this.cdr.markForCheck()
      },
      error: (err) => { this.toastr.error('Failed to load courses.', 'Load Error'); this.loadingCourse = false; this.cdr.markForCheck()}
    });
  }

  applyFilter(filter: 'all' | 'active' | 'blocked'): void {
    this.activeFilter = filter;
    if (filter === 'all') {
      this.filteredCourses = [...this.courses];
    } else if (filter === 'active') {
      this.filteredCourses = this.courses.filter((course: any) => !course.isBlocked);
    } else if (filter === 'blocked') {
      this.filteredCourses = this.courses.filter((course: any) => course.isBlocked);
    }
  }

  addClicked() {
    this.isEditMode = false;
    this.editingCourseId = null;
    this.openModale = true;
    this.courseForm.reset({ isBlocked: false, unit: 'Months' });
    this.courseSteps.clear();
    this.addStep();
    this.selectedFile = null;
  }

  editClicked(course: any) {
    this.isEditMode = true;
    this.editingCourseId = course.id;
    this.openModale = true;
    this.courseForm.patchValue({
      course_name: course.course_name,
      description: course.description,
      sub_description: course.sub_description,
      duration_text: course.duration_text,
      fee: course.fee,
      batch_strength: course.batch_strength,
      isBlocked: !!course.isBlocked,
    });
    this.courseSteps.clear();
    const steps = typeof course.course_steps === 'string' ? JSON.parse(course.course_steps) : course.course_steps;
    if (steps && Array.isArray(steps) && steps.length > 0) {
      steps.forEach((stepData: any) => {
        const stepGroup = this.createStep();
        stepGroup.patchValue(stepData);
        this.courseSteps.push(stepGroup);
      });
    } else {
      this.addStep();
    }
    this.selectedFile = null;
    this.courseForm.get('courseImage')?.setValue(null);
  }

  closeModal() {
    this.openModale = false;
    this.isEditMode = false;
    this.editingCourseId = null;
    this.courseForm.reset({ isBlocked: false, unit: 'Months' });
    this.courseSteps.clear();
    this.addStep();
    this.selectedFile = null;
  }

// image
  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
      this.courseForm.patchValue({ courseImage: this.selectedFile });
    }
  }

  isBlocking = false;
  // toggleBlockStatus(course: any) {
  //   this.isBlocking = true;
  //   const newStatus = !course.isBlocked;
  //   const action = newStatus ? 'block' : 'unblock';
  //   this.backendService.updateCourseBlockStatus(course.id, newStatus).subscribe({
  //     next: (response) => {
  //       this.toastr.success(`Course "${course.course_name}" was ${action}ed!`, 'Update Successful');
  //       course.isBlocked = newStatus;
  //       this.applyFilter(this.activeFilter);
  //       this.isBlocking = false;
  //       this.cdr.markForCheck()
  //     },
  //     error: (err) => { this.toastr.error(`Failed to ${action} course.`, 'Update Failed'); this.isBlocking = false; this.cdr.markForCheck()}
  //   });
  // }
  
  deletingCourseId: number | null = null;
  deleteClicked(course: any) {
    const confirmation = window.confirm(`Are you sure you want to delete "${course.course_name}"?`);
    if (confirmation) {
      this.deletingCourseId = course.id;
      this.backendService.deleteCourse(course.id).subscribe({
        next: (response) => {
          this.toastr.success(`Course "${course.course_name}" was deleted.`, 'Delete Successful');
          this.deletingCourseId = null;
          this.courses = this.courses.filter((c: any) => c.id !== course.id)
          this.applyFilter(this.activeFilter);
          this.cdr.markForCheck()
        },
        error: (err) => { this.toastr.error('Failed to delete course.', 'Delete Failed'); this.deletingCourseId = null; this.cdr.markForCheck()}
      });
    }
  }

  isSubmitting = false;
  onSubmit() {
    if (this.courseForm.invalid || (!this.isEditMode && !this.selectedFile)) {
      this.toastr.error('Please fill out all required fields.', 'Invalid Form');
      this.courseForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
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
        next: (res) => {
          this.toastr.success('Course updated successfully!', 'Saved');
          this.isSubmitting = false;
          const index = this.courses.findIndex((c: any) => c.id === this.editingCourseId);
          if (index !== -1) this.courses[index] = res;
          this.applyFilter(this.activeFilter);
          this.closeModal();
          this.cdr.markForCheck()
        },
        error: (err) => { this.toastr.error('Failed to update course.', 'Save Failed'); this.isSubmitting = false; this.cdr.markForCheck()}
      });
    } else {
      this.backendService.addCourse(formData).subscribe({
        next: (res) => {
          // this.courses.push(res)
          this.loadCourses()          
          this.toastr.success('Course added successfully!', 'Created');
          this.isSubmitting = false;
          this.closeModal();
          this.cdr.markForCheck()
        },
        error: (err) => { console.error('Error adding course:', err); this.isSubmitting = false; this.cdr.markForCheck()}
      });
    }
  }
}
