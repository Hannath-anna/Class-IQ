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
  filteredUsers: any[] = [];
  activeFilter: 'all' | 'approved' | 'pending' | 'blocked' | 'verified' | 'unverified' = 'all';
  isLoading = true;
  loadingActionIds = new Set<number>();
  constructor(private backendService: BackendService,private cdr: ChangeDetectorRef, private toastr: ToastrService) {}

  ngOnInit() {
    this.backendService.getAllUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.applyFilter(this.activeFilter);
        this.isLoading = false;
        this.cdr.markForCheck()
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'Failed to load users.');
        this.isLoading = false;
        this.cdr.markForCheck()
      }
    })
  }

  applyFilter(filter: 'all' | 'approved' | 'pending' | 'blocked' | 'verified' | 'unverified'): void {
    this.activeFilter = filter;
    switch (filter) {
      case 'approved':
        this.filteredUsers = this.users.filter(user => user.isApproved);
        break;
      case 'pending':
        this.filteredUsers = this.users.filter(user => !user.isApproved);
        break;
      case 'blocked':
        this.filteredUsers = this.users.filter(user => user.isBlocked);
        break;
      case 'verified':
        this.filteredUsers = this.users.filter(user => user.isVerified);
        break;
      case 'unverified':
        this.filteredUsers = this.users.filter(user => !user.isVerified);
        break;
      default: 
        this.filteredUsers = [...this.users];
        break;
    }
  }

  verifStudent(user: any): void {
    this.loadingActionIds.add(user.id);
    this.backendService.verifyStudent(user.id).subscribe({
      next: (response) => {
        this.toastr.success(`Student "${user.email}" has been approved.`, 'Approval Successful');
        user.isApproved = 1; // MySQL BOOLEANs are often returned as 1 (true) or 0 (false).
        this.applyFilter(this.activeFilter);
        this.loadingActionIds.delete(user.id);
        this.cdr.markForCheck()
      },
      error: (err) => {
        this.toastr.error('Failed to approve student. Please try again.', 'Approval Failed');
        this.loadingActionIds.delete(user.id);
        this.cdr.markForCheck()
      }
    })
  }

  toggleBlockStudent(user: any): void {    
    const newStatus = !user.isBlocked;
    const action = newStatus ? 'block' : 'unblock'; 
    this.loadingActionIds.add(user.id);
    this.backendService.blockStudent(user.id, newStatus).subscribe({
      next: () => {
        this.toastr.success(`User "${user.email}" was ${action}ed successfully.`, 'Update Successful');
        user.isBlocked = newStatus;
        this.loadingActionIds.delete(user.id);
        this.applyFilter(this.activeFilter);
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