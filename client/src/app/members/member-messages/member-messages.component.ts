import { Component, ElementRef, inject, Input, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { TimeagoModule } from 'ngx-timeago';
import { take } from 'rxjs/operators';
import { AccountService } from '../../_services/account.service';
import { MessageService } from '../../_services/message.service';

@Component({
  selector: 'app-member-messages',
  imports: [FormsModule, TimeagoModule],
  templateUrl: './member-messages.component.html',
  styleUrl: './member-messages.component.css'
})
export class MemberMessagesComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) username!: string;
  @ViewChild('messageForm') messageForm?: NgForm;
  @ViewChild('scrollContainer') scrollContainer?: ElementRef<HTMLDivElement>;

  private accountService = inject(AccountService);
  messageService = inject(MessageService);

  messageContent = '';
  currentUsername?: string;

  ngOnChanges(): void {
    if (!this.username) return;

    this.accountService.currentUser$.pipe(take(1)).subscribe(user => {
      if (!user) return;
      this.currentUsername = user.username;
      this.messageService.stopHubConnection();
      this.messageService.createHubConnection(user, this.username);
    });
  }

  ngOnDestroy(): void {
    this.messageService.stopHubConnection();
  }

  async sendMessage() {
    const content = this.messageContent.trim();
    if (!content) return;

    await this.messageService.sendMessage(this.username, content);
    this.messageForm?.reset();
    this.messageContent = '';
  }
}
