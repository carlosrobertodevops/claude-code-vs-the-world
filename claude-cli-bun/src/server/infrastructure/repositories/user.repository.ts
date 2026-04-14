import { and, count, eq, isNull } from "drizzle-orm";
import { db } from "../drizzle/client";
import { users } from "../../../../drizzle/schema";
import type { IUserRepository } from "@/server/domain/repositories/IUserRepository";
import type { CreateUserInput, UpdateUserInput, User } from "@/lib/types/user.types";
import type { PaginatedResult, PaginationInput } from "@/lib/types/common.types";
import { paginate, buildPaginationMeta } from "@/lib/utils/pagination";

const mapUser = (row: typeof users.$inferSelect): User => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  deletedAt: row.deletedAt,
});

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const [row] = await db.select().from(users).where(and(eq(users.id, id), isNull(users.deletedAt))).limit(1);
    return row ? mapUser(row) : null;
  }

  async findByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const [row] = await db.select().from(users).where(and(eq(users.email, email), isNull(users.deletedAt))).limit(1);
    return row ? { ...mapUser(row), passwordHash: row.passwordHash } : null;
  }

  async create(input: CreateUserInput & { passwordHash: string }): Promise<User> {
    const [row] = await db.insert(users).values({
      name: input.name,
      email: input.email,
      role: input.role,
      passwordHash: input.passwordHash,
    }).returning();
    if (!row) throw new Error("Failed to create user");
    return mapUser(row);
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    const [row] = await db.update(users).set({ ...input, updatedAt: new Date() })
      .where(eq(users.id, id)).returning();
    if (!row) throw new Error("User not found");
    return mapUser(row);
  }

  async softDelete(id: string): Promise<void> {
    await db.update(users).set({ deletedAt: new Date() }).where(eq(users.id, id));
  }

  async list(pagination: PaginationInput): Promise<PaginatedResult<User>> {
    const { page, limit, offset } = paginate(pagination);
    const rows = await db.select().from(users).where(isNull(users.deletedAt)).limit(limit).offset(offset);
    const [{ c } = { c: 0 }] = await db.select({ c: count() }).from(users).where(isNull(users.deletedAt));
    return { data: rows.map(mapUser), meta: buildPaginationMeta(page, limit, Number(c)) };
  }
}
