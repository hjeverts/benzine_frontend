import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuthResponse {
  token: string;
  email: string;
  name: string;
  avatarDataUrl?: string;
  isAdmin: boolean;
}

export interface CurrentUser {
  email: string;
  name: string;
  avatarDataUrl?: string;
  isAdmin: boolean;
}

export interface ProfileResponse extends CurrentUser {}

const TOKEN_KEY = 'vehictory_token';
const USER_KEY = 'vehictory_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Signal zodat components reactief kunnen tonen of iemand ingelogd is.
  readonly currentUser = signal<CurrentUser | null>(this.loadStoredUser());

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

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${environment.apiUrl}/auth/profile`);
  }

  updateProfile(email: string, name: string): Observable<AuthResponse> {
    return this.http
      .put<AuthResponse>(`${environment.apiUrl}/auth/profile`, { email, name })
      .pipe(tap((res) => this.storeSession(res)));
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/auth/profile/password`, { currentPassword, newPassword });
  }

  requestPasswordReset(email: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/password-reset`, { email });
  }

  resetPassword(email: string, token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/password-reset/confirm`, {
      email,
      token,
      newPassword,
    });
  }

  updateAvatar(file: File): Observable<ProfileResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put<ProfileResponse>(`${environment.apiUrl}/auth/profile/avatar`, formData).pipe(
      tap((profile) => this.updateCurrentUser(profile)),
    );
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
    const user = {
      email: res.email,
      name: res.name,
      avatarDataUrl: res.avatarDataUrl,
      isAdmin: res.isAdmin,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  private updateCurrentUser(profile: ProfileResponse): void {
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
    this.currentUser.set(profile);
  }

  private loadStoredUser(): CurrentUser | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
