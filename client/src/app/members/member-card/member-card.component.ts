import { Component, computed, inject, Input } from '@angular/core';
import { Member } from '../../_models/member';
import { RouterLink } from "@angular/router";
import { MembersService } from '../../_services/members.service';
import { PresenceService } from '../../_services/presence.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-member-card',
  imports: [RouterLink],
  templateUrl: './member-card.component.html',
  styleUrl: './member-card.component.css'
})
export class MemberCardComponent {
  @Input() member!: Member;
  memberService = inject(MembersService)
  toastr = inject(ToastrService)
  private presenceService = inject(PresenceService)

  isOnline = computed(() => this.presenceService.onlineUsers().includes(this.member.username));

  addLike(member: Member) {
    this.memberService.addLike(member.username).subscribe({
      next: () => this.toastr.success('You liked ' + member.knownAs),
      error: error => this.toastr.error(error.error)
    });
  }
}
