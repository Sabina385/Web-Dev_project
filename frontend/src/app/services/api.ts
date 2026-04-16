import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Movie } from '../models/movie.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://127.0.0.1:8000/api/';

  movies = signal<Movie[]>([]);
  currentUserToken = signal<string | null>(localStorage.getItem('token'));

  
  getMovies() {
    this.http.get<{results: Movie[]}>(`${this.baseUrl}movies/`).subscribe({
      next: (res) => this.movies.set(res.results),
      error: (err) => console.error('Ошибка при загрузке фильмов:', err)
    });
  }


  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}login/`, credentials);
  }
}