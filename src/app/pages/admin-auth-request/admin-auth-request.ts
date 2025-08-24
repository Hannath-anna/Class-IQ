import { ChangeDetectorRef, Component } from '@angular/core';
import { BackendService } from '../../../core/services/backend.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-auth-request',
  imports: [
    CommonModule
  ],
  templateUrl: './admin-auth-request.html',
  styleUrl: './admin-auth-request.css'
})
export class AdminAuthRequest {
  users: any[] = [];
  isLoading = true;
  loadingActionIds = new Set<number>();
  constructor(private backendService: BackendService,private cdr: ChangeDetectorRef, private toastr: ToastrService) {}

  ngOnInit() {
    this.backendService.getAllUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.isLoading = false;
        this.cdr.markForCheck()
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'Failed to load users.');
        this.cdr.markForCheck()
      }
    })
  }

  verifyUser(user: string): void {}

  toggleBlockUser(user: any): void {    
    const newStatus = !user.isBlocked;
    const action = newStatus ? 'block' : 'unblock'; 
    this.loadingActionIds.add(user.id);
    this.backendService.blockUser(user.id, newStatus).subscribe({
      next: () => {
        this.toastr.success(`User "${user.email}" was ${action}ed successfully.`, 'Update Successful');
        user.isBlocked = newStatus;
        this.loadingActionIds.delete(user.id);
        console.log(user);
        
        this.cdr.markForCheck()
      },
      error: (err) => {
        this.toastr.error(`Failed to ${action} user. Please try again.`, 'Update Failed');
        this.loadingActionIds.delete(user.id);
        this.cdr.markForCheck()
      }
    })
  }
}