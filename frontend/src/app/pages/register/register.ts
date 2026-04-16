import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  private api = inject(ApiService);
  private router = inject(Router);

  regData = { username: '', email: '', password: '' };
  isPasswordVisible: boolean = false; 

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
  onRegister() {
    this.api.register(this.regData).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => alert('Registration failed')
    });
  }
}