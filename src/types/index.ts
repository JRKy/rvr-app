export interface TruckSpecs {
  curbWeight: number;
  gvwr: number;
  gcvwr: number;
  payload: number;
  towingCapacity: number;
}

export interface PayloadCalculation {
  id: string;
  date: Date;
  truckSpecs: TruckSpecs;
  passengerWeight: number;
  cargoWeight: number;
  hitchWeight: number;
  totalPayload: number;
  availablePayload: number;
  newGVW: number;
  newGCVW: number;
  remainingTowingCapacity: number;
  isWithinLimits: boolean;
  notes?: string;
}

export interface Trip {
  id: string;
  date: string;
  origin: string;
  destination: string;
  distance: number;
  fuelAmount: number;
  fuelCost: number;
  estimatedMPG: number;
  isRoundTrip: boolean;
  mpg: number;
  costPerMile: number;
  vehicleClass: string;
  wheelConfig: string;
  loadStatus: string;
  currentFuelPrice: number;
  coordinates?: {
    origin: [number, number];
    destination: [number, number];
  };
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
} 