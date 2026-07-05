import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Member } from '../../_models/member';
import { MembersService } from '../../_services/members.service';
import { SharedModule } from "../../_modules/shared.module";
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { MemberMessagesComponent } from '../member-messages/member-messages.component';
import { PresenceService } from '../../_services/presence.service';

type MemberTab = 'about' | 'interests' | 'photos' | 'messages';

@Component({
  selector: 'app-member-detail',
  imports: [SharedModule, DatePipe, MemberMessagesComponent],
  templateUrl: './member-detail.component.html',
  styleUrl: './member-detail.component.css'
})
export class MemberDetailComponent {
  member?: Member;

  route = inject(ActivatedRoute);
  memberService = inject(MembersService);
  private toastr = inject(ToastrService);
  private presenceService = inject(PresenceService);

  activeTab: MemberTab = 'about';
  isOnline = computed(() => !!this.member && this.presenceService.onlineUsers().includes(this.member.username));

  photos: string[] = [];
  isModalOpen = false;
  activeIndex = 0;

  ngOnInit(): void {
    this.loadMember();

    const tab = this.route.snapshot.queryParamMap.get('tab');
    if (tab === 'messages') this.activeTab = 'messages';
  }

  setTab(tab: MemberTab) {
    this.activeTab = tab;
  }

  addLike() {
    if (!this.member) return;

    this.memberService.addLike(this.member.username).subscribe({
      next: () => this.toastr.success('You liked ' + this.member!.knownAs),
      error: error => this.toastr.error(error.error)
    });
  }

  loadMember() {
    this.memberService
      .getMember(this.route.snapshot.paramMap.get('username')!)
      .subscribe(member => {
        this.member = member;
        this.photos = (member.photos ?? [])
          .filter((p: any) => p.isApproved !== false)
          .map((p: any) => p.url ?? p.photoUrl ?? p.imageUrl)
          .filter((u): u is string => !!u);
      });
  }

  openPhoto(i: number) {
    this.activeIndex = i;
  }

  closeModal() { this.isModalOpen = false; }
  prev() { if (this.photos.length) this.activeIndex = (this.activeIndex - 1 + this.photos.length) % this.photos.length; }
  next() { if (this.photos.length) this.activeIndex = (this.activeIndex + 1) % this.photos.length; }
}