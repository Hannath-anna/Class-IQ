import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BackendService } from '../../../core/services/backend.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-signup',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {
  signupForm: FormGroup;
  isLoading = false;

  courses: any = ['No Preference'];

  constructor(private cdr: ChangeDetectorRef, private fb: FormBuilder, private backendService: BackendService, private toastr: ToastrService, private router: Router) {
    this.signupForm = this.fb.group({
      fullname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      course: ['', [Validators.required]],
      password: ['', [
        Validators.required,
        // Validators.minLength(8),
        // Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', [Validators.required]],
      agreeToTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.backendService.getCourses().subscribe({
      next: (res) => {
        const filteredCourses = res.filter((course: any) => !course.isBlocked);
        const courseNames = filteredCourses.map((course: any) => course.course_name);

        this.courses = [
          'No Preference',
          ...courseNames
        ];
      },
      error: () => {
        this.toastr.error('Could not load courses. Please try again later.');
      }
    })  
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: any } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword?.hasError('passwordMismatch')) {
      delete confirmPassword.errors?.['passwordMismatch'];
      confirmPassword?.updateValueAndValidity({ onlySelf: true });
    }
    
    return null;
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.toastr.error('Please correct the errors in the form.', 'Invalid Form');
      Object.keys(this.signupForm.controls).forEach(key => {
        this.signupForm.get(key)?.markAsTouched();
      });
      return;
    }
    if (this.isLoading) return
    
    this.isLoading = true;
    const formData = this.signupForm.value;    

    this.backendService.signup(formData).subscribe({
      next: (response: any) => {
        this.toastr.success('Account created successfully!', 'Welcome!');
        this.router.navigate(['/login']);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'An unknown error occurred.', 'Signup Failed');
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}