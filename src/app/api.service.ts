import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment as env } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  url: string;

  constructor(
    private httpClient: HttpClient
  ) {
    this.url = env.base_url;
  }

  // Make http request to get new cards
  async newGame(roomId, deckConfig) {
    try {
      const url = `${this.url}/new-game/${roomId}`;

      return this.httpClient.get<any>(url, this.makeHeaders(deckConfig)).toPromise();

    } catch (err) {
      throw err;
    }
  }

  async nextRound(roomId, deckId) {
    try {
      const url = `${this.url}/next-round/${roomId}/${deckId}`;

      return this.httpClient.get<any>(url).toPromise();

    } catch (err) {
      throw err;
    }
  }

  makeHeaders(deckConfig) {
    return {
      headers: new HttpHeaders({
        'deck-config': JSON.stringify(deckConfig)
      })
    }
  }
}
