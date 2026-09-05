import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './password-reset.html',
  styleUrl: './password-reset.scss',
})
export class PasswordReset {
  email = '';
  readonly submitted = signal(false);
  readonly error = signal<string | null>(null);
  readonly loading = signal(false);

  constructor(private authService: AuthService) {}

  submit(): void {
    this.error.set(null);
    this.loading.set(true);

    this.authService.requestPasswordReset(this.email).subscribe({
      next: () => {
        this.loading.set(false);
        this.submitted.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Het versturen van de resetlink is niet gelukt. Probeer het later opnieuw.');
      },
    });
  }
}
