import { Component, OnInit, inject, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ApiService } from '../../services/api';
import { Movie } from '../../models/movie.model';
import { Review, Recommendation } from '../../models/movie.model';



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  public api = inject(ApiService);

  searchQuery = signal('');
  selectedGenre = signal('');
  availableGenres = signal<string[]>([]);
  reviews = this.api.reviews;
  recommendations = this.api.recommendations;
  watchlist = this.api.watchlist;

  filteredMovies = computed(() => {
    let movies = this.api.movies();

    const query = this.searchQuery().toLowerCase().trim();
    const genre = this.selectedGenre();

    if (query) {
      movies = movies.filter(movie =>
        movie.title.toLowerCase().includes(query) ||
        movie.description.toLowerCase().includes(query)
      );
    }

    if (genre) {
      movies = movies.filter(movie =>
        movie.genres.some(g => g.genre.name === genre)
      );
    }

    return movies;
  });

  popularMovies = computed(() => {
    return this.api.movies()
      .sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0))
      .slice(0, 6);
  });

  recommendedMovies = computed(() => {
    return this.api.movies().slice(0, 4);
  });

  latestReviews = computed(() => {
    return this.reviews().slice(0, 3);
  });

  watchlistMovies = computed(() => {
    return this.watchlist().slice(0, 3);
  });

  constructor() {
    effect(() => {
      this.extractGenres();
    });
  }

  ngOnInit() {
    this.api.getMovies();
    this.api.getUserReviews();
    this.api.getUserRecommendations();
    this.api.getUserWatchlist();
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  onSearchChange() {
    
  }

  filterByGenre(genre: string) {
    this.selectedGenre.set(genre);
  }

  private extractGenres() {
    const genres = new Set<string>();
    this.api.movies().forEach(movie => {
      movie.genres.forEach(g => genres.add(g.genre.name));
    });
    this.availableGenres.set(Array.from(genres).sort());
  }

  getMovieRating(movieId: number): number {
    const movie = this.api.movies().find(m => m.id === movieId);
    return movie?.rating_avg || 0;
  }

  getMovieTitle(movieId: number): string {
    const movie = this.api.movies().find(m => m.id === movieId);
    return movie?.title || 'Unknown Movie';
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/200x300/1a1a2e/888888?text=No+Image';
  }

  logout() {

    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }
}