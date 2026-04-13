import { count } from "drizzle-orm";

import {
  carWashConfig,
  contracts as demoContracts,
  customers as demoCustomers,
  products as demoProducts,
  queueEntries as demoQueueEntries,
  quotes as demoQuotes,
  serviceOrders as demoServiceOrders,
  serviceTypes as demoServiceTypes,
  users as demoUsers,
  vehicles as demoVehicles,
} from "@/lib/demo-data";
import { db } from "@/server/infrastructure/drizzle/db";
import {
  carWashConfigs,
  contracts,
  customers,
  products,
  queueEntries,
  quoteItems,
  quotes,
  serviceOrderItems,
  serviceOrders,
  serviceTypes,
  users,
  vehicles,
} from "../drizzle/schema";

async function main() {
  await db.delete(queueEntries);
  await db.delete(serviceOrderItems);
  await db.delete(serviceOrders);
  await db.delete(contracts);
  await db.delete(quoteItems);
  await db.delete(quotes);
  await db.delete(serviceTypes);
  await db.delete(products);
  await db.delete(vehicles);
  await db.delete(customers);
  await db.delete(users);
  await db.delete(carWashConfigs);

  await db.insert(users).values(
    demoUsers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
    })),
  );

  await db.insert(customers).values(
    demoCustomers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      document: customer.document,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
    })),
  );

  await db.insert(vehicles).values(
    demoVehicles.map((vehicle) => ({
      id: vehicle.id,
      customerId: vehicle.customerId,
      brand: vehicle.brand,
      model: vehicle.model,
      plate: vehicle.plate,
      color: vehicle.color,
    })),
  );

  await db.insert(products).values(
    demoProducts.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      unit: product.unit,
      stock: product.stock,
      minimumStock: product.minimumStock,
      unitPrice: product.unitPrice.toFixed(2),
    })),
  );

  await db.insert(serviceTypes).values(
    demoServiceTypes.map((serviceType) => ({
      id: serviceType.id,
      name: serviceType.name,
      description: serviceType.description,
      basePrice: serviceType.basePrice.toFixed(2),
      durationMinutes: serviceType.durationMinutes,
    })),
  );

  await db.insert(quotes).values(
    demoQuotes.map((quote) => ({
      id: quote.id,
      customerId: quote.customerId,
      vehicleId: quote.vehicleId,
      status: quote.status,
      validUntil: new Date(quote.validUntil),
      total: quote.total.toFixed(2),
    })),
  );

  await db.insert(quoteItems).values(
    demoQuotes.flatMap((quote) =>
      quote.items.map((item) => ({
        id: item.id,
        quoteId: item.quoteId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toFixed(2),
      })),
    ),
  );

  await db.insert(contracts).values(
    demoContracts.map((contract) => ({
      id: contract.id,
      quoteId: contract.quoteId,
      customerId: contract.customerId,
      status: contract.status,
      signedAt: contract.signedAt ? new Date(contract.signedAt) : null,
      notes: contract.notes,
    })),
  );

  await db.insert(serviceOrders).values(
    demoServiceOrders.map((order) => ({
      id: order.id,
      customerId: order.customerId,
      vehicleId: order.vehicleId,
      assignedEmployeeId: order.assignedEmployeeId,
      status: order.status,
      scheduledFor: new Date(order.scheduledFor),
      total: order.total.toFixed(2),
      notes: order.notes,
      createdAt: new Date(order.createdAt),
    })),
  );

  await db.insert(serviceOrderItems).values(
    demoServiceOrders.flatMap((order) =>
      order.items.map((item) => ({
        id: item.id,
        serviceOrderId: item.serviceOrderId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toFixed(2),
      })),
    ),
  );

  await db.insert(queueEntries).values(
    demoQueueEntries.map((entry) => ({
      id: entry.id,
      serviceOrderId: entry.serviceOrderId,
      position: entry.position,
      status: entry.status,
      etaMinutes: entry.etaMinutes,
      updatedAt: new Date(entry.updatedAt),
    })),
  );

  await db.insert(carWashConfigs).values({
    id: carWashConfig.id,
    name: carWashConfig.name,
    slug: carWashConfig.slug,
    address: carWashConfig.address,
    themeAccent: carWashConfig.themeAccent,
    darkBackground: carWashConfig.darkBackground,
    lightBackground: carWashConfig.lightBackground,
    publicQueueEnabled: carWashConfig.publicQueueEnabled,
  });

  const seededConfig = await db.select({ total: count() }).from(carWashConfigs);

  console.log(
    `Seed concluido para LavaFlow com ${demoUsers.length} usuarios, ${demoCustomers.length} clientes, ${demoServiceOrders.length} ordens e ${seededConfig[0]?.total ?? 0} configuracao.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
