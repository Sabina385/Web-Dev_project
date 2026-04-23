import { Component, OnInit, inject, computed, signal, effect, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ApiService } from '../../services/api';
import { Movie } from '../../models/movie.model';
import { Review, Recommendation, Rating } from '../../models/movie.model';



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
  @ViewChild('genreResultsSection') genreResultsSection?: ElementRef<HTMLElement>;
  @ViewChild('selectedMovieSection') selectedMovieSection?: ElementRef<HTMLElement>;
  @ViewChild('popularScrollContainer') popularScrollContainer?: ElementRef<HTMLDivElement>;

  selectedGenre = signal('');
  searchQuery = signal('');
  selectedMovie = signal<Movie | null>(null);
  selectedMovieReviews = signal<Review[]>([]);
  reviewInput = signal('');
  reviewMessage = signal('');
  ratingInput = signal('' );
  ratingMessage = signal('');
  watchlistMessage = signal('');
  isEditingWatchlist = signal(false);
  availableGenres = signal<string[]>([]);
  reviews = this.api.reviews;
  recommendations = this.api.recommendations;
  watchlist = this.api.watchlist;
  ratings = this.api.ratings;
 

  filteredMovies = computed(() => {
    let movies = this.api.movies();

    const query = this.searchQuery().toLowerCase().trim();
    const genre = this.selectedGenre();

    if (query) {
      movies = movies.filter(movie =>
        movie.title.toLowerCase().includes(query)
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
    return [...this.api.movies()]
      .sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));
  });

  latestReviews = computed(() => {
    return this.reviews().slice(0, 3);
  });

  watchlistMovies = computed(() => {
    return this.watchlist();
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

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  clearSearch() {
    this.searchQuery.set('');
  }

  logout() {
    localStorage.removeItem('token');
    this.api.currentUserToken.set(null);
    this.router.navigate(['/']);
  }

  filterByGenre(genre: string) {
    this.selectedGenre.set(this.selectedGenre() === genre ? '' : genre);
    setTimeout(() => {
      this.genreResultsSection?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  }

  clearGenreFilter() {
    this.selectedGenre.set('');
  }

  selectMovie(movie: Movie) {
    this.selectedMovie.set(movie);
    this.loadMovieReviews(movie.id);
    this.reviewInput.set('');
    this.reviewMessage.set('');
    const existingRating = this.getUserRatingForMovie(movie.id);
    this.ratingInput.set(existingRating ? String(existingRating.value) : '');
    this.ratingMessage.set('');
    this.watchlistMessage.set('');
    setTimeout(() => {
      this.selectedMovieSection?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  }

  scrollPopularMovies() {
    this.popularScrollContainer?.nativeElement.scrollBy({
      left: 700,
      behavior: 'smooth'
    });
  }

  selectedMovieGenres() {
    return this.selectedMovie()?.genres.map(g => g.genre.name).join(', ') || 'No genres';
  }

  selectedMovieAverageRating() {
    return this.selectedMovie()?.rating_avg || 0;
  }

  getUserRatingForMovie(movieId: number) {
    return this.ratings().find(rating => {
      const ratingMovieId = typeof rating.movie === 'number' ? rating.movie : rating.movie.id;
      return ratingMovieId === movieId;
    }) || null;
  }

  isInWatchlist(movieId: number) {
    return this.watchlist().some(movie => movie.id === movieId);
  }

  toggleWatchlistEditing() {
    this.isEditingWatchlist.update(value => !value);
  }

  onRatingInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.ratingInput.set(input.value);
  }

  watchSelectedMovie() {
    const imageUrl = this.selectedMovie()?.images[0]?.image_url;
    if (imageUrl) {
      globalThis.open(imageUrl, '_blank');
    }
  }

  addSelectedToWatchlist() {
    const movie = this.selectedMovie();
    if (!movie) {
      return;
    }

    if (this.isInWatchlist(movie.id)) {
      this.watchlistMessage.set('Already in watchlist');
      return;
    }

    this.api.addToWatchlist(movie.id).subscribe({
      next: (res) => {
        this.watchlistMessage.set(res.message || 'Added to watchlist');
        if (res.movie && !this.isInWatchlist(res.movie.id)) {
          this.api.watchlist.set([res.movie, ...this.watchlist()]);
        }
      },
      error: (error: HttpErrorResponse) => {
        const serverMessage =
          error.error?.message ||
          error.error?.detail ||
          error.error?.error;

        this.watchlistMessage.set(serverMessage || 'Could not add movie to watchlist');
      }
    });
  }

  saveSelectedMovieRating() {
    const movie = this.selectedMovie();
    if (!movie) {
      return;
    }

    const parsedValue = Number(this.ratingInput());
    const hasOneDecimal = Math.round(parsedValue * 10) === parsedValue * 10;

    if (Number.isNaN(parsedValue) || parsedValue < 1 || parsedValue > 10 || !hasOneDecimal) {
      this.ratingMessage.set('Enter a rating from 1 to 10, for example 5.5');
      return;
    }

    this.api.saveRating(movie.id, parsedValue).subscribe({
      next: (res) => {
        const existingRating = this.getUserRatingForMovie(movie.id);
        const updatedRating: Rating = existingRating
          ? { ...existingRating, value: parsedValue }
          : { id: 0, movie: movie.id, value: parsedValue, user: 0 };

        if (existingRating) {
          this.api.ratings.set(
            this.ratings().map(rating => {
              const ratingMovieId = typeof rating.movie === 'number' ? rating.movie : rating.movie.id;
              return ratingMovieId === movie.id ? updatedRating : rating;
            })
          );
        } else {
          this.api.ratings.set([updatedRating, ...this.ratings()]);
        }

        this.api.getMovies();
        setTimeout(() => {
          const refreshedMovie = this.api.movies().find(item => item.id === movie.id);
          if (refreshedMovie) {
            this.selectedMovie.set(refreshedMovie);
          }
        }, 250);
        this.ratingMessage.set(res.message || 'Rating saved');
      },
      error: (error: HttpErrorResponse) => {
        const serverMessage =
          error.error?.message ||
          error.error?.detail ||
          error.error?.error;

        this.ratingMessage.set(serverMessage || 'Could not save rating');
      }
    });
  }

  onReviewInput(event: Event) {
    const input = event.target as HTMLTextAreaElement;
    this.reviewInput.set(input.value);
  }

  submitSelectedMovieReview() {
    const movie = this.selectedMovie();
    const text = this.reviewInput().trim();

    if (!movie) {
      return;
    }

    if (!text) {
      this.reviewMessage.set('Write a comment first');
      return;
    }

    this.api.createReview(movie.id, text).subscribe({
      next: (review) => {
        this.selectedMovieReviews.set([review, ...this.selectedMovieReviews()]);
        this.reviewInput.set('');
        this.reviewMessage.set('Review added');
      },
      error: (error: HttpErrorResponse) => {
        const serverMessage =
          error.error?.message ||
          error.error?.detail ||
          error.error?.error;

        this.reviewMessage.set(serverMessage || 'Could not add review');
      }
    });
  }

  removeFromWatchlist(movie: Movie, event?: Event) {
    event?.stopPropagation();

    this.api.removeFromWatchlist(movie.id).subscribe({
      next: (res) => {
        this.api.watchlist.set(this.watchlist().filter(item => item.id !== movie.id));
        this.watchlistMessage.set(res.message || 'Removed from watchlist');

        if (this.selectedMovie()?.id === movie.id) {
          this.selectedMovie.set(null);
        }
      },
      error: (error: HttpErrorResponse) => {
        const serverMessage =
          error.error?.message ||
          error.error?.detail ||
          error.error?.error;

        this.watchlistMessage.set(serverMessage || 'Could not remove movie from watchlist');
      }
    });
  }

  loadMovieReviews(movieId: number) {
    this.selectedMovieReviews.set([]);
    this.api.getMovieReviews(movieId).subscribe({
      next: (reviews) => {
        this.selectedMovieReviews.set(reviews);
      },
      error: () => {
        this.selectedMovieReviews.set([]);
      }
    });
  }

  getReviewAuthor(review: Review) {
    return review.user?.username || review.user?.name || 'User';
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

  
}
