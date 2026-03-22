import "dotenv/config";
import { PrismaClient, Role, StockMovementType, QuoteStatus, ContractStatus, ServiceOrderStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Users
  const hash = await bcrypt.hash("admin123", 12);
  const empHash = await bcrypt.hash("func123", 12);

  const manager = await prisma.user.create({
    data: { name: "Admin AquaFlow", email: "admin@aquaflow.com", passwordHash: hash, role: Role.MANAGER, phone: "11999990000" },
  });
  const emp1 = await prisma.user.create({
    data: { name: "Carlos Silva", email: "carlos@aquaflow.com", passwordHash: empHash, role: Role.EMPLOYEE, phone: "11999991111" },
  });
  const emp2 = await prisma.user.create({
    data: { name: "Maria Souza", email: "maria@aquaflow.com", passwordHash: empHash, role: Role.EMPLOYEE, phone: "11999992222" },
  });

  // Customers
  const customerData = [
    { name: "Joao Pereira", phone: "11988881111", email: "joao@email.com", cpfCnpj: "12345678901" },
    { name: "Ana Costa", phone: "11988882222", email: "ana@email.com", cpfCnpj: "23456789012" },
    { name: "Pedro Santos", phone: "11988883333", email: "pedro@email.com" },
    { name: "Lucia Oliveira", phone: "11988884444", email: "lucia@email.com" },
    { name: "Roberto Almeida", phone: "11988885555", email: "roberto@email.com" },
    { name: "Fernanda Lima", phone: "11988886666", email: "fernanda@email.com", cpfCnpj: "45678901234" },
    { name: "Marcos Ferreira", phone: "11988887777" },
    { name: "Juliana Martins", phone: "11988888888", email: "juliana@email.com" },
    { name: "Ricardo Barbosa", phone: "11988889999" },
    { name: "Camila Rocha", phone: "11988880000", email: "camila@email.com" },
    { name: "Thiago Cardoso", phone: "11977771111" },
    { name: "Patricia Gomes", phone: "11977772222", email: "patricia@email.com" },
    { name: "Eduardo Dias", phone: "11977773333" },
    { name: "Isabela Moreira", phone: "11977774444", email: "isabela@email.com" },
    { name: "Gabriel Correia", phone: "11977775555" },
  ];
  const customers = await Promise.all(customerData.map((c) => prisma.customer.create({ data: c })));

  // Vehicles
  const vehicleData = [
    { customerId: customers[0].id, plate: "ABC1D23", brand: "Toyota", model: "Corolla", year: 2022, color: "Prata" },
    { customerId: customers[0].id, plate: "DEF4G56", brand: "Honda", model: "Civic", year: 2021, color: "Preto" },
    { customerId: customers[1].id, plate: "GHI7H89", brand: "VW", model: "Golf", year: 2023, color: "Branco" },
    { customerId: customers[2].id, plate: "JKL0A12", brand: "Hyundai", model: "HB20", year: 2020, color: "Vermelho" },
    { customerId: customers[3].id, plate: "MNO3B45", brand: "Chevrolet", model: "Onix", year: 2022, color: "Azul" },
    { customerId: customers[4].id, plate: "PQR6C78", brand: "Ford", model: "Ka", year: 2019, color: "Prata" },
    { customerId: customers[5].id, plate: "STU9D01", brand: "Fiat", model: "Argo", year: 2023, color: "Branco" },
    { customerId: customers[6].id, plate: "VWX2E34", brand: "Jeep", model: "Compass", year: 2022, color: "Preto" },
    { customerId: customers[7].id, plate: "YZA5F67", brand: "Nissan", model: "Kicks", year: 2021, color: "Cinza" },
    { customerId: customers[8].id, plate: "BCD8G90", brand: "Renault", model: "Kwid", year: 2020, color: "Vermelho" },
    { customerId: customers[9].id, plate: "EFG1H23", brand: "Toyota", model: "Yaris", year: 2023, color: "Branco" },
    { customerId: customers[10].id, plate: "HIJ4I56", brand: "Honda", model: "HR-V", year: 2022, color: "Azul" },
    { customerId: customers[11].id, plate: "KLM7J89", brand: "VW", model: "T-Cross", year: 2021, color: "Cinza" },
    { customerId: customers[12].id, plate: "NOP0K12", brand: "Hyundai", model: "Creta", year: 2023, color: "Preto" },
    { customerId: customers[13].id, plate: "QRS3L45", brand: "Chevrolet", model: "Tracker", year: 2022, color: "Branco" },
    { customerId: customers[14].id, plate: "TUV6M78", brand: "Toyota", model: "SW4", year: 2021, color: "Prata" },
    { customerId: customers[0].id, plate: "WXY9N01", brand: "BMW", model: "X1", year: 2023, color: "Preto" },
    { customerId: customers[1].id, plate: "ZAB2O34", brand: "Mercedes", model: "GLA", year: 2022, color: "Branco" },
    { customerId: customers[2].id, plate: "CDE5P67", brand: "Audi", model: "Q3", year: 2023, color: "Cinza" },
    { customerId: customers[3].id, plate: "FGH8Q90", brand: "Fiat", model: "Pulse", year: 2022, color: "Vermelho" },
  ];
  const vehicles = await Promise.all(vehicleData.map((v) => prisma.vehicle.create({ data: v })));

  // Products
  const productData = [
    { name: "Shampoo Automotivo 5L", unit: "un", currentStock: 25, minimumStock: 5, costPrice: 35.0 },
    { name: "Cera Liquida 500ml", unit: "un", currentStock: 15, minimumStock: 3, costPrice: 28.0 },
    { name: "Desengraxante 5L", unit: "un", currentStock: 10, minimumStock: 3, costPrice: 42.0 },
    { name: "Silicone em Gel 500ml", unit: "un", currentStock: 20, minimumStock: 5, costPrice: 18.0 },
    { name: "Pretinho para Pneu 1L", unit: "un", currentStock: 30, minimumStock: 10, costPrice: 12.0 },
    { name: "Flanela Microfibra", unit: "un", currentStock: 50, minimumStock: 10, costPrice: 8.0 },
    { name: "Limpa Vidros 500ml", unit: "un", currentStock: 18, minimumStock: 5, costPrice: 15.0 },
    { name: "Aromatizante 100ml", unit: "un", currentStock: 40, minimumStock: 10, costPrice: 6.0 },
    { name: "Estopa 500g", unit: "pct", currentStock: 12, minimumStock: 3, costPrice: 10.0 },
    { name: "Impermeabilizante Tecido 500ml", unit: "un", currentStock: 8, minimumStock: 2, costPrice: 55.0 },
  ];
  const products = await Promise.all(productData.map((p) => prisma.product.create({ data: p })));

  // Stock Movements
  for (const product of products) {
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        userId: manager.id,
        type: StockMovementType.IN,
        quantity: product.currentStock,
        unitCost: product.costPrice,
        notes: "Estoque inicial",
      },
    });
  }

  // Service Types
  const stData = [
    { name: "Lavagem Simples", basePrice: 40.0, estimatedMinutes: 30 },
    { name: "Lavagem Completa", basePrice: 80.0, estimatedMinutes: 60 },
    { name: "Lavagem Detalhada", basePrice: 150.0, estimatedMinutes: 120 },
    { name: "Polimento", basePrice: 200.0, estimatedMinutes: 180 },
    { name: "Cristalizacao", basePrice: 350.0, estimatedMinutes: 240 },
    { name: "Higienizacao Interna", basePrice: 120.0, estimatedMinutes: 90 },
    { name: "Limpeza de Motor", basePrice: 100.0, estimatedMinutes: 60 },
    { name: "Impermeabilizacao de Estofados", basePrice: 250.0, estimatedMinutes: 180 },
  ];
  const serviceTypes = await Promise.all(stData.map((s) => prisma.serviceType.create({ data: s })));

  // Quotes
  const quoteStatuses: QuoteStatus[] = [QuoteStatus.DRAFT, QuoteStatus.SENT, QuoteStatus.APPROVED, QuoteStatus.REJECTED, QuoteStatus.SENT];
  for (let i = 0; i < 5; i++) {
    const customer = customers[i];
    const st = serviceTypes[i % serviceTypes.length];
    const quantity = i + 1;
    const unitPrice = st.basePrice;
    const subtotal = quantity * unitPrice;
    await prisma.quote.create({
      data: {
        customerId: customer.id,
        quoteNumber: `ORC-${String(i + 1).padStart(4, "0")}`,
        status: quoteStatuses[i],
        totalAmount: subtotal,
        notes: `Orcamento para ${customer.name}`,
        items: {
          create: [{ serviceTypeId: st.id, quantity, unitPrice, discount: 0, subtotal }],
        },
      },
    });
  }

  // Contracts
  const contractStatuses: ContractStatus[] = [ContractStatus.DRAFT, ContractStatus.PENDING_SIGNATURE, ContractStatus.SIGNED];
  for (let i = 0; i < 3; i++) {
    await prisma.contract.create({
      data: {
        customerId: customers[i].id,
        contractNumber: `CTR-${String(i + 1).padStart(4, "0")}`,
        status: contractStatuses[i],
        title: `Contrato Mensal - ${customers[i].name}`,
        content: `Contrato de prestacao de servicos de lavagem automotiva para ${customers[i].name}. Valor mensal de R$ ${(i + 1) * 200}.00. Vigencia de 12 meses.`,
        signedAt: contractStatuses[i] === ContractStatus.SIGNED ? new Date() : null,
        signatureIp: contractStatuses[i] === ContractStatus.SIGNED ? "127.0.0.1" : null,
      },
    });
  }

  // Service Orders
  const now = new Date();
  const soStatuses: ServiceOrderStatus[] = [
    ServiceOrderStatus.COMPLETED,
    ServiceOrderStatus.COMPLETED,
    ServiceOrderStatus.COMPLETED,
    ServiceOrderStatus.COMPLETED,
    ServiceOrderStatus.COMPLETED,
    ServiceOrderStatus.COMPLETED,
    ServiceOrderStatus.COMPLETED,
    ServiceOrderStatus.COMPLETED,
    ServiceOrderStatus.COMPLETED,
    ServiceOrderStatus.COMPLETED,
    ServiceOrderStatus.COMPLETED,
    ServiceOrderStatus.COMPLETED,
    ServiceOrderStatus.COMPLETED,
    ServiceOrderStatus.COMPLETED,
    ServiceOrderStatus.COMPLETED,
    ServiceOrderStatus.IN_PROGRESS,
    ServiceOrderStatus.IN_PROGRESS,
    ServiceOrderStatus.WAITING,
    ServiceOrderStatus.WAITING,
    ServiceOrderStatus.WAITING,
  ];

  let queuePosition = 1;
  for (let i = 0; i < 20; i++) {
    const customer = customers[i % customers.length];
    const vehicle = vehicles[i % vehicles.length];
    const employee = i % 2 === 0 ? emp1 : emp2;
    const st = serviceTypes[i % serviceTypes.length];
    const status = soStatuses[i];
    const daysAgo = Math.max(0, 20 - i);
    const createdAt = new Date(now.getTime() - daysAgo * 86400000);

    const so = await prisma.serviceOrder.create({
      data: {
        customerId: customer.id,
        vehicleId: vehicle.id,
        employeeId: employee.id,
        orderNumber: `OS-${String(i + 1).padStart(4, "0")}`,
        status,
        totalAmount: st.basePrice,
        notes: i % 3 === 0 ? "Cliente solicitou atencao especial" : null,
        startedAt: status !== ServiceOrderStatus.WAITING ? createdAt : null,
        completedAt: status === ServiceOrderStatus.COMPLETED ? new Date(createdAt.getTime() + st.estimatedMinutes * 60000) : null,
        createdAt,
        items: {
          create: [{
            serviceTypeId: st.id,
            description: st.name,
            quantity: 1,
            unitPrice: st.basePrice,
            subtotal: st.basePrice,
          }],
        },
      },
    });

    // Add queue entries for non-completed orders
    if (status === ServiceOrderStatus.WAITING || status === ServiceOrderStatus.IN_PROGRESS) {
      await prisma.queueEntry.create({
        data: {
          serviceOrderId: so.id,
          position: queuePosition++,
        },
      });
    }
  }

  // CarWashConfig
  await prisma.carWashConfig.create({
    data: {
      businessName: "AquaFlow Lava-Jato",
      slug: "aquaflow",
      simultaneousSlots: 2,
      phone: "11999990000",
      address: "Rua das Aguas, 123 - Centro",
      publicQueueEnabled: true,
      defaultMessage: "Ola {nome}, seu veiculo {placa} esta pronto! Venha buscar.",
    },
  });

  console.log("Seed completed!");
  console.log("Manager login: admin@aquaflow.com / admin123");
  console.log("Employee login: carlos@aquaflow.com / func123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
