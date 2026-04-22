import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movie, Review, Recommendation, Rating } from '../models/movie.model';

export interface WatchlistResponse {
  message: string;
  movie: Movie;
}

export interface RemoveWatchlistResponse {
  message: string;
}

export interface ProfileResponse {
  username: string;
  reviews: Array<Review & { movie: Movie }>;
  ratings: Array<Rating & { movie: Movie }>;
  watchlist: Movie[];
  recommendations: { movie: Movie; to_user: string }[];
}

export interface RatingResponse {
  message: string;
}

export interface ReviewResponse extends Review {}

export interface RecommendationsResponse {
  sent: Recommendation[];
  received: Recommendation[];
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://127.0.0.1:8000/api/';

  movies = signal<Movie[]>([]);
  reviews = signal<Review[]>([]);
  ratings = signal<Rating[]>([]);
  recommendations = signal<Recommendation[]>([]);
  watchlist = signal<Movie[]>([]);
  currentUserToken = signal<string | null>(localStorage.getItem('token'));
  searchQuery = signal<string>('');

  getMovies() {
    this.http.get<{ results: Movie[] }>(`${this.baseUrl}movies/`).subscribe({
      next: (res) => this.movies.set(res.results),
      error: (err) => console.error('Ошибка при загрузке фильмов:', err)
    });
  }

  getUserReviews() {
    this.http.get<ProfileResponse>(`${this.baseUrl}profile/`).subscribe({
      next: (res) => {
        this.reviews.set(res.reviews);
        this.ratings.set(res.ratings);
      },
      error: (err) => console.error('Ошибка при загрузке отзывов:', err)
    });
  }

  getUserRecommendations() {
    this.http.get<RecommendationsResponse>(`${this.baseUrl}recommendations/`).subscribe({
      next: (res) => this.recommendations.set([...res.sent, ...res.received]),
      error: (err) => console.error('Ошибка при загрузке рекомендаций:', err)
    });
  }

  getMovieReviews(movieId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}reviews/${movieId}/`);
  }

  getUserWatchlist() {
    this.http.get<Movie[]>(`${this.baseUrl}watchlist/`).subscribe({
      next: (res) => this.watchlist.set(res),
      error: (err) => console.error('Ошибка при загрузке списка просмотра:', err)
    });
  }

  addToWatchlist(movieId: number): Observable<WatchlistResponse> {
    return this.http.post<WatchlistResponse>(`${this.baseUrl}watchlist/`, { movie: movieId });
  }

  removeFromWatchlist(movieId: number): Observable<RemoveWatchlistResponse> {
    return this.http.delete<RemoveWatchlistResponse>(`${this.baseUrl}watchlist/`, {
      body: { movie: movieId }
    });
  }

  saveRating(movieId: number, value: number): Observable<RatingResponse> {
    return this.http.post<RatingResponse>(`${this.baseUrl}ratings/`, {
      movie: movieId,
      value
    });
  }

  createReview(movieId: number, text: string): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(`${this.baseUrl}reviews/create/`, {
      movie: movieId,
      text
    });
  }

  getRecommendations(): Observable<RecommendationsResponse> {
    return this.http.get<RecommendationsResponse>(`${this.baseUrl}recommendations/`);
  }

  sendRecommendation(data: any): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}recommendations/send/`, data);
  }

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.baseUrl}profile/`);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}login/`, credentials);
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}register/`, userData);
  }
}
