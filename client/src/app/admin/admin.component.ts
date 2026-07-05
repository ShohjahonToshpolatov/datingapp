import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ButtonRadioDirective } from 'ngx-bootstrap/buttons';
import { AdminService } from '../_services/admin.service';
import { PhotoForApproval, UserWithRoles } from '../_models/admin';

@Component({
  selector: 'app-admin',
  imports: [FormsModule, ButtonRadioDirective],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  private adminService = inject(AdminService);
  private toastr = inject(ToastrService);

  section: 'users' | 'photos' = 'users';
  availableRoles = ['Admin', 'Moderator', 'Member'];

  users: UserWithRoles[] = [];
  photos: PhotoForApproval[] = [];

  ngOnInit(): void {
    this.loadUsers();
    this.loadPhotos();
  }

  loadUsers() {
    this.adminService.getUsersWithRoles().subscribe(users => this.users = users);
  }

  loadPhotos() {
    this.adminService.getPhotosForModeration().subscribe(photos => this.photos = photos);
  }

  toggleRole(user: UserWithRoles, role: string) {
    const roles = user.roles.includes(role)
      ? user.roles.filter(r => r !== role)
      : [...user.roles, role];

    this.adminService.updateUserRoles(user.username, roles).subscribe({
      next: () => user.roles = roles,
      error: error => this.toastr.error(error.error)
    });
  }

  approvePhoto(photo: PhotoForApproval) {
    this.adminService.approvePhoto(photo.id).subscribe({
      next: () => {
        this.photos = this.photos.filter(p => p.id !== photo.id);
        this.toastr.success('Photo approved');
      }
    });
  }

  rejectPhoto(photo: PhotoForApproval) {
    this.adminService.rejectPhoto(photo.id).subscribe({
      next: () => {
        this.photos = this.photos.filter(p => p.id !== photo.id);
        this.toastr.success('Photo rejected');
      }
    });
  }
}
