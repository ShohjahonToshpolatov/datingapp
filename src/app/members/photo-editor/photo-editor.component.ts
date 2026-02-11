import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FileUploadModule, FileUploader } from 'ng2-file-upload';
import { Member } from '../../_models/member';
import { AccountService } from '../../_services/account.service';
import { MembersService } from '../../_services/members.service';
import { User } from '../../_models/user';
import { Photo } from '../../_models/photo';

@Component({
  selector: 'app-photo-editor',
  standalone: true,
  imports: [CommonModule, FileUploadModule, NgClass],
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent implements OnInit {
  @Input() member!: Member;

  uploader!: FileUploader;
  hasBaseDropZoneOver = false;

  private membersService = inject(MembersService);
  private accountService = inject(AccountService);

  baseUrl = 'http://localhost:5251/api/';
  user!: User;

  ngOnInit(): void {
    const u = this.accountService.currentUserValue;
    if (!u) return; // safety
    this.user = u;

    this.initializeUploader();
  }

  fileOverBase(e: any) {
    this.hasBaseDropZoneOver = e;
  }

  setMainPhoto(photo: Photo) {
    this.membersService.setMainPhoto(photo.id).subscribe({
      next: () => {
        this.member.photos.forEach(p => (p.isMain = false));
        photo.isMain = true;

        this.member.photoUrl = photo.url;

        this.user.photoUrl = photo.url;
        this.accountService.setCurrentUser(this.user);
      }
    });
  }

  initializeUploader() {
    this.uploader = new FileUploader({
      url: this.baseUrl + 'users/add-photo',
      authToken: 'Bearer ' + this.user.token,
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024,
      itemAlias: 'file'
    });

    this.uploader.onAfterAddingFile = (file) => (file.withCredentials = false);

    this.uploader.onSuccessItem = (item, response) => {
      if (!response) return;

      const photo: Photo = JSON.parse(response);
      this.member.photos.push(photo);
      if (photo.isMain && this.user && this.member) {
        this.user.photoUrl = photo.url;
        this.member.photoUrl = photo.url;
        this.accountService.setCurrentUser(this.user);
      }

      if (photo.isMain) {
        this.member.photoUrl = photo.url;
        this.user.photoUrl = photo.url;
        this.accountService.setCurrentUser(this.user);
      }
    };


  }
  deletePhoto(photoId: number) {
    this.membersService.deletePhoto(photoId).subscribe({
      next: () => {
        if (this.member) {
          this.member.photos = this.member.photos.filter(p => p.id !== photoId);
        }
      }
    })
  }
}
