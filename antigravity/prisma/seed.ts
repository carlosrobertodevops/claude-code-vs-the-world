import "dotenv/config";
import pg from "pg";
import { PrismaClient } from "@prisma/client/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcryptjs from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.queueEntry.deleteMany();
  await prisma.servicePhoto.deleteMany();
  await prisma.serviceOrderItem.deleteMany();
  await prisma.serviceOrder.deleteMany();
  await prisma.quoteItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.vehiclePhoto.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.serviceType.deleteMany();
  await prisma.fileUpload.deleteMany();
  await prisma.carWashConfig.deleteMany();
  await prisma.user.deleteMany();

  const hash = (pw: string) => bcryptjs.hashSync(pw, 12);

  // Users
  const admin = await prisma.user.create({ data: { name: "Admin AquaWash", email: "admin@aquawash.com", passwordHash: hash("password123"), role: "MANAGER", phone: "11999990000" } });
  const joao = await prisma.user.create({ data: { name: "João Silva", email: "joao@aquawash.com", passwordHash: hash("password123"), role: "EMPLOYEE", phone: "11999991111" } });
  const maria = await prisma.user.create({ data: { name: "Maria Santos", email: "maria@aquawash.com", passwordHash: hash("password123"), role: "EMPLOYEE", phone: "11999992222" } });
  console.log("✅ Users created");

  // Service Types
  const serviceTypes = await Promise.all([
    prisma.serviceType.create({ data: { name: "Lavagem Simples", basePrice: 40, estimatedMinutes: 30 } }),
    prisma.serviceType.create({ data: { name: "Lavagem Completa", basePrice: 80, estimatedMinutes: 60 } }),
    prisma.serviceType.create({ data: { name: "Lavagem Premium", basePrice: 150, estimatedMinutes: 90 } }),
    prisma.serviceType.create({ data: { name: "Polimento", basePrice: 200, estimatedMinutes: 120 } }),
    prisma.serviceType.create({ data: { name: "Cristalização", basePrice: 350, estimatedMinutes: 180 } }),
    prisma.serviceType.create({ data: { name: "Higienização Interna", basePrice: 120, estimatedMinutes: 60 } }),
    prisma.serviceType.create({ data: { name: "Lavagem de Motor", basePrice: 60, estimatedMinutes: 45 } }),
    prisma.serviceType.create({ data: { name: "Enceramento", basePrice: 90, estimatedMinutes: 45 } }),
  ]);
  console.log("✅ Service types created");

  // Products
  const products = await Promise.all([
    prisma.product.create({ data: { name: "Shampoo Automotivo", unit: "L", currentStock: 25, minimumStock: 5, costPrice: 18.5 } }),
    prisma.product.create({ data: { name: "Cera Líquida", unit: "L", currentStock: 15, minimumStock: 3, costPrice: 45 } }),
    prisma.product.create({ data: { name: "Silicone Gel", unit: "L", currentStock: 10, minimumStock: 3, costPrice: 22 } }),
    prisma.product.create({ data: { name: "Limpa Vidros", unit: "L", currentStock: 12, minimumStock: 4, costPrice: 12 } }),
    prisma.product.create({ data: { name: "Desengraxante", unit: "L", currentStock: 8, minimumStock: 3, costPrice: 28 } }),
    prisma.product.create({ data: { name: "Pano Microfibra", unit: "un", currentStock: 30, minimumStock: 10, costPrice: 8 } }),
    prisma.product.create({ data: { name: "Pretinho para Pneus", unit: "L", currentStock: 2, minimumStock: 3, costPrice: 15 } }),
    prisma.product.create({ data: { name: "Aromatizante", unit: "un", currentStock: 20, minimumStock: 5, costPrice: 6 } }),
    prisma.product.create({ data: { name: "Removedor de Chuva Ácida", unit: "L", currentStock: 5, minimumStock: 2, costPrice: 65 } }),
    prisma.product.create({ data: { name: "Massa de Polir", unit: "kg", currentStock: 4, minimumStock: 2, costPrice: 55 } }),
  ]);
  console.log("✅ Products created");

  // Stock movements
  for (const p of products) {
    await prisma.stockMovement.create({ data: { productId: p.id, userId: admin.id, type: "IN", quantity: p.currentStock, unitCost: p.costPrice, notes: "Estoque inicial" } });
  }
  console.log("✅ Stock movements created");

  // Customers
  const customerData = [
    { name: "Carlos Oliveira", phone: "11987654321", cpfCnpj: "12345678901", email: "carlos@email.com" },
    { name: "Ana Paula Souza", phone: "11976543210", cpfCnpj: "23456789012", email: "ana@email.com" },
    { name: "Roberto Lima", phone: "11965432109", cpfCnpj: "34567890123" },
    { name: "Fernanda Costa", phone: "11954321098", cpfCnpj: "45678901234", email: "fernanda@email.com" },
    { name: "Lucas Mendes", phone: "11943210987", cpfCnpj: "56789012345" },
    { name: "Juliana Ferreira", phone: "11932109876", cpfCnpj: "67890123456", email: "juliana@email.com" },
    { name: "Marcos Almeida", phone: "11921098765", cpfCnpj: "78901234567" },
    { name: "Patricia Rocha", phone: "11910987654", cpfCnpj: "89012345678", email: "patricia@email.com" },
    { name: "Ricardo Santos", phone: "11909876543", cpfCnpj: "90123456789" },
    { name: "Camila Nascimento", phone: "11898765432", cpfCnpj: "01234567890", email: "camila@email.com" },
    { name: "Diego Barbosa", phone: "11887654321", cpfCnpj: "11223344556" },
    { name: "Beatriz Carvalho", phone: "11876543210", cpfCnpj: "22334455667", email: "beatriz@email.com" },
    { name: "Thiago Pereira", phone: "11865432109", cpfCnpj: "33445566778" },
    { name: "Amanda Ribeiro", phone: "11854321098", cpfCnpj: "44556677889", email: "amanda@email.com" },
    { name: "Gustavo Martins", phone: "11843210987", cpfCnpj: "55667788990" },
  ];
  const customers = await Promise.all(customerData.map(c => prisma.customer.create({ data: c })));
  console.log("✅ Customers created");

  // Vehicles
  const vehicleData = [
    { customerId: customers[0].id, plate: "ABC1D23", brand: "Fiat", model: "Argo", year: 2022, color: "Branco" },
    { customerId: customers[0].id, plate: "DEF2G34", brand: "VW", model: "Golf", year: 2020, color: "Preto" },
    { customerId: customers[1].id, plate: "GHI3H45", brand: "Chevrolet", model: "Onix", year: 2023, color: "Prata" },
    { customerId: customers[2].id, plate: "JKL4I56", brand: "Honda", model: "Civic", year: 2021, color: "Cinza" },
    { customerId: customers[3].id, plate: "MNO5J67", brand: "Toyota", model: "Corolla", year: 2022, color: "Branco" },
    { customerId: customers[4].id, plate: "PQR6K78", brand: "Hyundai", model: "HB20", year: 2023, color: "Vermelho" },
    { customerId: customers[5].id, plate: "STU7L89", brand: "Fiat", model: "Pulse", year: 2022, color: "Azul" },
    { customerId: customers[6].id, plate: "VWX8M90", brand: "VW", model: "T-Cross", year: 2023, color: "Cinza" },
    { customerId: customers[7].id, plate: "YZA9N01", brand: "Chevrolet", model: "Tracker", year: 2021, color: "Preto" },
    { customerId: customers[8].id, plate: "BCD0O12", brand: "Toyota", model: "Yaris", year: 2020, color: "Prata" },
    { customerId: customers[9].id, plate: "EFG1P23", brand: "Honda", model: "HR-V", year: 2023, color: "Branco" },
    { customerId: customers[10].id, plate: "HIJ2Q34", brand: "Fiat", model: "Mobi", year: 2022, color: "Vermelho" },
    { customerId: customers[11].id, plate: "KLM3R45", brand: "VW", model: "Polo", year: 2021, color: "Azul" },
    { customerId: customers[12].id, plate: "NOP4S56", brand: "Chevrolet", model: "Spin", year: 2020, color: "Prata" },
    { customerId: customers[13].id, plate: "QRS5T67", brand: "Hyundai", model: "Creta", year: 2023, color: "Branco" },
    { customerId: customers[14].id, plate: "TUV6U78", brand: "Toyota", model: "Hilux", year: 2022, color: "Preto" },
    { customerId: customers[0].id, plate: "WXY7V89", brand: "Fiat", model: "Strada", year: 2023, color: "Vermelho" },
    { customerId: customers[2].id, plate: "ZAB8W90", brand: "VW", model: "Saveiro", year: 2021, color: "Branco" },
    { customerId: customers[5].id, plate: "CDE9X01", brand: "Chevrolet", model: "S10", year: 2022, color: "Cinza" },
    { customerId: customers[8].id, plate: "FGH0Y12", brand: "Honda", model: "City", year: 2023, color: "Azul" },
  ];
  const vehicles = await Promise.all(vehicleData.map(v => prisma.vehicle.create({ data: v })));
  console.log("✅ Vehicles created");

  // Quotes
  const quoteStatuses = ["DRAFT", "SENT", "APPROVED", "REJECTED", "EXPIRED"] as const;
  for (let i = 0; i < 5; i++) {
    const st = serviceTypes[i % serviceTypes.length];
    const subtotal = st.basePrice * 1;
    await prisma.quote.create({
      data: {
        customerId: customers[i].id,
        quoteNumber: `ORC-${String(i + 1).padStart(4, "0")}`,
        status: quoteStatuses[i],
        totalAmount: subtotal,
        items: { create: [{ serviceTypeId: st.id, quantity: 1, unitPrice: st.basePrice, discount: 0, subtotal }] },
      },
    });
  }
  console.log("✅ Quotes created");

  // Contracts
  const contractStatuses = ["SIGNED", "PENDING_SIGNATURE", "DRAFT"] as const;
  for (let i = 0; i < 3; i++) {
    await prisma.contract.create({
      data: {
        customerId: customers[i].id,
        contractNumber: `CTR-${String(i + 1).padStart(4, "0")}`,
        status: contractStatuses[i],
        title: `Contrato de Serviço ${i + 1}`,
        content: `Este contrato estabelece os termos de prestação de serviços de lavagem automotiva entre AquaWash e ${customerData[i].name}. Serviços incluem lavagem mensal com desconto especial.`,
        signatureData: contractStatuses[i] === "SIGNED" ? "data:image/png;base64,signature" : null,
        signedAt: contractStatuses[i] === "SIGNED" ? new Date() : null,
      },
    });
  }
  console.log("✅ Contracts created");

  // Service Orders (20 orders over last 30 days)
  const statuses = ["COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED", "IN_PROGRESS", "WAITING"] as const;
  for (let i = 0; i < 20; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(); date.setDate(date.getDate() - daysAgo);
    const status = statuses[i % statuses.length];
    const st = serviceTypes[i % serviceTypes.length];
    const emp = i % 2 === 0 ? joao : maria;
    const subtotal = st.basePrice;

    const order = await prisma.serviceOrder.create({
      data: {
        customerId: customers[i % customers.length].id,
        vehicleId: vehicles[i % vehicles.length].id,
        employeeId: emp.id,
        orderNumber: `OS-${String(i + 1).padStart(4, "0")}`,
        status,
        totalAmount: subtotal,
        createdAt: date,
        startedAt: status !== "WAITING" ? date : null,
        completedAt: status === "COMPLETED" ? new Date(date.getTime() + st.estimatedMinutes * 60000) : null,
        items: { create: [{ serviceTypeId: st.id, quantity: 1, unitPrice: st.basePrice, subtotal }] },
      },
    });

    // Add queue entries for active orders
    if (["WAITING", "IN_PROGRESS"].includes(status)) {
      const maxPos = await prisma.queueEntry.aggregate({ _max: { position: true } });
      await prisma.queueEntry.create({ data: { serviceOrderId: order.id, position: (maxPos._max.position || 0) + 1 } });
    }
  }
  console.log("✅ Service orders created");

  // Config
  await prisma.carWashConfig.create({
    data: { businessName: "AquaWash Demo", slug: "aquawash-demo", simultaneousSlots: 2, phone: "11999990000", address: "Rua das Águas, 123 - Centro" },
  });
  console.log("✅ Config created");

  console.log("\n🎉 Seed completed successfully!");
  console.log("📧 Admin: admin@aquawash.com / password123");
  console.log("📧 João: joao@aquawash.com / password123");
  console.log("📧 Maria: maria@aquawash.com / password123");
  console.log("🌐 Public queue: /fila/aquawash-demo");
}

main().catch(console.error).finally(() => prisma.$disconnect());
