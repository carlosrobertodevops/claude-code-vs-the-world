import type { CreateUserInput, UpdateUserInput, User } from "@/lib/types/user.types";
import type { PaginatedResult, PaginationInput } from "@/lib/types/common.types";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<(User & { passwordHash: string }) | null>;
  create(input: CreateUserInput & { passwordHash: string }): Promise<User>;
  update(id: string, input: UpdateUserInput): Promise<User>;
  softDelete(id: string): Promise<void>;
  list(pagination: PaginationInput): Promise<PaginatedResult<User>>;
}
