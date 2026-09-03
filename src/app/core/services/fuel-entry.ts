import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FuelEntry, FuelEntryRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class FuelEntryService {
  constructor(private http: HttpClient) {}

  private baseUrl(vehicleId: number): string {
    return `${environment.apiUrl}/vehicles/${vehicleId}/fuel`;
  }

  getAll(vehicleId: number): Observable<FuelEntry[]> {
    return this.http.get<FuelEntry[]>(this.baseUrl(vehicleId));
  }

  create(vehicleId: number, entry: FuelEntryRequest): Observable<FuelEntry> {
    return this.http.post<FuelEntry>(this.baseUrl(vehicleId), entry);
  }

  delete(vehicleId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl(vehicleId)}/${id}`);
  }
}
