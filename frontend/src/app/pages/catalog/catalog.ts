import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NavbarComponent } from '../../common/navbar/navbar';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css'
})
export class CatalogComponent implements OnInit {
  private api = inject(ApiService);

  movies = computed(() => {
    return [...this.api.movies()].sort((a, b) => a.title.localeCompare(b.title));
  });

  ngOnInit() {
    this.api.getMovies();
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/placeholder.jpg';
  }
}
