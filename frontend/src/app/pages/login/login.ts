import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private api = inject(ApiService);
  private router = inject(Router);

  loginData = { username: '', password: '' };
  loginError = '';
  isLoading = false;

  isPasswordVisible: boolean = false;
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  clearLoginError() {
    this.loginError = '';
  }

  onLogin() {
    if (this.isLoading) {
      return;
    }

    this.loginError = '';
    this.isLoading = true;

    this.api.login(this.loginData).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        this.router.navigate(['/home']);
      },
      error: () => {
        this.isLoading = false;
        this.loginError = 'Invalid username or password. Please try again.';
      }
    });
  }
}
