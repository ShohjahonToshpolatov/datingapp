import { Component, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { take } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Member } from '../../_models/member';
import { User } from '../../_models/user';
import { AccountService } from '../../_services/account.service';
import { MembersService } from '../../_services/members.service';
import { PhotoEditorComponent } from '../photo-editor/photo-editor.component';
import { TimeagoModule, TimeagoFormatter, TimeagoDefaultFormatter, TimeagoClock, TimeagoDefaultClock } from 'ngx-timeago';

type MemberTab = 'about' | 'photos';

@Component({
  selector: 'app-member-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, PhotoEditorComponent, TimeagoModule],
  providers: [
    { provide: TimeagoFormatter, useClass: TimeagoDefaultFormatter },
    { provide: TimeagoClock, useClass: TimeagoDefaultClock }
  ],
  templateUrl: './member-edit.component.html',
  styleUrl: './member-edit.component.css'
})
export class MemberEditComponent implements OnInit {
  @ViewChild('editForm') editForm?: NgForm;

  member?: Member;
  user?: User;

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.editForm?.dirty) {
      $event.returnValue = true;
    }
  }

  activeTab: MemberTab = 'about';

  private toastr = inject(ToastrService);
  private accountService = inject(AccountService);
  private membersService = inject(MembersService);

  ngOnInit(): void {
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: (user) => {
        this.user = user ?? undefined;
        if (!this.user) return;
        this.loadMember();
      }
    });
  }

  setTab(tab: MemberTab) {
    this.activeTab = tab;
  }

  loadMember() {
    if (!this.user?.username) return;

    this.membersService.getMember(this.user.username).subscribe({
      next: (member) => {
        this.member = member;
      },
      error: (err) => console.error('loadMember error:', err)
    });
  }

  saveChanges() {
    if (!this.member) return;

    this.membersService.updateMember(this.member).subscribe({
      next: () => {
        this.toastr.success('Profile updated successfully');
        this.editForm?.resetForm(this.member);
      },
      error: (err: unknown) => console.error('updateMember error:', err)
    });
  }
}