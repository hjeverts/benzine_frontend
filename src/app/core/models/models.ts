export interface Vehicle {
  id: number;
  naam: string;
  merk?: string;
  type?: string;
  bouwjaar?: number;
  aankoopdatum?: string;
  isOwner: boolean;
  eigenaarNaam: string;
  fotoDataUrl?: string;
  fotoThumbnailDataUrl?: string;
}

export type VehicleRequest = Omit<Vehicle, 'id' | 'isOwner' | 'eigenaarNaam'>;

export interface VehicleShare {
  userId: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface FuelEntry {
  id: number;
  vehicleId: number;
  datum: string;
  odometer: number;
  brandstofType?: string;
  volume: number;
  bedrag: number;
  tankstation?: string;
  vergeten: boolean;
}

export type FuelEntryRequest = Omit<FuelEntry, 'id' | 'vehicleId'>;

export interface MaintenanceType {
  id: number;
  naam: string;
}

export interface MaintenanceEntry {
  id: number;
  vehicleId: number;
  datum: string;
  odometer: number;
  maintenanceTypeId: number;
  maintenanceTypeNaam: string;
  notitie?: string;
}

export type MaintenanceEntryRequest = Omit<
  MaintenanceEntry,
  'id' | 'vehicleId' | 'maintenanceTypeNaam'
>;

export interface VehicleStats {
  vehicleId: number;
  totaleKosten: number;
  totaalLiters: number;
  gemiddeldeVerbruikL100km: number;
  gemiddeldePrijsPerLiter: number;
  laatsteOdometer: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: string;
}

export type AdminUserUpdate = Pick<AdminUser, 'email' | 'name' | 'isAdmin'>;
