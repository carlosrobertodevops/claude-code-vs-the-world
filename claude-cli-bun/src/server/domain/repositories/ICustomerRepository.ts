import type { CreateCustomerInput, Customer, UpdateCustomerInput } from "@/lib/types/customer.types";
import type { PaginatedResult, PaginationInput } from "@/lib/types/common.types";

export interface ICustomerRepository {
  findById(id: string): Promise<Customer | null>;
  list(pagination: PaginationInput): Promise<PaginatedResult<Customer>>;
  create(input: CreateCustomerInput): Promise<Customer>;
  update(id: string, input: UpdateCustomerInput): Promise<Customer>;
  softDelete(id: string): Promise<void>;
  searchByTerm(term: string, pagination: PaginationInput): Promise<PaginatedResult<Customer>>;
}
