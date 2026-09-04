import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
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

type FuelEntryWithVerbruik = FuelEntry & {
  afstandKm: number | null;
  verbruikL100km: number | null;
};

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BaseChartDirective],
  templateUrl: './vehicle-detail.html',
  styleUrl: './vehicle-detail.scss',
})
export class VehicleDetail implements OnInit {
  vehicleId!: number;
  readonly fuelTypes = [
    'Benzine E10 (Euro 95)',
    'Benzine E5 (Euro 95)',
    'Super Plus 98 (E5)',
    'Diesel B7',
    'Diesel B10',
    'LPG',
    'CNG',
    'HVO100',
    'Elektrisch',
  ];
  readonly vehicle = signal<Vehicle | null>(null);
  readonly stats = signal<VehicleStats | null>(null);
  readonly fuelEntries = signal<FuelEntry[]>([]);
  readonly fuelEntriesWithVerbruik = computed<FuelEntryWithVerbruik[]>(() => {
    const entries = this.fuelEntries();
    const byOdometer = [...entries].sort((a, b) => a.odometer - b.odometer);
    const valuesPerId = new Map<number, Pick<FuelEntryWithVerbruik, 'afstandKm' | 'verbruikL100km'>>();
    let previousEntry: FuelEntry | null = null;

    for (const entry of byOdometer) {
      const afstandKm = previousEntry ? entry.odometer - previousEntry.odometer : null;
      if (previousEntry && !entry.vergeten && afstandKm !== null && afstandKm > 0) {
        valuesPerId.set(entry.id, {
          afstandKm,
          verbruikL100km: (entry.volume / afstandKm) * 100,
        });
      } else {
        valuesPerId.set(entry.id, { afstandKm: null, verbruikL100km: null });
      }
      previousEntry = entry;
    }

    return entries.map((entry) => ({ ...entry, ...valuesPerId.get(entry.id)! }));
  });
  readonly consumptionChartData = computed<ChartConfiguration<'line'>['data']>(() => {
    const entries = this.chartEntries().filter((entry) => entry.verbruikL100km !== null);
    return this.createLineChartData(
      entries,
      'Verbruik (L/100 km)',
      entries.map((entry) => entry.verbruikL100km!),
      '#2563eb',
    );
  });
  readonly fuelPriceChartData = computed<ChartConfiguration<'line'>['data']>(() => {
    const entries = this.chartEntries().filter((entry) => entry.volume > 0);
    return this.createLineChartData(
      entries,
      'Brandstofprijs (EUR/L)',
      entries.map((entry) => entry.bedrag / entry.volume),
      '#059669',
    );
  });
  readonly fuelCostChartData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const entries = this.chartEntries();
    return {
      labels: entries.map((entry) => this.formatDate(entry.datum)),
      datasets: [{
        label: 'Kosten per tankbeurt (EUR)',
        data: entries.map((entry) => entry.bedrag),
        backgroundColor: '#d97706',
        borderRadius: 4,
      }],
    };
  });
  readonly lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: true } },
  };
  readonly barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: true } },
  };
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

  private chartEntries(): FuelEntryWithVerbruik[] {
    return [...this.fuelEntriesWithVerbruik()].sort((a, b) => a.datum.localeCompare(b.datum));
  }

  private createLineChartData(
    entries: FuelEntryWithVerbruik[],
    label: string,
    data: number[],
    color: string,
  ): ChartConfiguration<'line'>['data'] {
    return {
      labels: entries.map((entry) => this.formatDate(entry.datum)),
      datasets: [{
        label,
        data,
        borderColor: color,
        backgroundColor: `${color}26`,
        fill: true,
        tension: 0.25,
      }],
    };
  }

  private formatDate(date: string): string {
    return new Intl.DateTimeFormat('nl-NL').format(new Date(`${date}T00:00:00`));
  }
}
