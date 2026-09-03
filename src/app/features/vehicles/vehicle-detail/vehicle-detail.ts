import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { VehicleService } from '../../../core/services/vehicle';
import { FuelEntryService } from '../../../core/services/fuel-entry';
import { MaintenanceService } from '../../../core/services/maintenance';
import {
  FuelEntry,
  FuelEntryRequest,
  MaintenanceEntry,
  MaintenanceEntryRequest,
  MaintenanceType,
  Vehicle,
  VehicleStats,
} from '../../../core/models/models';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './vehicle-detail.html',
  styleUrl: './vehicle-detail.scss',
})
export class VehicleDetail implements OnInit {
  vehicleId!: number;
  readonly vehicle = signal<Vehicle | null>(null);
  readonly stats = signal<VehicleStats | null>(null);
  readonly fuelEntries = signal<FuelEntry[]>([]);
  readonly maintenanceEntries = signal<MaintenanceEntry[]>([]);
  readonly maintenanceTypes = signal<MaintenanceType[]>([]);

  newFuelEntry: FuelEntryRequest = {
    datum: new Date().toISOString().slice(0, 10),
    odometer: 0,
    brandstofType: '',
    volume: 0,
    bedrag: 0,
    tankstation: '',
    vergeten: false,
  };

  newMaintenanceEntry: MaintenanceEntryRequest = {
    datum: new Date().toISOString().slice(0, 10),
    odometer: 0,
    maintenanceTypeId: 0,
    notitie: '',
  };

  constructor(
    private route: ActivatedRoute,
    private vehicleService: VehicleService,
    private fuelEntryService: FuelEntryService,
    private maintenanceService: MaintenanceService,
  ) {}

  ngOnInit(): void {
    this.vehicleId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
    this.maintenanceService.getTypes().subscribe((types) => this.maintenanceTypes.set(types));
  }

  load(): void {
    this.vehicleService.getById(this.vehicleId).subscribe((v) => this.vehicle.set(v));
    this.vehicleService.getStats(this.vehicleId).subscribe((s) => this.stats.set(s));
    this.fuelEntryService.getAll(this.vehicleId).subscribe((entries) => this.fuelEntries.set(entries));
    this.maintenanceService.getAll(this.vehicleId).subscribe((entries) => this.maintenanceEntries.set(entries));
  }

  addFuelEntry(): void {
    this.fuelEntryService.create(this.vehicleId, this.newFuelEntry).subscribe(() => {
      this.newFuelEntry = {
        datum: new Date().toISOString().slice(0, 10),
        odometer: 0,
        brandstofType: '',
        volume: 0,
        bedrag: 0,
        tankstation: '',
        vergeten: false,
      };
      this.load();
    });
  }

  deleteFuelEntry(id: number): void {
    this.fuelEntryService.delete(this.vehicleId, id).subscribe(() => this.load());
  }

  addMaintenanceEntry(): void {
    if (!this.newMaintenanceEntry.maintenanceTypeId) return;
    this.maintenanceService.create(this.vehicleId, this.newMaintenanceEntry).subscribe(() => {
      this.newMaintenanceEntry = {
        datum: new Date().toISOString().slice(0, 10),
        odometer: 0,
        maintenanceTypeId: 0,
        notitie: '',
      };
      this.load();
    });
  }

  deleteMaintenanceEntry(id: number): void {
    this.maintenanceService.delete(this.vehicleId, id).subscribe(() => this.load());
  }
}
