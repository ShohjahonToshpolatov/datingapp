import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SharedModule } from '../_modules/shared.module';
import { ToastrService } from 'ngx-toastr';
import { Message } from '../_models/message';
import { Pagination } from '../_models/pagination';
import { MessageService } from '../_services/message.service';

@Component({
  selector: 'app-messages',
  imports: [SharedModule, RouterLink],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css'
})
export class MessagesComponent implements OnInit {
  private messageService = inject(MessageService);
  private toastr = inject(ToastrService);

  messages: Message[] = [];
  pagination?: Pagination;
  container = 'Unread';
  pageNumber = 1;
  pageSize = 10;
  loading = false;

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages() {
    this.loading = true;
    this.messageService.getMessages(this.pageNumber, this.pageSize, this.container).subscribe({
      next: response => {
        this.messages = response.result ?? [];
        this.pagination = response.pagination;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  deleteMessage(id: number) {
    this.messageService.deleteMessage(id).subscribe({
      next: () => {
        this.messages = this.messages.filter(m => m.id !== id);
        this.toastr.success('Message deleted');
      }
    });
  }

  pageChanged(event: any) {
    if (this.pageNumber !== event.page) {
      this.pageNumber = event.page;
      this.loadMessages();
    }
  }
}
