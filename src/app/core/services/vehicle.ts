import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Vehicle, VehicleRequest, VehicleStats } from '../models/models';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private readonly baseUrl = `${environment.apiUrl}/vehicles`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(this.baseUrl);
  }

  getById(id: number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.baseUrl}/${id}`);
  }

  create(vehicle: VehicleRequest): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.baseUrl, vehicle);
  }

  update(id: number, vehicle: VehicleRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, vehicle);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getStats(id: number): Observable<VehicleStats> {
    return this.http.get<VehicleStats>(`${this.baseUrl}/${id}/stats`);
  }
}
