import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminUser, AdminUserUpdate } from '../../../core/models/models';
import { AdminUserService } from '../../../core/services/admin-user';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss',
})
export class UserManagement implements OnInit {
  readonly users = signal<AdminUser[]>([]);
  readonly error = signal<string | null>(null);
  readonly editingId = signal<string | null>(null);
  readonly saving = signal(false);
  editUser: AdminUserUpdate = { email: '', name: '', isAdmin: false };

  constructor(
    private adminUserService: AdminUserService,
    readonly authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (!this.authService.currentUser()?.isAdmin) {
      this.router.navigate(['/vehicles']);
      return;
    }
    this.load();
  }

  load(): void {
    this.error.set(null);
    this.adminUserService.getAll().subscribe({
      next: (users) => this.users.set(users),
      error: () => this.error.set('Gebruikers konden niet worden geladen.'),
    });
  }

  startEdit(user: AdminUser): void {
    this.editingId.set(user.id);
    this.editUser = { email: user.email, name: user.name, isAdmin: user.isAdmin };
  }

  save(user: AdminUser): void {
    this.saving.set(true);
    this.error.set(null);
    this.adminUserService.update(user.id, this.editUser).subscribe({
      next: () => {
        this.saving.set(false);
        this.editingId.set(null);
        this.load();
      },
      error: (response) => {
        this.saving.set(false);
        this.error.set(response.error || 'Gebruiker kon niet worden opgeslagen.');
      },
    });
  }

  delete(user: AdminUser): void {
    if (!confirm(`Weet je zeker dat je ${user.name} wilt verwijderen?`)) return;

    this.error.set(null);
    this.adminUserService.delete(user.id).subscribe({
      next: () => this.load(),
      error: (response) => this.error.set(response.error || 'Gebruiker kon niet worden verwijderd.'),
    });
  }
}
