import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class LandingComponent {
  @ViewChild('genresSection') genresSection?: ElementRef<HTMLElement>;
  @ViewChild('aboutSection') aboutSection?: ElementRef<HTMLElement>;

  scrollToGenres(event: Event) {
    event.preventDefault();
    this.genresSection?.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  scrollToAbout(event: Event) {
    event.preventDefault();
    this.aboutSection?.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}
