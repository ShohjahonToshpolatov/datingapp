import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Member } from '../../_models/member';
import { MembersService } from '../../_services/members.service';
import { SharedModule } from "../../_modules/shared.module";
import { DatePipe } from '@angular/common';

type MemberTab = 'about' | 'interests' | 'photos' | 'messages';

@Component({
  selector: 'app-member-detail',
  imports: [SharedModule, DatePipe],
  templateUrl: './member-detail.component.html',
  styleUrl: './member-detail.component.css'
})
export class MemberDetailComponent {
  member?: Member;

  route = inject(ActivatedRoute);
  memberService = inject(MembersService);

  activeTab: MemberTab = 'about';

  photos: string[] = [];
  isModalOpen = false;
  activeIndex = 0;

  ngOnInit(): void {
    this.loadMember();
  }

  setTab(tab: MemberTab) {
    this.activeTab = tab;
  }

  loadMember() {
    this.memberService
      .getMember(this.route.snapshot.paramMap.get('username')!)
      .subscribe(member => {
        this.member = member;
        this.photos = (member.photos ?? [])
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