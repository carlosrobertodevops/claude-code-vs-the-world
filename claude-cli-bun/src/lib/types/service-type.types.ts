export interface ServiceType {
  id: string;
  name: string;
  description: string | null;
  basePrice: string;
  durationMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServiceTypeInput {
  name: string;
  description?: string;
  basePrice?: string;
  durationMinutes?: number;
}

export type UpdateServiceTypeInput = Partial<CreateServiceTypeInput>;
