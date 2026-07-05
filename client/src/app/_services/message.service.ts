import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { Message } from '../_models/message';
import { PaginatedResult } from '../_models/pagination';
import { User } from '../_models/user';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  private hubUrl = environment.hubUrl;
  private hubConnection?: HubConnection;

  messageThread = signal<Message[]>([]);

  createHubConnection(user: User, otherUsername: string) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'message?user=' + otherUsername, {
        accessTokenFactory: () => user.token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch(error => console.log(error));

    this.hubConnection.on('ReceiveMessageThread', messages => {
      this.messageThread.set(messages);
    });

    this.hubConnection.on('NewMessage', message => {
      this.messageThread.update(messages => [...messages, message]);
    });
  }

  stopHubConnection() {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      this.hubConnection.stop();
    }
  }

  async sendMessage(username: string, content: string) {
    return this.hubConnection?.invoke('SendMessage', { recipientUsername: username, content });
  }

  getMessages(pageNumber: number, pageSize: number, container: string) {
    let params = new HttpParams();
    params = params.append('pageNumber', pageNumber);
    params = params.append('pageSize', pageSize);
    params = params.append('container', container);

    return this.http.get<Message[]>(this.baseUrl + 'messages', { observe: 'response', params }).pipe(
      map(response => {
        const paginatedResult = new PaginatedResult<Message[]>();
        paginatedResult.result = response.body ?? [];
        const paginationHeader = response.headers.get('Pagination');
        if (paginationHeader) {
          paginatedResult.pagination = JSON.parse(paginationHeader);
        }
        return paginatedResult;
      })
    );
  }

  getMessageThread(username: string) {
    return this.http.get<Message[]>(this.baseUrl + 'messages/thread/' + username);
  }

  deleteMessage(id: number) {
    return this.http.delete(this.baseUrl + 'messages/' + id);
  }
}
