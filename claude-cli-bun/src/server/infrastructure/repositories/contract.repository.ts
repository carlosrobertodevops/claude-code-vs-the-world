import { and, count, eq, isNull } from "drizzle-orm";
import { db } from "../drizzle/client";
import { contracts } from "../../../../drizzle/schema";
import type { IContractRepository } from "@/server/domain/repositories/IContractRepository";
import type { Contract, CreateContractInput, SignContractInput } from "@/lib/types/contract.types";
import type { ContractStatus, PaginatedResult, PaginationInput } from "@/lib/types/common.types";
import { paginate, buildPaginationMeta } from "@/lib/utils/pagination";
import { newId } from "@/lib/utils/cuid";
import { NotFoundError, UnauthorizedError } from "@/lib/errors";

const mapContract = (r: typeof contracts.$inferSelect): Contract => ({
  id: r.id, customerId: r.customerId, quoteId: r.quoteId, status: r.status,
  signedAt: r.signedAt, signatureToken: r.signatureToken, body: r.body,
  createdAt: r.createdAt, updatedAt: r.updatedAt, deletedAt: r.deletedAt,
});

export class ContractRepository implements IContractRepository {
  async findById(id: string): Promise<Contract | null> {
    const [r] = await db.select().from(contracts).where(and(eq(contracts.id, id), isNull(contracts.deletedAt))).limit(1);
    return r ? mapContract(r) : null;
  }
  async list(p: PaginationInput): Promise<PaginatedResult<Contract>> {
    const { page, limit, offset } = paginate(p);
    const rows = await db.select().from(contracts).where(isNull(contracts.deletedAt)).limit(limit).offset(offset);
    const [{ c } = { c: 0 }] = await db.select({ c: count() }).from(contracts).where(isNull(contracts.deletedAt));
    return { data: rows.map(mapContract), meta: buildPaginationMeta(page, limit, Number(c)) };
  }
  async create(input: CreateContractInput): Promise<Contract> {
    const [r] = await db.insert(contracts).values({
      ...input, signatureToken: newId(),
    }).returning();
    if (!r) throw new Error("Failed to create contract");
    return mapContract(r);
  }
  async updateStatus(id: string, status: ContractStatus): Promise<Contract> {
    const [r] = await db.update(contracts).set({ status, updatedAt: new Date() }).where(eq(contracts.id, id)).returning();
    if (!r) throw new NotFoundError("Contract", id);
    return mapContract(r);
  }
  async signWithToken(input: SignContractInput): Promise<Contract> {
    const found = await this.findById(input.contractId);
    if (!found) throw new NotFoundError("Contract", input.contractId);
    if (found.signatureToken !== input.token) throw new UnauthorizedError("Invalid signature token");
    const [r] = await db.update(contracts)
      .set({ status: "SIGNED", signedAt: new Date(), updatedAt: new Date() })
      .where(eq(contracts.id, input.contractId)).returning();
    if (!r) throw new NotFoundError("Contract", input.contractId);
    return mapContract(r);
  }
  async softDelete(id: string): Promise<void> {
    await db.update(contracts).set({ deletedAt: new Date() }).where(eq(contracts.id, id));
  }
}
