import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('song', { static: false }) song: ElementRef;

  shouldShow: boolean;

  constructor(
    private router: Router
  ) {
    this.shouldShow = true;
  }

  ngOnInit() {
    this.router.events.subscribe(value => {
      if (value instanceof NavigationStart && value.url === '/game') {
        // Pause audio and hide audio icon
        this.song.nativeElement.pause();
        this.shouldShow = false;

      }
    })
  }

  togglePlayStopSong() {
    if (this.song.nativeElement.paused) {
      this.song.nativeElement.play();
    } else {
      this.song.nativeElement.pause();
    }
  }

}
