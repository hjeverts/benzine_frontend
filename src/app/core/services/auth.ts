import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuthResponse {
  token: string;
  email: string;
  name: string;
}

const TOKEN_KEY = 'benzine_token';
const USER_KEY = 'benzine_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Signal zodat components reactief kunnen tonen of iemand ingelogd is.
  readonly currentUser = signal<{ email: string; name: string } | null>(this.loadStoredUser());

  constructor(private http: HttpClient) {}

  register(email: string, password: string, name: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, { email, password, name })
      .pipe(tap((res) => this.storeSession(res)));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(tap((res) => this.storeSession(res)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private storeSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify({ email: res.email, name: res.name }));
    this.currentUser.set({ email: res.email, name: res.name });
  }

  private loadStoredUser(): { email: string; name: string } | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
