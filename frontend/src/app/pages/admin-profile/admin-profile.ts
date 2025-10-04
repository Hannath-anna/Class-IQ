import { CommonModule, isPlatformBrowser } from "@angular/common";
import { ChangeDetectorRef, Component, Inject, PLATFORM_ID } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { environments } from "../../../../environments/environment";
import { BackendService } from "../../../core/services/backend.service";
import { ToastrService } from "ngx-toastr";


@Component({
  selector: 'app-admin-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-profile.html',
  styleUrl: './admin-profile.css',
})
export class AdminProfile {
  profile: any;
  courseInfo: any;
  addressObject: any = {};
  profileForm: FormGroup;
  isLoading = false;
  isSubmitting = false;
  isEditMode = false;
  selectedFile: File | null = null;
  backendUrl = environments.api_url;

  // Add this getter to expose Array to the template
  get Array() { return Array; } // <--- ADD THIS LINE

  constructor(
    private fb: FormBuilder,
    private backendService: BackendService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformID: Object
  ) {
    this.profileForm = this.fb.group({
      fullname: ['', Validators.required],
      qualifications: this.fb.array([]),
      address: this.fb.group({
        street: [''],
        city: [''],
        state: [''],
        post: [''],
        pin: ['']
      })
    });
  }

  get qualifications(): FormArray {
    return this.profileForm.get('qualifications') as FormArray;
  }

  addQualification(value: string = ''): void {
    this.qualifications.push(this.fb.group({ name: [value, Validators.required] }));
  }

  removeQualification(index: number): void {
    this.qualifications.removeAt(index);
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.profile = null;
    if (!isPlatformBrowser(this.platformID)) return;
    
    const adminid = localStorage.getItem('adminId');
    if (!adminid) {
      this.toastr.error('Admin ID not found in local storage.');
      this.isLoading = false;
      this.cdr.markForCheck();
      return;
    }
    
    this.isLoading = true;
    this.backendService.getAdminProfile(adminid).subscribe({
      next: (data) => {
        this.profile = data;
        this.getCourseInfo();

        if (data.profile?.address && typeof data.profile.address === 'string') {
          try {
            this.addressObject = JSON.parse(data.profile.address);
          } catch (e) {
            console.error("Failed to parse address JSON:", e);
            this.addressObject = {};
          }
        } else {
          this.addressObject = data.profile?.address || {};
        }

        this.populateForm(data);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error("Error loading admin profile:", err);
        this.toastr.error('Failed to load profile data.');
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  getCourseInfo(): void {
    if (!this.profile || !this.profile.courseId) return;

    this.backendService.getCourseInfo(this.profile.courseId).subscribe({
      next: (data) => {
        this.courseInfo = data;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error("Error loading course info:", err);
        this.toastr.error('Failed to load course data.');
        this.cdr.markForCheck();
      }
    });
  }

  populateForm(data: any): void {
    this.profileForm.patchValue({
      fullname: data.fullname,
      address: typeof data.profile?.address === 'string'
        ? JSON.parse(data.profile.address)
        : data.profile?.address || {}
    });

    this.qualifications.clear();
    const quals = Array.isArray(data.profile?.qualifications) ? data.profile.qualifications : [];
    quals.forEach((q: string) => this.addQualification(q));
  }

  toggleEditMode(): void {
    this.isEditMode = true;
    this.populateForm(this.profile);
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.selectedFile = null;
    this.populateForm(this.profile);
    this.cdr.markForCheck();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
      this.cdr.markForCheck();
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.toastr.error('Please correct the errors in the form.');
      this.profileForm.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();

    if (this.selectedFile) {
      formData.append('profileImage', this.selectedFile, this.selectedFile.name);
    }

    formData.append('fullname', this.profileForm.value.fullname);

    const qualificationsArray = this.qualifications.value.map((q: any) => q.name);
    formData.append('qualifications', JSON.stringify(qualificationsArray));

    formData.append('address', JSON.stringify(this.profileForm.value.address));

    this.backendService.updateAdminProfile(this.profile.id, formData).subscribe({
      next: (response) => {
        this.toastr.success('Profile updated successfully!');
        this.profile = response;
        this.isSubmitting = false;
        this.isEditMode = false;
        this.loadProfile();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error("Error updating admin profile:", err);
        this.toastr.error('Failed to update profile.');
        this.isSubmitting = false;
        this.cdr.markForCheck();
      }
    });
  }
}