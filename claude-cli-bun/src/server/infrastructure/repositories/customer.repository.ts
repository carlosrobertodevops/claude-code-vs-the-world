import { and, count, eq, ilike, isNull, or } from "drizzle-orm";
import { db } from "../drizzle/client";
import { customers, vehicles, vehiclePhotos } from "../../../../drizzle/schema";
import type { ICustomerRepository } from "@/server/domain/repositories/ICustomerRepository";
import type { IVehicleRepository } from "@/server/domain/repositories/IVehicleRepository";
import type { Customer, CreateCustomerInput, UpdateCustomerInput } from "@/lib/types/customer.types";
import type { Vehicle, CreateVehicleInput, UpdateVehicleInput, VehiclePhoto } from "@/lib/types/vehicle.types";
import type { PaginatedResult, PaginationInput } from "@/lib/types/common.types";
import { paginate, buildPaginationMeta } from "@/lib/utils/pagination";

const mapCustomer = (r: typeof customers.$inferSelect): Customer => ({
  id: r.id, name: r.name, document: r.document, phone: r.phone, email: r.email, notes: r.notes,
  createdAt: r.createdAt, updatedAt: r.updatedAt, deletedAt: r.deletedAt,
});
const mapVehicle = (r: typeof vehicles.$inferSelect): Vehicle => ({
  id: r.id, customerId: r.customerId, plate: r.plate, make: r.make, model: r.model, year: r.year, color: r.color,
  createdAt: r.createdAt, updatedAt: r.updatedAt, deletedAt: r.deletedAt,
});

export class CustomerRepository implements ICustomerRepository {
  async findById(id: string): Promise<Customer | null> {
    const [r] = await db.select().from(customers).where(and(eq(customers.id, id), isNull(customers.deletedAt))).limit(1);
    return r ? mapCustomer(r) : null;
  }
  async list(p: PaginationInput): Promise<PaginatedResult<Customer>> {
    const { page, limit, offset } = paginate(p);
    const rows = await db.select().from(customers).where(isNull(customers.deletedAt)).limit(limit).offset(offset);
    const [{ c } = { c: 0 }] = await db.select({ c: count() }).from(customers).where(isNull(customers.deletedAt));
    return { data: rows.map(mapCustomer), meta: buildPaginationMeta(page, limit, Number(c)) };
  }
  async create(input: CreateCustomerInput): Promise<Customer> {
    const [r] = await db.insert(customers).values(input).returning();
    if (!r) throw new Error("Failed to create customer");
    return mapCustomer(r);
  }
  async update(id: string, input: UpdateCustomerInput): Promise<Customer> {
    const [r] = await db.update(customers).set({ ...input, updatedAt: new Date() }).where(eq(customers.id, id)).returning();
    if (!r) throw new Error("Customer not found");
    return mapCustomer(r);
  }
  async softDelete(id: string): Promise<void> {
    await db.update(customers).set({ deletedAt: new Date() }).where(eq(customers.id, id));
  }
  async searchByTerm(term: string, p: PaginationInput): Promise<PaginatedResult<Customer>> {
    const { page, limit, offset } = paginate(p);
    const q = `%${term}%`;
    const rows = await db.select().from(customers)
      .where(and(isNull(customers.deletedAt), or(ilike(customers.name, q), ilike(customers.document, q), ilike(customers.email, q))))
      .limit(limit).offset(offset);
    return { data: rows.map(mapCustomer), meta: buildPaginationMeta(page, limit, rows.length) };
  }
}

export class VehicleRepository implements IVehicleRepository {
  async findById(id: string): Promise<Vehicle | null> {
    const [r] = await db.select().from(vehicles).where(and(eq(vehicles.id, id), isNull(vehicles.deletedAt))).limit(1);
    return r ? mapVehicle(r) : null;
  }
  async listByCustomer(customerId: string): Promise<Vehicle[]> {
    const rows = await db.select().from(vehicles).where(and(eq(vehicles.customerId, customerId), isNull(vehicles.deletedAt)));
    return rows.map(mapVehicle);
  }
  async create(input: CreateVehicleInput): Promise<Vehicle> {
    const [r] = await db.insert(vehicles).values(input).returning();
    if (!r) throw new Error("Failed to create vehicle");
    return mapVehicle(r);
  }
  async update(id: string, input: UpdateVehicleInput): Promise<Vehicle> {
    const [r] = await db.update(vehicles).set({ ...input, updatedAt: new Date() }).where(eq(vehicles.id, id)).returning();
    if (!r) throw new Error("Vehicle not found");
    return mapVehicle(r);
  }
  async softDelete(id: string): Promise<void> {
    await db.update(vehicles).set({ deletedAt: new Date() }).where(eq(vehicles.id, id));
  }
  async addPhoto(vehicleId: string, uploadId: string): Promise<VehiclePhoto> {
    const [r] = await db.insert(vehiclePhotos).values({ vehicleId, uploadId }).returning();
    if (!r) throw new Error("Failed to add photo");
    return { id: r.id, vehicleId: r.vehicleId, uploadId: r.uploadId, createdAt: r.createdAt };
  }
}
