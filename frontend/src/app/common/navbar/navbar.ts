import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: 'navbar.css'
})
export class NavbarComponent {

  private api = inject(ApiService);
  private router = inject(Router);

  searchQuery = this.api.searchQuery; 

  filteredMovies = computed(() => {
    let movies = this.api.movies();

    const query = this.searchQuery().toLowerCase().trim();

    if (query) {
      movies = movies.filter(movie =>
        movie.title.toLowerCase().includes(query) ||
        movie.description.toLowerCase().includes(query)
      );
    }

    return movies;
  });
  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}