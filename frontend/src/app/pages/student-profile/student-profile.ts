import { ChangeDetectorRef, Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BackendService } from '../../../core/services/backend.service';
import { environments } from '../../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-student-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './student-profile.html',
  styleUrl: './student-profile.css'
})
export class StudentProfile {
  profile: any;
  courseInfo: any;
  addressObject: any = {};
  profileForm: FormGroup;
  isLoading = false;
  isSubmitting = false;
  isEditMode = false;
  selectedFile: File | null = null;
  backendUrl = environments.api_url;

  constructor(
    private fb: FormBuilder,
    private backendService: BackendService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformID: Object
  ) {
    this.profileForm = this.fb.group({
      fullname: ['', Validators.required],
      qualifications: [''],
      address: this.fb.group({
        street: [''],
        city: [''],
        state: [''],
        post: [''],
        pin: ['']
      })
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    if (!isPlatformBrowser(this.platformID)) return

    const studentid = localStorage.getItem('studentId');
    this.isLoading = true;
    this.backendService.getProfile(studentid).subscribe({
      next: (data) => {
        this.profile = data;
        this.getCourseInfo()
        if (data.profile.address && typeof data.profile.address === 'string') {
            try {
              this.addressObject = JSON.parse(data.profile.address);
            } catch (e) {
                console.log("Failed to parse address JSON", e);
                this.addressObject = {};
            }
        } else {
            this.addressObject = data.address || {};
        }
        this.populateForm(data);
        this.isLoading = false;
        this.cdr.markForCheck()
      },
      error: (err) => {
        this.toastr.error('Failed to load profile data.');
        this.isLoading = false;
        this.cdr.markForCheck()
      }
    });
  }

  getCourseInfo() {
    this.backendService.getCourseInfo(this.profile.courseId).subscribe({
      next: (data) => {
        this.courseInfo = data;
        this.cdr.markForCheck()
      },
      error: (err) => {
        this.toastr.error('Failed to load profile data.');
        this.cdr.markForCheck()
      }
    })
  }

  populateForm(data: any): void {
    this.profileForm.patchValue({
      fullname: data.fullname,
      phone: data.phone,
      qualifications: data.profile.qualifications,
      address: typeof data.profile.address === 'string' ? JSON.parse(data.profile.address) : data.profile.address
    });
  }

  toggleEditMode(): void {
    this.isEditMode = true;
    this.populateForm(this.profile);
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.selectedFile = null;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
      // Optional: Show a preview of the image
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.toastr.error('Please correct the errors in the form.');
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();    

    // Append file if selected
    if (this.selectedFile) {
      formData.append('profileImage', this.selectedFile, this.selectedFile.name);
    }

    formData.append('fullname', this.profileForm.value.fullname);
    formData.append('qualifications', this.profileForm.value.qualifications);
    formData.append('address', JSON.stringify(this.profileForm.value.address));

    this.backendService.updateProfile(this.profile.id, formData).subscribe({
      next: (response) => {
        this.toastr.success('Profile updated successfully!');
        this.profile = response;
        this.isSubmitting = false;
        this.isEditMode = false;
        this.profileForm.reset()
        this.loadProfile();
        this.cdr.markForCheck()
      },
      error: (err) => {
        this.toastr.error('Failed to update profile.');
        this.isSubmitting = false;
        this.cdr.markForCheck()
      }
    });
  }
}