export interface Customer {
  id: string;
  name: string;
  document: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateCustomerInput {
  name: string;
  document?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export type UpdateCustomerInput = Partial<CreateCustomerInput>;
