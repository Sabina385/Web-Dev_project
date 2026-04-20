import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Movie, Review, Recommendation, Watchlist } from '../models/movie.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://127.0.0.1:8000/api/';

  movies = signal<Movie[]>([]);
  reviews = signal<Review[]>([]);
  recommendations = signal<Recommendation[]>([]);
  watchlist = signal<Movie[]>([]);
  currentUserToken = signal<string | null>(localStorage.getItem('token'));

  
  getMovies() {
    this.http.get<{results: Movie[]}>(`${this.baseUrl}movies/`).subscribe({
      next: (res) => this.movies.set(res.results),
      error: (err) => console.error('Ошибка при загрузке фильмов:', err)
    });
  }

  getUserReviews() {
    this.http.get<{reviews: Review[]}>(`${this.baseUrl}profile/`).subscribe({
      next: (res) => this.reviews.set(res.reviews),
      error: (err) => console.error('Ошибка при загрузке отзывов:', err)
    });
  }

  getUserRecommendations() {
    this.http.get<Recommendation[]>(`${this.baseUrl}recommendations/`).subscribe({
      next: (res) => this.recommendations.set(res),
      error: (err) => console.error('Ошибка при загрузке рекомендаций:', err)
    });
  }

  getUserWatchlist() {
    this.http.get<Movie[]>(`${this.baseUrl}watchlist/`).subscribe({
      next: (res) => this.watchlist.set(res),
      error: (err) => console.error('Ошибка при загрузке списка просмотра:', err)
    });
  }

  getProfile() {
    return this.http.get(this.baseUrl + 'profile/');
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}login/`, credentials);
  }
  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}register/`, userData);
  }
}