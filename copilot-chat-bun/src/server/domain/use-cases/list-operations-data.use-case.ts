import type { OperationsRepository } from "@/server/domain/repositories/operations.repository";

export async function listInventoryUseCase(repository: OperationsRepository) {
  return repository.listProducts();
}

export async function listCustomersUseCase(repository: OperationsRepository) {
  return repository.listCustomers();
}

export async function listServiceOrdersUseCase(repository: OperationsRepository) {
  return repository.listServiceOrders();
}

export async function listQuotesUseCase(repository: OperationsRepository) {
  return repository.listQuotes();
}

export async function listContractsUseCase(repository: OperationsRepository) {
  return repository.listContracts();
}

export async function listQueueUseCase(repository: OperationsRepository) {
  return repository.listQueue();
}

export async function listEmployeesUseCase(repository: OperationsRepository) {
  return repository.listEmployees();
}

export async function listServiceTypesUseCase(repository: OperationsRepository) {
  return repository.listServiceTypes();
}
