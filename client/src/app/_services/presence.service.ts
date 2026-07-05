import { inject, Injectable, signal } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';
import { User } from '../_models/user';

@Injectable({ providedIn: 'root' })
export class PresenceService {
  private hubUrl = environment.hubUrl;
  private hubConnection?: HubConnection;
  private toastr = inject(ToastrService);
  private router = inject(Router);

  onlineUsers = signal<string[]>([]);

  createHubConnection(user: User) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'presence', {
        accessTokenFactory: () => user.token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch(error => console.log(error));

    this.hubConnection.on('UserIsOnline', username => {
      this.onlineUsers.update(usernames => [...usernames, username]);
    });

    this.hubConnection.on('UserIsOffline', username => {
      this.onlineUsers.update(usernames => usernames.filter(u => u !== username));
    });

    this.hubConnection.on('GetOnlineUsers', usernames => {
      this.onlineUsers.set(usernames);
    });

    this.hubConnection.on('NewMessageReceived', ({ username, knownAs }) => {
      this.toastr.info(knownAs + ' has sent you a new message')
        .onTap
        .subscribe(() => this.router.navigateByUrl('/members/' + username + '?tab=messages'));
    });
  }

  stopHubConnection() {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      this.hubConnection.stop().catch(error => console.log(error));
    }
  }
}
