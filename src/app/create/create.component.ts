import { Component, OnInit } from '@angular/core';
import io from 'socket.io-client';

import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { AuxiliaryService } from '../auxiliary.service';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {

  socket: any;
  roomId: number;
  loadingRoomId: boolean;
  users: any;
  roles: string[];
  rolesForm: FormGroup;
  rolesOptions: any;

  constructor(
    private auxiliaryService: AuxiliaryService,
    private router: Router
  ) {
    this.users = null;
    this.loadingRoomId = true;
    this.roles = ['cops', 'thieves', 'citizens', 'whores', 'deputies', 'kamikazes', 'learners'];
    this.rolesForm = new FormGroup({
      cops: new FormControl(1),
      thieves: new FormControl(1),
      citizens: new FormControl(1),
      whores: new FormControl(1),
      deputies: new FormControl(0),
      kamikazes: new FormControl(0),
      learners: new FormControl(0)
    })
    this.rolesOptions = {
      cops: [1, 2, 3, 4], /* 4 */
      thieves: [1, 2, 3, 4], /* 4 */
      citizens: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], /* 12 */
      whores: [1, 2, 3, 4], /* 4 */
      deputies: [0, 1, 2, 3, 4], /* 4 */
      kamikazes: [0, 1, 2, 3, 4], /* 4 */
      learners: [0, 1, 2, 3, 4] /* 4 */
    }
  }

  async ngOnInit() {
    // Create socket
    this.socket = await this.auxiliaryService.setSocket();

    // Create socket room
    this.socket.emit('create-room');

    // On socket room creation success
    this.socket.on('create-room-successful', data => {
      console.log(data);

      // Save room and user data to session storage
      this.saveRoom(data);

      this.loadingRoomId = false;
      this.roomId = data.roomId;
      this.users = data.users;
    })

    // New user joins room
    this.socket.on('user-joined', data => {
      console.log('User joined the room', data);
      this.users = data.users;
    })

    // User leaves room
    this.socket.on('user-left', data => {
      this.users = data.users;
      console.log('User left the room');
    })

    // On starting a new game
    this.socket.on('loading-round', roomId => {
      this.router.navigateByUrl('/game');
    })
  }

  saveRoom(data) {
    sessionStorage.setItem('roomId', data.roomId);
    sessionStorage.setItem('userId', data.userId);
    sessionStorage.setItem('admin', 'true');
  }

  startGame() {
    console.log(this.rolesForm.value);

    // Save deck config to have access to it through entire application
    this.auxiliaryService.setDeckConfig(this.rolesForm.value);

    // Save deck config to session storage
    sessionStorage.setItem('deckConfig', JSON.stringify(this.rolesForm.value));

    // Send message to server. Server informs to all users a new game is starting
    this.socket.emit('next-round', this.roomId);
  }
}
