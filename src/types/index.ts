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
  date: Date;
  startMileage: number;
  endMileage: number;
  totalMiles: number;
  fuelUsed: number;
  fuelCost: number;
  mpg: number;
  route?: {
    start: string;
    end: string;
  };
  notes?: string;
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
} 