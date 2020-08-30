import { Injectable } from '@angular/core';

import io from 'socket.io-client';
import { environment as env } from '../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class AuxiliaryService {

  socket: any;
  deckConfig: any;

  constructor() {
    this.socket = null;
    this.deckConfig = JSON.parse(sessionStorage.getItem('deckConfig')) || {};
  }

  // Set the deck configuration (roles)
  setDeckConfig(roles) {
    return this.deckConfig = roles;
  }

  // Get the deck configuration (roles)
  getDeckConfig() {
    return this.deckConfig;
  }

  async setSocket() {
    return this.socket = await io.connect(env.base_url);
  }

  getSocket() {
    return this.socket;
  }

  getRoleName(code) {
    // Switch through the first letter of the card code ('K', 'A', 'Q', 'J', '5')
    switch (code[0]) {
      case 'K':
        return 'Poli';
      case 'A':
        return 'Caco';
      case 'Q':
        return 'Alguacil';
      case 'J':
        return 'Prostituta';
      case '0':
        return 'Suicida';
      case '2':
        return 'Imitador';
      default:
        return 'Ciudadano';
    }
  }
}
