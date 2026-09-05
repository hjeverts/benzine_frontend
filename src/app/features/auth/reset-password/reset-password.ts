import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword implements OnInit {
  password = '';
  passwordConfirmation = '';
  email = '';
  token = '';
  readonly error = signal<string | null>(null);
  readonly loading = signal(false);

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.email || !this.token)
      this.error.set('Deze resetlink is ongeldig of onvolledig.');
  }

  submit(): void {
    if (this.password !== this.passwordConfirmation) {
      this.error.set('De wachtwoorden komen niet overeen.');
      return;
    }

    this.error.set(null);
    this.loading.set(true);
    this.authService.resetPassword(this.email, this.token, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/login'], { queryParams: { passwordReset: 'true' } });
      },
      error: (response) => {
        this.loading.set(false);
        this.error.set(response.error || 'Deze resetlink is ongeldig of verlopen.');
      },
    });
  }
}
