export interface Vehicle {
  id: string;
  customerId: string;
  plate: string;
  make: string | null;
  model: string | null;
  year: string | null;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateVehicleInput {
  customerId: string;
  plate: string;
  make?: string;
  model?: string;
  year?: string;
  color?: string;
}

export type UpdateVehicleInput = Partial<Omit<CreateVehicleInput, "customerId">>;

export interface VehiclePhoto {
  id: string;
  vehicleId: string;
  uploadId: string;
  createdAt: Date;
}
