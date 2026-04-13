import {
  carWashConfig,
  contracts,
  customers,
  products,
  queueEntries,
  quotes,
  reportRows,
  serviceOrders,
  serviceTypes,
  users,
  vehicles,
} from "@/lib/demo-data";
import type { DashboardSummary, User } from "@/types/domain";

import type {
  OperationsRepository,
  PublicQueueItem,
} from "@/server/domain/repositories/operations.repository";

function getVehicleLabel(vehicleId: string) {
  const vehicle = vehicles.find((entry) => entry.id === vehicleId);
  return vehicle ? `${vehicle.brand} ${vehicle.model} · ${vehicle.plate}` : "";
}

function getCustomerName(customerId: string) {
  return customers.find((entry) => entry.id === customerId)?.name ?? "";
}

function mapQueue(): PublicQueueItem[] {
  return queueEntries.map((entry) => {
    const order = serviceOrders.find((serviceOrder) => serviceOrder.id === entry.serviceOrderId);

    return {
      id: entry.id,
      customerName: order ? getCustomerName(order.customerId) : "",
      vehicleLabel: order ? getVehicleLabel(order.vehicleId) : "",
      position: entry.position,
      status: entry.status,
      etaMinutes: entry.etaMinutes,
      updatedAt: entry.updatedAt,
    };
  });
}

export class DemoOperationsRepository implements OperationsRepository {
  async getConfig() {
    return carWashConfig;
  }

  async getDashboardSummary(): Promise<DashboardSummary> {
    return {
      revenueToday: serviceOrders.reduce((total, item) => total + item.total, 0),
      openOrders: serviceOrders.filter((item) => item.status !== "DELIVERED").length,
      queueLength: queueEntries.length,
      lowStockItems: products.filter((item) => item.stock <= item.minimumStock).length,
      pendingQuotes: quotes.filter((item) => item.status !== "APPROVED").length,
      signedContracts: contracts.filter((item) => item.status === "SIGNED").length,
    };
  }

  async listProducts() {
    return products;
  }

  async listCustomers() {
    return customers.map((customer) => ({
      ...customer,
      vehicles: vehicles.filter((vehicle) => vehicle.customerId === customer.id),
    }));
  }

  async listServiceTypes() {
    return serviceTypes;
  }

  async listServiceOrders() {
    return serviceOrders.map((order) => ({
      ...order,
      customerName: getCustomerName(order.customerId),
      vehicleLabel: getVehicleLabel(order.vehicleId),
      employeeName:
        users.find((employee) => employee.id === order.assignedEmployeeId)?.name ?? "",
    }));
  }

  async listQuotes() {
    return quotes.map((quote) => ({
      ...quote,
      customerName: getCustomerName(quote.customerId),
      vehicleLabel: getVehicleLabel(quote.vehicleId),
    }));
  }

  async listContracts() {
    return contracts.map((contract) => ({
      ...contract,
      customerName: getCustomerName(contract.customerId),
      quoteTotal: quotes.find((quote) => quote.id === contract.quoteId)?.total ?? 0,
    }));
  }

  async listQueue() {
    return mapQueue();
  }

  async listEmployees(): Promise<User[]> {
    return users;
  }

  async getPublicQueueBySlug(slug: string) {
    if (slug !== carWashConfig.slug) {
      throw new Error("PUBLIC_QUEUE_NOT_FOUND");
    }

    return {
      config: carWashConfig,
      queue: mapQueue(),
    };
  }

  async exportReportRows() {
    return reportRows;
  }
}

export const operationsRepository = new DemoOperationsRepository();
