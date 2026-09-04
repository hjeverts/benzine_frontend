import { Component, OnInit, computed, signal } from '@angular/core';
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
  VehicleShare,
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
  // Verbruik (L/100km) per tankbeurt: liters van de huidige beurt gedeeld door de
  // afstand sinds de vorige tankbeurt (op km-stand gesorteerd). De eerste
  // tankbeurt (of een vergeten km-stand) heeft geen vorige beurt om mee te
  // vergelijken en krijgt dus geen verbruik.
  readonly fuelEntriesWithVerbruik = computed(() => {
    const entries = this.fuelEntries();
    const byOdometer = [...entries].sort((a, b) => a.odometer - b.odometer);
    const verbruikPerId = new Map<number, number | null>();
    for (let i = 0; i < byOdometer.length; i++) {
      if (i === 0) {
        verbruikPerId.set(byOdometer[i].id, null);
        continue;
      }
      const afstand = byOdometer[i].odometer - byOdometer[i - 1].odometer;
      verbruikPerId.set(byOdometer[i].id, afstand > 0 ? (byOdometer[i].volume / afstand) * 100 : null);
    }
    return entries.map((entry) => ({ ...entry, verbruikL100km: verbruikPerId.get(entry.id) ?? null }));
  });
  readonly maintenanceEntries = signal<MaintenanceEntry[]>([]);
  readonly maintenanceTypes = signal<MaintenanceType[]>([]);
  readonly shares = signal<VehicleShare[]>([]);
  readonly shareError = signal<string | null>(null);
  newShareEmail = '';

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
    this.vehicleService.getById(this.vehicleId).subscribe((v) => {
      this.vehicle.set(v);
      if (v.isOwner) {
        this.vehicleService.getShares(this.vehicleId).subscribe((shares) => this.shares.set(shares));
      }
    });
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

  addShare(): void {
    if (!this.newShareEmail.trim()) return;
    this.shareError.set(null);
    this.vehicleService.addShare(this.vehicleId, this.newShareEmail.trim()).subscribe({
      next: (share) => {
        this.shares.update((shares) => [...shares, share]);
        this.newShareEmail = '';
      },
      error: (err) => {
        this.shareError.set(err?.error ?? 'Kon dit voertuig niet delen. Controleer het e-mailadres.');
      },
    });
  }

  removeShare(userId: string): void {
    this.vehicleService.removeShare(this.vehicleId, userId).subscribe(() => {
      this.shares.update((shares) => shares.filter((s) => s.userId !== userId));
    });
  }
}
