import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  name = '';
  email = '';
  password = '';
  readonly error = signal<string | null>(null);
  readonly loading = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  submit(): void {
    this.error.set(null);
    this.loading.set(true);

    this.authService.register(this.email, this.password, this.name).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/vehicles']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err.status === 409
            ? 'Er bestaat al een account met dit e-mailadres.'
            : 'Registreren mislukt. Probeer het opnieuw.',
        );
      },
    });
  }
}
