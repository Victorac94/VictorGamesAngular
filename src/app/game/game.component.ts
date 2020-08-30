import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';

import { ApiService } from '../api.service';
import { AuxiliaryService } from '../auxiliary.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  socket: any;
  admin: boolean;
  roomId: string;
  deckId: string;
  card: any;
  users: any;
  loadingRound: boolean;
  nextRoundNewDeck: boolean;
  deckConfig: any;
  shouldShowRolesForm: boolean;
  roles: string[];
  rolesForm: FormGroup;
  rolesOptions: any;
  roleName: string;

  constructor(
    private apiService: ApiService,
    private auxiliaryService: AuxiliaryService,
    private router: Router
  ) {
    this.admin = false;
    this.roomId = '';
    this.deckId = '';
    this.card = null;
    this.users = null;
    this.loadingRound = true;
    this.nextRoundNewDeck = false;
    this.deckConfig = this.auxiliaryService.getDeckConfig();
    this.shouldShowRolesForm = false;
    this.roles = ['cops', 'thieves', 'citizens', 'whores', 'deputies', 'kamikazes', 'learners'];
    this.roleName = '';
    this.rolesForm = new FormGroup({
      cops: new FormControl(this.deckConfig['cops']),
      thieves: new FormControl(this.deckConfig['thieves']),
      citizens: new FormControl(this.deckConfig['citizens']),
      whores: new FormControl(this.deckConfig['whores']),
      deputies: new FormControl(this.deckConfig['deputies']),
      kamikazes: new FormControl(this.deckConfig['kamikazes']),
      learners: new FormControl(this.deckConfig['learners'])
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
    try {
      this.admin = sessionStorage.getItem('admin') === 'true';
      this.roomId = sessionStorage.getItem('roomId');

      // If we dont have a predefined (saved) roomID, redirect to home page
      if (!this.roomId) this.router.navigateByUrl('/');

      // Create socket connection with server
      this.socket = this.auxiliaryService.getSocket();

      // If socket does not exist (eg: user refreshed the page or loaded this component directly)
      if (!this.socket) {
        // Create socket connection with server
        this.socket = await this.auxiliaryService.setSocket();

        // Join room
        this.socket.emit('join-room', this.roomId);
      }

      // Listen to when new card is dealt to user
      this.socket.on('new-card', data => {
        console.log(data.card);

        // If we did not receive any card info, redirect to home page
        if (!data.card) {
          // alert('No has recibido carta. Vuelve a conectarte.');
          this.router.navigateByUrl('/');
        }

        this.card = data.card;
        this.roleName = this.auxiliaryService.getRoleName(data.card.code);
        this.users = data.users;
        this.deckId = data.deckId;
        this.loadingRound = false;

        console.log(this.roleName);
      });

      // New user joins room
      this.socket.on('user-joined', data => {
        console.log('User joined the room', data);
        this.users = data.users;
        this.nextRoundNewDeck = true;
      })

      // Joined room successfully
      this.socket.on('join-room-successful', data => {
        console.log("Successfully joined room ", data);
        this.users = data.users;
        if (this.users.length === 1) this.router.navigateByUrl('/');
        sessionStorage.setItem('userId', data.userId);
      })

      // On successfully leaving the room
      this.socket.on('leave-room-successful', data => {
        console.log('Successfully left the room ' + this.roomId);
        this.router.navigateByUrl('/');
      });

      // If a user leaves the room
      this.socket.on('user-left', data => {
        console.log(`User left the room ${data.roomId}`);
        this.users = data.users;
      })

      // On loading new round
      this.socket.on('loading-round', roomId => {
        console.log('Loading round...');
        this.loadingRound = true;
        this.roleName = '';
      })

      // Start new game (only admin makes the request)
      if (this.admin) {
        const response = await this.apiService.newGame(this.roomId, this.auxiliaryService.getDeckConfig());

        console.log(response); // Shows 'Cards sent' (received)
      }
    } catch (err) {
      this.router.navigateByUrl('/');
      alert(err);
    }
  }

  disconnectFromRoom() {
    console.log('Leaving room');
    this.socket.emit('leave-room', this.roomId);
  }

  async nextRound() {
    let response;
    this.socket.emit('next-round', this.roomId);
    this.auxiliaryService.setDeckConfig(this.rolesForm.value);

    console.log('Loading next round...');

    // When a user has joined the room while a round is being played (picks a new deck of cards)
    if (this.nextRoundNewDeck) {
      response = await this.apiService.newGame(this.roomId, this.rolesForm.value);
      this.nextRoundNewDeck = false;

      // Normal next round
    } else {
      response = await this.apiService.nextRound(this.roomId, this.deckId);
    }

    console.log(response);
  }

  toggleRolesForm() {
    this.shouldShowRolesForm = !this.shouldShowRolesForm;
  }
}
