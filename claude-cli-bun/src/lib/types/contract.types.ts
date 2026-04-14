import type { ContractStatus } from "./common.types";

export interface Contract {
  id: string;
  customerId: string;
  quoteId: string | null;
  status: ContractStatus;
  signedAt: Date | null;
  signatureToken: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateContractInput {
  customerId: string;
  quoteId?: string;
  body: string;
}

export interface SignContractInput {
  contractId: string;
  token: string;
}
