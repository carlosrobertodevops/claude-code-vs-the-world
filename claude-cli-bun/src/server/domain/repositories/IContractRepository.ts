import type { Contract, CreateContractInput, SignContractInput } from "@/lib/types/contract.types";
import type { ContractStatus, PaginatedResult, PaginationInput } from "@/lib/types/common.types";

export interface IContractRepository {
  findById(id: string): Promise<Contract | null>;
  list(pagination: PaginationInput): Promise<PaginatedResult<Contract>>;
  create(input: CreateContractInput): Promise<Contract>;
  updateStatus(id: string, status: ContractStatus): Promise<Contract>;
  signWithToken(input: SignContractInput): Promise<Contract>;
  softDelete(id: string): Promise<void>;
}
