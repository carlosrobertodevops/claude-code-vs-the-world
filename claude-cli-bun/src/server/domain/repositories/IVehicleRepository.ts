import type { CreateVehicleInput, UpdateVehicleInput, Vehicle, VehiclePhoto } from "@/lib/types/vehicle.types";

export interface IVehicleRepository {
  findById(id: string): Promise<Vehicle | null>;
  listByCustomer(customerId: string): Promise<Vehicle[]>;
  create(input: CreateVehicleInput): Promise<Vehicle>;
  update(id: string, input: UpdateVehicleInput): Promise<Vehicle>;
  softDelete(id: string): Promise<void>;
  addPhoto(vehicleId: string, uploadId: string): Promise<VehiclePhoto>;
}
