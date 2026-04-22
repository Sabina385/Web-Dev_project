import { Component, inject } from '@angular/core';
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

  clearSearch() {
    this.searchQuery.set('');
  }

  logout() {
    localStorage.removeItem('token');
    this.api.currentUserToken.set(null);
    this.router.navigate(['/']);
  }
}
