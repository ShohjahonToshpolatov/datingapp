import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Member } from '../../_models/member';
import { MembersService } from '../../_services/members.service';
import { MemberCardComponent } from '../member-card/member-card.component';

@Component({
  selector: 'app-member-list',
  imports: [CommonModule, MemberCardComponent],
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {
  members: Member[] = [];
  private membersService = inject(MembersService);

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers(): void {
    this.membersService.getMembers().subscribe({
      next: (members) => (this.members = members),
      error: (err) => console.error('Error loading members:', err)
    });
  }
}
