import { Component, OnInit } from '@angular/core';
import io from 'socket.io-client';
import { Router } from '@angular/router';
import { AuxiliaryService } from '../auxiliary.service';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.scss']
})
export class JoinComponent implements OnInit {

  socket: any;
  roomId: string;
  joined: boolean;
  users: any;

  constructor(
    private router: Router,
    private auxiliaryService: AuxiliaryService
  ) {
    this.roomId = '';
    this.joined = false;
    this.users = null;
  }

  ngOnInit() {
  }

  async connectToRoom() {
    // Create socket connection with server
    this.socket = await this.auxiliaryService.setSocket();

    this.socket.on('connect', () => {
      console.log('Connected. ' + this.socket.id);

      // Join room
      this.socket.emit('join-room', this.roomId);

      // Joined room successfully
      this.socket.on('join-room-successful', data => {
        console.log("Successfully joined room ", data);
        this.joined = true;
        this.users = data.users;
        sessionStorage.setItem('roomId', data.roomId);
        sessionStorage.setItem('userId', data.userId);
        sessionStorage.setItem('admin', 'false');
      })

      // A user joined the room
      this.socket.on('user-joined', data => {
        console.log('User joined the room', data);
        this.users = data.users;
      })

      // On successfully leaving the room
      this.socket.on('leave-room-successful', data => {
        this.joined = false;
        this.roomId = '';
        this.users = data.users;
        console.log('Successfully left the room ' + this.roomId);
      })

      // On starting a new game
      this.socket.on('loading-round', roomId => {
        console.log('Loading round...');
        this.router.navigateByUrl('/game');
      })
    })
  }

  // Disconnect from room
  disconnectFromRoom() {
    console.log('Leaving room');
    this.socket.emit('leave-room', this.roomId);
  }
}
