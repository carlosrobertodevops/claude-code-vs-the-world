import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const passwordHash = await hash("password123", 12);

  await prisma.$transaction(async (tx) => {
    console.log("Clearing existing data...");
    await tx.$executeRawUnsafe(`
      TRUNCATE TABLE
        "service_photos",
        "queue_entries",
        "service_order_items",
        "service_orders",
        "contracts",
        "quote_items",
        "quotes",
        "file_uploads",
        "vehicle_photos",
        "vehicles",
        "car_wash_config",
        "customers",
        "stock_movements",
        "products",
        "service_types",
        "users"
      RESTART IDENTITY CASCADE
    `);

    // =========================================================================
    // 1. Users (1 Manager + 2 Employees)
    // =========================================================================
    console.log("Creating users...");

    const admin = await tx.user.create({
      data: {
        name: "Admin AquaWash",
        email: "admin@aquawash.com",
        passwordHash,
        role: "MANAGER",
        phone: "(11) 99000-0001",
      },
    });

    const joao = await tx.user.create({
      data: {
        name: "João Silva",
        email: "joao@aquawash.com",
        passwordHash,
        role: "EMPLOYEE",
        phone: "(11) 99000-0002",
      },
    });

    const maria = await tx.user.create({
      data: {
        name: "Maria Santos",
        email: "maria@aquawash.com",
        passwordHash,
        role: "EMPLOYEE",
        phone: "(11) 99000-0003",
      },
    });

    const employees = [joao, maria];

    // =========================================================================
    // 2. Products (10 items)
    // =========================================================================
    console.log("Creating products...");

    const productsData = [
      { name: "Shampoo Automotivo", unit: "L", currentStock: 50, minimumStock: 10, costPrice: 15.0 },
      { name: "Cera Líquida", unit: "L", currentStock: 30, minimumStock: 5, costPrice: 25.0 },
      { name: "Silicone em Gel", unit: "un", currentStock: 40, minimumStock: 10, costPrice: 12.0 },
      { name: "Limpa Pneu", unit: "L", currentStock: 25, minimumStock: 5, costPrice: 18.0 },
      { name: "Desengraxante", unit: "L", currentStock: 20, minimumStock: 5, costPrice: 22.0 },
      { name: "Flanela de Microfibra", unit: "un", currentStock: 100, minimumStock: 20, costPrice: 8.0 },
      { name: "Pretinho para Pneu", unit: "L", currentStock: 15, minimumStock: 5, costPrice: 14.0 },
      { name: "Aromatizante", unit: "un", currentStock: 60, minimumStock: 15, costPrice: 10.0 },
      { name: "Estopa", unit: "kg", currentStock: 10, minimumStock: 3, costPrice: 6.0 },
      { name: "Removedor de Insetos", unit: "L", currentStock: 12, minimumStock: 3, costPrice: 20.0 },
    ];

    const products = [];
    for (const data of productsData) {
      const product = await tx.product.create({ data });
      products.push(product);
    }

    // =========================================================================
    // 3. Service Types (8 types)
    // =========================================================================
    console.log("Creating service types...");

    const serviceTypesData = [
      { name: "Lavagem Simples", basePrice: 40.0, estimatedMinutes: 30 },
      { name: "Lavagem Completa", basePrice: 70.0, estimatedMinutes: 60 },
      { name: "Lavagem Premium", basePrice: 120.0, estimatedMinutes: 90 },
      { name: "Polimento", basePrice: 200.0, estimatedMinutes: 120 },
      { name: "Cristalização", basePrice: 350.0, estimatedMinutes: 180 },
      { name: "Higienização Interna", basePrice: 150.0, estimatedMinutes: 90 },
      { name: "Lavagem de Motor", basePrice: 80.0, estimatedMinutes: 45 },
      { name: "Enceramento", basePrice: 100.0, estimatedMinutes: 60 },
    ];

    const serviceTypes = [];
    for (const data of serviceTypesData) {
      const serviceType = await tx.serviceType.create({ data });
      serviceTypes.push(serviceType);
    }

    // =========================================================================
    // 4. Customers (15 customers)
    // =========================================================================
    console.log("Creating customers...");

    const customersData = [
      { name: "Carlos Eduardo Oliveira", phone: "(11) 99123-4567", cpfCnpj: "123.456.789-00", email: "carlos.oliveira@email.com" },
      { name: "Ana Paula Ferreira", phone: "(11) 98234-5678", cpfCnpj: "234.567.890-11", email: "ana.ferreira@email.com" },
      { name: "Ricardo Mendes Lima", phone: "(11) 97345-6789", cpfCnpj: "345.678.901-22", email: "ricardo.lima@email.com" },
      { name: "Fernanda Costa Silva", phone: "(11) 96456-7890", cpfCnpj: "456.789.012-33", email: "fernanda.silva@email.com" },
      { name: "Bruno Almeida Santos", phone: "(11) 95567-8901", cpfCnpj: "567.890.123-44", email: "bruno.santos@email.com" },
      { name: "Juliana Rodrigues Pereira", phone: "(11) 94678-9012", cpfCnpj: "678.901.234-55", email: "juliana.pereira@email.com" },
      { name: "Marcos Vinícius Souza", phone: "(11) 93789-0123", cpfCnpj: "789.012.345-66", email: "marcos.souza@email.com" },
      { name: "Patrícia Barbosa Nunes", phone: "(11) 92890-1234", cpfCnpj: "890.123.456-77", email: "patricia.nunes@email.com" },
      { name: "Rafael Gomes Teixeira", phone: "(11) 91901-2345", cpfCnpj: "901.234.567-88", email: "rafael.teixeira@email.com" },
      { name: "Camila Martins Araujo", phone: "(11) 99012-3456", cpfCnpj: "012.345.678-99", email: "camila.araujo@email.com" },
      { name: "Lucas Pereira Ribeiro", phone: "(21) 99111-2233", cpfCnpj: "111.222.333-44", email: "lucas.ribeiro@email.com" },
      { name: "Tatiane Oliveira Ramos", phone: "(21) 98222-3344", cpfCnpj: "222.333.444-55", email: "tatiane.ramos@email.com" },
      { name: "Diego Fernandes Castro", phone: "(21) 97333-4455", cpfCnpj: "333.444.555-66", email: "diego.castro@email.com" },
      { name: "Aline Sousa Monteiro", phone: "(21) 96444-5566", cpfCnpj: "444.555.666-77", email: "aline.monteiro@email.com" },
      { name: "Thiago Nascimento Dias", phone: "(21) 95555-6677", cpfCnpj: "555.666.777-88", email: "thiago.dias@email.com" },
    ];

    const customers = [];
    for (const data of customersData) {
      const customer = await tx.customer.create({ data });
      customers.push(customer);
    }

    // =========================================================================
    // 5. Vehicles (20 vehicles distributed among customers)
    // =========================================================================
    console.log("Creating vehicles...");

    const vehiclesData = [
      { customerId: customers[0].id, plate: "ABC-1234", brand: "Fiat", model: "Uno", year: 2020, color: "Branco" },
      { customerId: customers[0].id, plate: "DEF-5678", brand: "Volkswagen", model: "Gol", year: 2021, color: "Prata" },
      { customerId: customers[1].id, plate: "GHI-9012", brand: "Chevrolet", model: "Onix", year: 2022, color: "Preto" },
      { customerId: customers[1].id, plate: "JKL-3456", brand: "Honda", model: "Civic", year: 2023, color: "Cinza" },
      { customerId: customers[2].id, plate: "MNO-7890", brand: "Toyota", model: "Corolla", year: 2022, color: "Prata" },
      { customerId: customers[2].id, plate: "PQR-1235", brand: "Hyundai", model: "HB20", year: 2021, color: "Vermelho" },
      { customerId: customers[3].id, plate: "STU-4568", brand: "Renault", model: "Sandero", year: 2020, color: "Azul" },
      { customerId: customers[4].id, plate: "VWX-7891", brand: "Ford", model: "Ka", year: 2019, color: "Branco" },
      { customerId: customers[4].id, plate: "YZA-0124", brand: "Jeep", model: "Renegade", year: 2023, color: "Preto" },
      { customerId: customers[5].id, plate: "BCD-3457", brand: "Nissan", model: "Kicks", year: 2022, color: "Cinza" },
      { customerId: customers[6].id, plate: "EFG-6780", brand: "Volkswagen", model: "T-Cross", year: 2023, color: "Branco" },
      { customerId: customers[7].id, plate: "HIJ-9013", brand: "Chevrolet", model: "Tracker", year: 2022, color: "Prata" },
      { customerId: customers[8].id, plate: "KLM-2346", brand: "Fiat", model: "Argo", year: 2021, color: "Vermelho" },
      { customerId: customers[9].id, plate: "NOP-5679", brand: "Toyota", model: "Yaris", year: 2020, color: "Azul" },
      { customerId: customers[10].id, plate: "QRS-8902", brand: "Honda", model: "HR-V", year: 2023, color: "Preto" },
      { customerId: customers[11].id, plate: "TUV-1236", brand: "Hyundai", model: "Creta", year: 2022, color: "Branco" },
      { customerId: customers[12].id, plate: "WXY-4569", brand: "Fiat", model: "Toro", year: 2023, color: "Cinza" },
      { customerId: customers[13].id, plate: "ZAB-7892", brand: "Chevrolet", model: "S10", year: 2021, color: "Prata" },
      { customerId: customers[14].id, plate: "CDE-0125", brand: "Volkswagen", model: "Polo", year: 2022, color: "Vermelho" },
      { customerId: customers[14].id, plate: "FGH-3458", brand: "Fiat", model: "Mobi", year: 2020, color: "Branco" },
    ];

    const vehicles = [];
    for (const data of vehiclesData) {
      const vehicle = await tx.vehicle.create({ data });
      vehicles.push(vehicle);
    }

    // =========================================================================
    // 6. Stock Movements (initial IN for all products)
    // =========================================================================
    console.log("Creating initial stock movements...");

    for (const product of products) {
      await tx.stockMovement.create({
        data: {
          productId: product.id,
          userId: admin.id,
          type: "IN",
          quantity: product.currentStock,
          unitCost: product.costPrice,
          notes: "Estoque inicial",
        },
      });
    }

    // =========================================================================
    // 7. Quotes (5 quotes with varied statuses)
    // =========================================================================
    console.log("Creating quotes...");

    const now = new Date();

    // Quote 1: DRAFT
    const quote1 = await tx.quote.create({
      data: {
        customerId: customers[0].id,
        quoteNumber: "ORC-0001",
        status: "DRAFT",
        totalAmount: 190.0,
        notes: "Cliente solicitou orcamento para lavagem completa e enceramento.",
        validUntil: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
      },
    });
    await tx.quoteItem.create({
      data: { quoteId: quote1.id, serviceTypeId: serviceTypes[1].id, quantity: 1, unitPrice: 70.0, subtotal: 70.0 },
    });
    await tx.quoteItem.create({
      data: { quoteId: quote1.id, serviceTypeId: serviceTypes[7].id, quantity: 1, unitPrice: 100.0, discount: 0, subtotal: 100.0 },
    });
    await tx.quoteItem.create({
      data: { quoteId: quote1.id, serviceTypeId: serviceTypes[0].id, quantity: 1, unitPrice: 40.0, discount: 20.0, subtotal: 20.0 },
    });

    // Quote 2: SENT
    const quote2 = await tx.quote.create({
      data: {
        customerId: customers[2].id,
        quoteNumber: "ORC-0002",
        status: "SENT",
        totalAmount: 550.0,
        validUntil: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      },
    });
    await tx.quoteItem.create({
      data: { quoteId: quote2.id, serviceTypeId: serviceTypes[3].id, quantity: 1, unitPrice: 200.0, subtotal: 200.0 },
    });
    await tx.quoteItem.create({
      data: { quoteId: quote2.id, serviceTypeId: serviceTypes[4].id, quantity: 1, unitPrice: 350.0, subtotal: 350.0 },
    });

    // Quote 3: APPROVED
    const quote3 = await tx.quote.create({
      data: {
        customerId: customers[4].id,
        quoteNumber: "ORC-0003",
        status: "APPROVED",
        totalAmount: 230.0,
        validUntil: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
      },
    });
    await tx.quoteItem.create({
      data: { quoteId: quote3.id, serviceTypeId: serviceTypes[5].id, quantity: 1, unitPrice: 150.0, subtotal: 150.0 },
    });
    await tx.quoteItem.create({
      data: { quoteId: quote3.id, serviceTypeId: serviceTypes[6].id, quantity: 1, unitPrice: 80.0, subtotal: 80.0 },
    });

    // Quote 4: REJECTED
    const quote4 = await tx.quote.create({
      data: {
        customerId: customers[6].id,
        quoteNumber: "ORC-0004",
        status: "REJECTED",
        totalAmount: 470.0,
        notes: "Cliente achou o valor alto.",
        validUntil: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
    });
    await tx.quoteItem.create({
      data: { quoteId: quote4.id, serviceTypeId: serviceTypes[2].id, quantity: 1, unitPrice: 120.0, subtotal: 120.0 },
    });
    await tx.quoteItem.create({
      data: { quoteId: quote4.id, serviceTypeId: serviceTypes[4].id, quantity: 1, unitPrice: 350.0, subtotal: 350.0 },
    });

    // Quote 5: EXPIRED
    const quote5 = await tx.quote.create({
      data: {
        customerId: customers[8].id,
        quoteNumber: "ORC-0005",
        status: "EXPIRED",
        totalAmount: 270.0,
        validUntil: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      },
    });
    await tx.quoteItem.create({
      data: { quoteId: quote5.id, serviceTypeId: serviceTypes[1].id, quantity: 1, unitPrice: 70.0, subtotal: 70.0 },
    });
    await tx.quoteItem.create({
      data: { quoteId: quote5.id, serviceTypeId: serviceTypes[3].id, quantity: 1, unitPrice: 200.0, subtotal: 200.0 },
    });

    // =========================================================================
    // 8. Contracts (3 contracts)
    // =========================================================================
    console.log("Creating contracts...");

    await tx.contract.create({
      data: {
        customerId: customers[4].id,
        contractNumber: "CTR-0001",
        status: "SIGNED",
        title: "Contrato de Manutencao Mensal",
        content: "Contrato de prestacao de servicos de lavagem automotiva mensal. Inclui 4 lavagens completas por mes, com agendamento previo. Validade de 12 meses.",
        signedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        signatureIp: "192.168.1.100",
      },
    });

    await tx.contract.create({
      data: {
        customerId: customers[2].id,
        contractNumber: "CTR-0002",
        status: "PENDING_SIGNATURE",
        title: "Contrato de Polimento Trimestral",
        content: "Contrato de prestacao de servicos de polimento automotivo trimestral. Inclui 1 polimento completo a cada 3 meses. Validade de 12 meses.",
      },
    });

    await tx.contract.create({
      data: {
        customerId: customers[7].id,
        contractNumber: "CTR-0003",
        status: "DRAFT",
        title: "Contrato Frota Empresarial",
        content: "Contrato de prestacao de servicos de lavagem para frota empresarial. Inclui lavagens ilimitadas para ate 5 veiculos. Validade de 6 meses.",
      },
    });

    // =========================================================================
    // 9. Service Orders (20 orders in the last 30 days)
    // =========================================================================
    console.log("Creating service orders...");

    interface OrderSeed {
      orderNumber: string;
      customerId: string;
      vehicleId: string;
      employeeId: string;
      status: "WAITING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
      daysAgo: number;
      serviceTypeIndex: number;
      totalAmount: number;
      notes?: string;
      extraItems?: Array<{
        serviceTypeIndex?: number;
        productIndex?: number;
        description?: string;
        quantity: number;
        unitPrice: number;
        subtotal: number;
      }>;
    }

    const ordersData: OrderSeed[] = [
      { orderNumber: "OS-0001", customerId: customers[0].id, vehicleId: vehicles[0].id, employeeId: joao.id, status: "COMPLETED", daysAgo: 28, serviceTypeIndex: 0, totalAmount: 40.0 },
      { orderNumber: "OS-0002", customerId: customers[1].id, vehicleId: vehicles[2].id, employeeId: maria.id, status: "COMPLETED", daysAgo: 27, serviceTypeIndex: 1, totalAmount: 70.0 },
      { orderNumber: "OS-0003", customerId: customers[2].id, vehicleId: vehicles[4].id, employeeId: joao.id, status: "COMPLETED", daysAgo: 25, serviceTypeIndex: 2, totalAmount: 120.0, notes: "Cliente pediu atencao especial no painel" },
      { orderNumber: "OS-0004", customerId: customers[3].id, vehicleId: vehicles[6].id, employeeId: maria.id, status: "COMPLETED", daysAgo: 23, serviceTypeIndex: 3, totalAmount: 200.0 },
      { orderNumber: "OS-0005", customerId: customers[4].id, vehicleId: vehicles[7].id, employeeId: joao.id, status: "COMPLETED", daysAgo: 21, serviceTypeIndex: 4, totalAmount: 350.0 },
      { orderNumber: "OS-0006", customerId: customers[5].id, vehicleId: vehicles[9].id, employeeId: maria.id, status: "COMPLETED", daysAgo: 19, serviceTypeIndex: 5, totalAmount: 150.0 },
      { orderNumber: "OS-0007", customerId: customers[6].id, vehicleId: vehicles[10].id, employeeId: joao.id, status: "COMPLETED", daysAgo: 17, serviceTypeIndex: 6, totalAmount: 80.0 },
      { orderNumber: "OS-0008", customerId: customers[7].id, vehicleId: vehicles[11].id, employeeId: maria.id, status: "COMPLETED", daysAgo: 15, serviceTypeIndex: 7, totalAmount: 100.0, notes: "Cera importada utilizada" },
      { orderNumber: "OS-0009", customerId: customers[0].id, vehicleId: vehicles[1].id, employeeId: joao.id, status: "COMPLETED", daysAgo: 14, serviceTypeIndex: 1, totalAmount: 170.0, extraItems: [{ serviceTypeIndex: 7, quantity: 1, unitPrice: 100.0, subtotal: 100.0 }] },
      { orderNumber: "OS-0010", customerId: customers[8].id, vehicleId: vehicles[12].id, employeeId: maria.id, status: "COMPLETED", daysAgo: 12, serviceTypeIndex: 0, totalAmount: 40.0 },
      { orderNumber: "OS-0011", customerId: customers[9].id, vehicleId: vehicles[13].id, employeeId: joao.id, status: "COMPLETED", daysAgo: 10, serviceTypeIndex: 2, totalAmount: 120.0 },
      { orderNumber: "OS-0012", customerId: customers[10].id, vehicleId: vehicles[14].id, employeeId: maria.id, status: "COMPLETED", daysAgo: 8, serviceTypeIndex: 5, totalAmount: 230.0, extraItems: [{ serviceTypeIndex: 6, quantity: 1, unitPrice: 80.0, subtotal: 80.0 }] },
      { orderNumber: "OS-0013", customerId: customers[11].id, vehicleId: vehicles[15].id, employeeId: joao.id, status: "COMPLETED", daysAgo: 6, serviceTypeIndex: 1, totalAmount: 70.0 },
      { orderNumber: "OS-0014", customerId: customers[12].id, vehicleId: vehicles[16].id, employeeId: maria.id, status: "COMPLETED", daysAgo: 5, serviceTypeIndex: 3, totalAmount: 200.0 },
      { orderNumber: "OS-0015", customerId: customers[13].id, vehicleId: vehicles[17].id, employeeId: joao.id, status: "CANCELLED", daysAgo: 4, serviceTypeIndex: 4, totalAmount: 350.0, notes: "Cliente cancelou por motivo pessoal" },
      { orderNumber: "OS-0016", customerId: customers[14].id, vehicleId: vehicles[18].id, employeeId: maria.id, status: "IN_PROGRESS", daysAgo: 1, serviceTypeIndex: 2, totalAmount: 120.0 },
      { orderNumber: "OS-0017", customerId: customers[1].id, vehicleId: vehicles[3].id, employeeId: joao.id, status: "IN_PROGRESS", daysAgo: 0, serviceTypeIndex: 1, totalAmount: 170.0, extraItems: [{ serviceTypeIndex: 7, quantity: 1, unitPrice: 100.0, subtotal: 100.0 }] },
      { orderNumber: "OS-0018", customerId: customers[3].id, vehicleId: vehicles[6].id, employeeId: maria.id, status: "WAITING", daysAgo: 0, serviceTypeIndex: 0, totalAmount: 40.0 },
      { orderNumber: "OS-0019", customerId: customers[5].id, vehicleId: vehicles[9].id, employeeId: joao.id, status: "WAITING", daysAgo: 0, serviceTypeIndex: 5, totalAmount: 150.0 },
      { orderNumber: "OS-0020", customerId: customers[9].id, vehicleId: vehicles[13].id, employeeId: maria.id, status: "WAITING", daysAgo: 0, serviceTypeIndex: 1, totalAmount: 70.0 },
    ];

    const serviceOrders = [];

    for (const order of ordersData) {
      const createdAt = new Date(now.getTime() - order.daysAgo * 24 * 60 * 60 * 1000);
      const serviceType = serviceTypes[order.serviceTypeIndex];

      let startedAt: Date | null = null;
      let completedAt: Date | null = null;

      if (order.status === "IN_PROGRESS") {
        startedAt = new Date(createdAt.getTime() + 10 * 60 * 1000);
      } else if (order.status === "COMPLETED") {
        startedAt = new Date(createdAt.getTime() + 10 * 60 * 1000);
        completedAt = new Date(startedAt.getTime() + serviceType.estimatedMinutes * 60 * 1000);
      }

      const so = await tx.serviceOrder.create({
        data: {
          customerId: order.customerId,
          vehicleId: order.vehicleId,
          employeeId: order.employeeId,
          orderNumber: order.orderNumber,
          status: order.status,
          totalAmount: order.totalAmount,
          notes: order.notes || null,
          startedAt,
          completedAt,
          createdAt,
        },
      });

      // Main service item
      await tx.serviceOrderItem.create({
        data: {
          serviceOrderId: so.id,
          serviceTypeId: serviceType.id,
          quantity: 1,
          unitPrice: serviceType.basePrice,
          subtotal: serviceType.basePrice,
        },
      });

      // Extra items (additional services)
      if (order.extraItems) {
        for (const extra of order.extraItems) {
          await tx.serviceOrderItem.create({
            data: {
              serviceOrderId: so.id,
              serviceTypeId: extra.serviceTypeIndex !== undefined ? serviceTypes[extra.serviceTypeIndex].id : null,
              productId: extra.productIndex !== undefined ? products[extra.productIndex].id : null,
              description: extra.description || null,
              quantity: extra.quantity,
              unitPrice: extra.unitPrice,
              subtotal: extra.subtotal,
            },
          });
        }
      }

      serviceOrders.push(so);
    }

    // =========================================================================
    // 10. Queue Entries for WAITING orders
    // =========================================================================
    console.log("Creating queue entries...");

    const waitingOrders = serviceOrders.filter((_, i) => ordersData[i].status === "WAITING");
    let position = 1;

    for (const wo of waitingOrders) {
      const orderData = ordersData[serviceOrders.indexOf(wo)];
      const serviceType = serviceTypes[orderData.serviceTypeIndex];
      const estimatedStart = new Date(now.getTime() + (position - 1) * 45 * 60 * 1000);
      const estimatedEnd = new Date(estimatedStart.getTime() + serviceType.estimatedMinutes * 60 * 1000);

      await tx.queueEntry.create({
        data: {
          serviceOrderId: wo.id,
          position,
          estimatedStart,
          estimatedEnd,
        },
      });

      position++;
    }

    // =========================================================================
    // 11. CarWashConfig
    // =========================================================================
    console.log("Creating car wash config...");

    await tx.carWashConfig.create({
      data: {
        businessName: "AquaWash Centro",
        slug: "aquawash-centro",
        simultaneousSlots: 3,
        phone: "(11) 3456-7890",
        address: "Rua das Flores, 123, Centro, Sao Paulo, SP",
      },
    });

    // =========================================================================
    // Summary
    // =========================================================================
    console.log("");
    console.log("Seed completed successfully!");
    console.log("  Users:            3 (1 manager + 2 employees)");
    console.log("  Products:         10");
    console.log("  Service Types:    8");
    console.log("  Customers:        15");
    console.log("  Vehicles:         20");
    console.log("  Stock Movements:  10");
    console.log("  Quotes:           5");
    console.log("  Contracts:        3");
    console.log("  Service Orders:   20");
    console.log("  Queue Entries:    " + waitingOrders.length);
    console.log("  Car Wash Config:  1");
    console.log("");
    console.log("Login credentials:");
    console.log("  Admin:  admin@aquawash.com / password123");
    console.log("  Joao:   joao@aquawash.com  / password123");
    console.log("  Maria:  maria@aquawash.com / password123");
  });
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
