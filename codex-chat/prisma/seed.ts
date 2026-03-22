import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient, ContractStatus, QuoteStatus, ServiceOrderStatus, StockMovementType, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { subDays, subHours, addMinutes } from "date-fns";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? "",
  }),
});

const money = (value: number) => new Prisma.Decimal(value.toFixed(2));

async function main() {
  await prisma.queueEntry.deleteMany();
  await prisma.servicePhoto.deleteMany();
  await prisma.loyaltyTransaction.deleteMany();
  await prisma.serviceOrderItem.deleteMany();
  await prisma.serviceOrder.deleteMany();
  await prisma.quoteItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.vehiclePhoto.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.serviceType.deleteMany();
  await prisma.fileUpload.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.carWashConfig.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 12);

  const manager = await prisma.user.create({
    data: {
      name: "Administrador JatoFlow",
      email: "admin@jatoflow.com",
      passwordHash,
      role: UserRole.MANAGER,
      phone: "11999990000",
    },
  });

  const employees = await prisma.$transaction([
    prisma.user.create({
      data: {
        name: "Joao Martins",
        email: "joao@jatoflow.com",
        passwordHash,
        role: UserRole.EMPLOYEE,
        phone: "11999990001",
      },
    }),
    prisma.user.create({
      data: {
        name: "Maria Alves",
        email: "maria@jatoflow.com",
        passwordHash,
        role: UserRole.EMPLOYEE,
        phone: "11999990002",
      },
    }),
  ]);

  const config = await prisma.carWashConfig.create({
    data: {
      businessName: "JatoFlow Centro",
      slug: "jatoflow-centro",
      simultaneousSlots: 3,
      phone: "1133332211",
      address: "Av. dos Lavadores, 450 - Centro, Sao Paulo/SP",
      primaryColor: "#0b132b",
      queueRefreshSeconds: 30,
      loyaltyEnabled: true,
    },
  });

  const productSeed = [
    ["Shampoo Automotivo", "L", 120, 20, 18.5],
    ["Cera Liquida", "L", 45, 8, 32.9],
    ["Silicone Gel", "kg", 28, 5, 24.4],
    ["Desengraxante", "L", 62, 10, 21.9],
    ["Pano de Microfibra", "un", 180, 40, 6.2],
    ["Pretinho para Pneu", "L", 34, 6, 19.9],
    ["Aromatizante", "un", 90, 15, 8.5],
    ["Escova de Detalhamento", "un", 22, 4, 12.8],
    ["Limpa Vidros", "L", 56, 12, 14.7],
    ["Removedor de Chuva Acida", "L", 18, 5, 39.9],
  ] as const;

  await prisma.product.createMany({
    data: productSeed.map(([name, unit, currentStock, minimumStock, costPrice]) => ({
      name,
      unit,
      currentStock: money(currentStock),
      minimumStock: money(minimumStock),
      costPrice: money(costPrice),
    })),
  });

  const products = (
    await Promise.all(
      productSeed.map(async ([name]) => prisma.product.findFirstOrThrow({ where: { name } })),
    )
  ).filter(Boolean);

  await prisma.stockMovement.createMany({
    data: products.map((product, index) => ({
      productId: product.id,
      userId: manager.id,
      type: StockMovementType.IN,
      quantity: money(productSeed[index][2]),
      unitCost: money(productSeed[index][4]),
      note: "Carga inicial de estoque",
    })),
  });

  const serviceTypeSeed = [
    ["Lavagem Simples", 45, 35],
    ["Lavagem Completa", 75, 55],
    ["Lavagem Premium", 120, 80],
    ["Polimento Tecnico", 280, 150],
    ["Higienizacao Interna", 160, 95],
    ["Cristalizacao", 340, 180],
    ["Lavagem de Motor", 95, 45],
    ["Enceramento Express", 65, 30],
  ] as const;

  await prisma.serviceType.createMany({
    data: serviceTypeSeed.map(([name, basePrice, estimatedMinutes]) => ({
      name,
      basePrice: money(basePrice),
      estimatedMinutes,
    })),
  });

  const serviceTypes = await Promise.all(
    serviceTypeSeed.map(async ([name]) => prisma.serviceType.findUniqueOrThrow({ where: { name } })),
  );

  const customerSeed = [
    ["Ana Carolina Souza", "ana.souza@email.com", "11987770001", "12345678901", "Rua Bela Vista, 91 - Sao Paulo/SP"],
    ["Bruno Mendes Lima", "bruno.lima@email.com", "11987770002", "12345678902", "Rua Domingos de Moraes, 118 - Sao Paulo/SP"],
    ["Camila Ribeiro", "camila.ribeiro@email.com", "11987770003", "12345678903", "Rua Augusta, 542 - Sao Paulo/SP"],
    ["Daniel Rocha", "daniel.rocha@email.com", "11987770004", "12345678904", "Rua da Mooca, 211 - Sao Paulo/SP"],
    ["Eduarda Nunes", "eduarda.nunes@email.com", "11987770005", "12345678905", "Rua Vergueiro, 440 - Sao Paulo/SP"],
    ["Felipe Gomes", "felipe.gomes@email.com", "11987770006", "12345678906", "Rua Tuiuti, 82 - Sao Paulo/SP"],
    ["Gabriela Santos", "gabriela.santos@email.com", "11987770007", "12345678907", "Av. Paulista, 1880 - Sao Paulo/SP"],
    ["Henrique Costa", "henrique.costa@email.com", "11987770008", "12345678908", "Rua da Consolacao, 650 - Sao Paulo/SP"],
    ["Isabela Fernandes", "isabela.fernandes@email.com", "11987770009", "12345678909", "Rua Pamplona, 31 - Sao Paulo/SP"],
    ["Joao Pedro Barros", "joaobarros@email.com", "11987770010", "12345678910", "Rua Cerro Cora, 700 - Sao Paulo/SP"],
    ["Karen Silva", "karen.silva@email.com", "11987770011", "12345678911", "Rua Harmonia, 120 - Sao Paulo/SP"],
    ["Lucas Araujo", "lucas.araujo@email.com", "11987770012", "12345678912", "Rua Cardeal Arcoverde, 451 - Sao Paulo/SP"],
    ["Marina Prado", "marina.prado@email.com", "11987770013", "12345678913", "Rua Fidalga, 100 - Sao Paulo/SP"],
    ["Nicolas Teixeira", "nicolas.teixeira@email.com", "11987770014", "12345678914", "Rua dos Pinheiros, 200 - Sao Paulo/SP"],
    ["Patricia Oliveira", "patricia.oliveira@email.com", "11987770015", "12345678915", "Rua Melo Alves, 308 - Sao Paulo/SP"],
  ] as const;

  await prisma.customer.createMany({
    data: customerSeed.map(([name, email, phone, cpfCnpj, address]) => ({
      name,
      email,
      phone,
      cpfCnpj,
      address,
    })),
  });

  const customers = await Promise.all(
    customerSeed.map(async ([, , , cpfCnpj]) =>
      prisma.customer.findUniqueOrThrow({
        where: { cpfCnpj },
      }),
    ),
  );

  const vehicleSeed = [
    ["ABC1D23", "Fiat", "Argo", 2020, "Branco"],
    ["BRA2E34", "Volkswagen", "Gol", 2019, "Prata"],
    ["CAR3F45", "Chevrolet", "Onix", 2022, "Preto"],
    ["DYN4G56", "Honda", "Civic", 2021, "Cinza"],
    ["ECO5H67", "Toyota", "Corolla", 2023, "Azul"],
    ["FOX6I78", "Fiat", "Pulse", 2024, "Vermelho"],
    ["GAM7J89", "Volkswagen", "Polo", 2020, "Branco"],
    ["HEX8K90", "Chevrolet", "Tracker", 2021, "Prata"],
    ["ION9L01", "Honda", "HR-V", 2022, "Grafite"],
    ["JET0M12", "Toyota", "Yaris", 2018, "Preto"],
    ["KAP1N23", "Fiat", "Toro", 2022, "Cinza"],
    ["LUX2O34", "Volkswagen", "Nivus", 2024, "Prata"],
    ["MAX3P45", "Chevrolet", "Cruze", 2019, "Branco"],
    ["NEX4Q56", "Honda", "City", 2023, "Azul"],
    ["ORB5R67", "Toyota", "Hilux", 2021, "Preto"],
    ["PRO6S78", "Fiat", "Mobi", 2020, "Vermelho"],
    ["QIK7T89", "Volkswagen", "T-Cross", 2023, "Cinza"],
    ["RAY8U90", "Chevrolet", "Spin", 2018, "Branco"],
    ["SUN9V01", "Honda", "Fit", 2017, "Prata"],
    ["TOP0W12", "Toyota", "SW4", 2024, "Preto"],
  ] as const;

  await prisma.vehicle.createMany({
    data: vehicleSeed.map(([plate, brand, model, year, color], index) => ({
      customerId: customers[index % customers.length].id,
      plate,
      brand,
      model,
      year,
      color,
    })),
  });

  const vehicles = await Promise.all(
    vehicleSeed.map(async ([plate]) => prisma.vehicle.findUniqueOrThrow({ where: { plate } })),
  );

  const quoteStatuses = [QuoteStatus.DRAFT, QuoteStatus.SENT, QuoteStatus.APPROVED, QuoteStatus.REJECTED, QuoteStatus.EXPIRED];
  for (let index = 0; index < 5; index += 1) {
    const customer = customers[index];
    const serviceA = serviceTypes[index % serviceTypes.length];
    const serviceB = serviceTypes[(index + 2) % serviceTypes.length];
    const subtotalA = Number(serviceA.basePrice);
    const subtotalB = Number(serviceB.basePrice) - 10;

    await prisma.quote.create({
      data: {
        customerId: customer.id,
        quoteNumber: `ORC-${String(index + 1).padStart(4, "0")}`,
        status: quoteStatuses[index],
        notes: "Orcamento gerado automaticamente para demonstracao.",
        totalAmount: money(subtotalA + subtotalB),
        expiresAt: addMinutes(new Date(), (index + 3) * 1440),
        pdfUrl: `/api/orcamentos/seed-${index + 1}/pdf`,
        items: {
          create: [
            {
              serviceTypeId: serviceA.id,
              quantity: money(1),
              unitPrice: money(subtotalA),
              discount: money(0),
              subtotal: money(subtotalA),
            },
            {
              serviceTypeId: serviceB.id,
              quantity: money(1),
              unitPrice: money(Number(serviceB.basePrice)),
              discount: money(10),
              subtotal: money(subtotalB),
            },
          ],
        },
      },
    });
  }

  const contractTemplates = [
    {
      status: ContractStatus.SIGNED,
      title: "Plano Mensal Premium",
      content: "Contrato de prestacao de servicos recorrentes com duas lavagens premium e uma higienizacao interna por mes.",
      signatureData: "Assinado digitalmente por Ana Carolina Souza",
      signatureIp: "127.0.0.1",
      signedAt: subDays(new Date(), 12),
    },
    {
      status: ContractStatus.PENDING_SIGNATURE,
      title: "Plano Corporativo Frotas",
      content: "Contrato corporativo para atendimento quinzenal de frota com valores progressivos por volume.",
      signatureData: null,
      signatureIp: null,
      signedAt: null,
    },
    {
      status: ContractStatus.DRAFT,
      title: "Plano Executivo Individual",
      content: "Rascunho de contrato para cliente individual com beneficios de fidelidade e prioridade na fila.",
      signatureData: null,
      signatureIp: null,
      signedAt: null,
    },
  ] as const;

  for (let index = 0; index < contractTemplates.length; index += 1) {
    const template = contractTemplates[index];
    await prisma.contract.create({
      data: {
        customerId: customers[index].id,
        contractNumber: `CTR-${String(index + 1).padStart(4, "0")}`,
        status: template.status,
        title: template.title,
        content: template.content,
        signatureData: template.signatureData ?? undefined,
        signatureIp: template.signatureIp ?? undefined,
        signedAt: template.signedAt ?? undefined,
        pdfUrl: `/api/contratos/seed-${index + 1}/pdf`,
      },
    });
  }

  const waitingOrderIds: { id: string; estimatedMinutes: number; createdAt: Date }[] = [];

  for (let index = 0; index < 20; index += 1) {
    const customer = customers[index % customers.length];
    const vehicle = vehicles[index % vehicles.length];
    const employee = employees[index % employees.length];
    const service = serviceTypes[index % serviceTypes.length];
    const supportProduct = products[index % products.length];
    const createdAt = index < 4 ? subHours(new Date(), 4 - index) : subDays(new Date(), 30 - index);

    let status: ServiceOrderStatus;
    if (index < 4) {
      status = ServiceOrderStatus.WAITING;
    } else if (index < 7) {
      status = ServiceOrderStatus.IN_PROGRESS;
    } else if (index < 18) {
      status = ServiceOrderStatus.COMPLETED;
    } else {
      status = ServiceOrderStatus.CANCELLED;
    }

    const servicePrice = Number(service.basePrice);
    const productPrice = Number(supportProduct.costPrice) * 1.7;
    const total = servicePrice + productPrice;
    const startedAt = status === ServiceOrderStatus.WAITING ? null : addMinutes(createdAt, 20);
    const completedAt = status === ServiceOrderStatus.COMPLETED ? addMinutes(startedAt ?? createdAt, service.estimatedMinutes) : null;

    const order = await prisma.serviceOrder.create({
      data: {
        customerId: customer.id,
        vehicleId: vehicle.id,
        employeeId: status === ServiceOrderStatus.WAITING ? null : employee.id,
        orderNumber: `OS-${String(index + 1).padStart(4, "0")}`,
        status,
        totalAmount: money(total),
        startedAt: startedAt ?? undefined,
        completedAt: completedAt ?? undefined,
        createdAt,
        notes: status === ServiceOrderStatus.CANCELLED ? "Cliente reagendou o servico." : "Servico gerado para a base demonstrativa.",
        items: {
          create: [
            {
              serviceTypeId: service.id,
              description: service.name,
              quantity: money(1),
              unitPrice: money(servicePrice),
              subtotal: money(servicePrice),
            },
            {
              productId: supportProduct.id,
              description: `Uso interno de ${supportProduct.name}`,
              quantity: money(1),
              unitPrice: money(productPrice),
              subtotal: money(productPrice),
            },
          ],
        },
      },
    });

    if (status === ServiceOrderStatus.WAITING) {
      waitingOrderIds.push({ id: order.id, estimatedMinutes: service.estimatedMinutes, createdAt });
    }

    if (status === ServiceOrderStatus.COMPLETED) {
      const points = Math.floor(total / 10);
      await prisma.loyaltyTransaction.create({
        data: {
          customerId: customer.id,
          serviceOrderId: order.id,
          points,
          type: "EARNED",
          description: `Pontos gerados pela OS ${order.orderNumber}`,
          createdAt: completedAt ?? new Date(),
        },
      });

      await prisma.customer.update({
        where: { id: customer.id },
        data: { loyaltyPoints: { increment: points } },
      });
    }
  }

  const sortedQueue = waitingOrderIds.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  let rollingStart = new Date();
  for (let index = 0; index < sortedQueue.length; index += 1) {
    const queue = sortedQueue[index];
    const estimatedStart = addMinutes(rollingStart, Math.floor((index / config.simultaneousSlots) * queue.estimatedMinutes));
    const estimatedEnd = addMinutes(estimatedStart, queue.estimatedMinutes);
    rollingStart = estimatedStart;

    await prisma.queueEntry.create({
      data: {
        serviceOrderId: queue.id,
        position: index + 1,
        estimatedStart,
        estimatedEnd,
      },
    });
  }

  console.log("Seed finalizado com sucesso para o JatoFlow.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
