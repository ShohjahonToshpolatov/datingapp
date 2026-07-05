import { Component, inject, OnInit } from '@angular/core';
import { Member } from '../_models/member';
import { MembersService } from '../_services/members.service';
import { ButtonRadioDirective } from "ngx-bootstrap/buttons";
import { FormsModule } from '@angular/forms';
import { MemberCardComponent } from '../members/member-card/member-card.component';

@Component({
  selector: 'app-lists',
  imports: [ButtonRadioDirective, FormsModule, MemberCardComponent],
  templateUrl: './lists.component.html',
  styleUrl: './lists.component.css'
})
export class ListsComponent implements OnInit {
  ngOnInit(): void {
    this.loadLikes();
  }
  members: Member[] = [];
  predicate = 'liked';

  memberService = inject(MembersService);

  loadLikes() {
    this.memberService.getLikes(this.predicate).subscribe({
      next: response => this.members = response
    });
  }
}