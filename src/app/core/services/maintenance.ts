import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MaintenanceEntry, MaintenanceEntryRequest, MaintenanceType } from '../models/models';

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  constructor(private http: HttpClient) {}

  private baseUrl(vehicleId: number): string {
    return `${environment.apiUrl}/vehicles/${vehicleId}/maintenance`;
  }

  getAll(vehicleId: number): Observable<MaintenanceEntry[]> {
    return this.http.get<MaintenanceEntry[]>(this.baseUrl(vehicleId));
  }

  create(vehicleId: number, entry: MaintenanceEntryRequest): Observable<MaintenanceEntry> {
    return this.http.post<MaintenanceEntry>(this.baseUrl(vehicleId), entry);
  }

  delete(vehicleId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl(vehicleId)}/${id}`);
  }

  getTypes(): Observable<MaintenanceType[]> {
    return this.http.get<MaintenanceType[]>(`${environment.apiUrl}/maintenance-types`);
  }

  createType(naam: string): Observable<MaintenanceType> {
    return this.http.post<MaintenanceType>(`${environment.apiUrl}/maintenance-types`, { naam });
  }
}
