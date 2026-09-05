import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { VehicleService } from '../../../core/services/vehicle';
import { AuthService } from '../../../core/services/auth';
import { Vehicle, VehicleRequest } from '../../../core/models/models';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './vehicle-list.html',
  styleUrl: './vehicle-list.scss',
})
export class VehicleList implements OnInit {
  readonly vehicles = signal<Vehicle[]>([]);
  readonly showForm = signal(false);

  newVehicle: VehicleRequest = { naam: '', merk: '', type: '', bouwjaar: undefined, aankoopdatum: undefined };

  constructor(
    private vehicleService: VehicleService,
    readonly authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.vehicleService.getAll().subscribe((vehicles) => this.vehicles.set(vehicles));
  }

  addVehicle(): void {
    this.vehicleService.create(this.newVehicle).subscribe(() => {
      this.newVehicle = { naam: '', merk: '', type: '', bouwjaar: undefined, aankoopdatum: undefined };
      this.showForm.set(false);
      this.load();
    });
  }

  deleteVehicle(id: number): void {
    if (!confirm('Weet je zeker dat je dit voertuig wilt verwijderen? Alle tankbeurten en onderhoud gaan ook mee.')) return;
    this.vehicleService.delete(id).subscribe(() => this.load());
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
