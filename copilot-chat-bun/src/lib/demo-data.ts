import type {
  CarWashConfig,
  Contract,
  Customer,
  Product,
  QueueEntry,
  Quote,
  ReportRow,
  ServiceOrder,
  ServiceType,
  User,
  Vehicle,
} from "@/types/domain";

const passwordHash =
  "$2b$12$yH0OTZpxL50Y0Dp5xcEZd.5jxrdD5mLYu1MDiDKhgf7EJgq9ylVvS";

export const carWashConfig: CarWashConfig = {
  id: "cfg_lavaflow",
  name: "LavaFlow Centro",
  slug: "lavaflow-centro",
  address: "Av. Central, 245 - Centro, Fortaleza/CE",
  themeAccent: "#58e1c1",
  darkBackground: "#14161f",
  lightBackground: "#f3f6fb",
  publicQueueEnabled: true,
};

export const users: User[] = [
  {
    id: "usr_admin",
    name: "Ana Paula Gestora",
    email: "admin@lavaflow.com",
    role: "MANAGER",
    passwordHash,
  },
  {
    id: "usr_joao",
    name: "Joao Silva",
    email: "joao@lavaflow.com",
    role: "EMPLOYEE",
    passwordHash,
  },
  {
    id: "usr_maria",
    name: "Maria Costa",
    email: "maria@lavaflow.com",
    role: "EMPLOYEE",
    passwordHash,
  },
];

export const customers: Customer[] = [
  {
    id: "cus_1",
    name: "Carlos Eduardo",
    document: "123.456.789-00",
    phone: "(85) 99999-1111",
    email: "carlos@email.com",
    address: "Rua das Flores, 120",
  },
  {
    id: "cus_2",
    name: "Fernanda Lima",
    document: "987.654.321-00",
    phone: "(85) 98888-2222",
    email: "fernanda@email.com",
    address: "Rua do Sol, 88",
  },
  {
    id: "cus_3",
    name: "Ricardo Alves",
    document: "456.123.789-00",
    phone: "(85) 97777-3333",
    email: "ricardo@email.com",
    address: "Av. Beira Mar, 502",
  },
];

export const vehicles: Vehicle[] = [
  {
    id: "veh_1",
    customerId: "cus_1",
    brand: "Toyota",
    model: "Corolla",
    plate: "ABC-1D23",
    color: "Preto",
  },
  {
    id: "veh_2",
    customerId: "cus_2",
    brand: "Jeep",
    model: "Compass",
    plate: "XYZ-9K87",
    color: "Branco",
  },
  {
    id: "veh_3",
    customerId: "cus_3",
    brand: "Volkswagen",
    model: "Nivus",
    plate: "LMN-4P56",
    color: "Azul",
  },
];

export const products: Product[] = [
  {
    id: "prd_1",
    name: "Shampoo Premium",
    sku: "LAV-SHA-001",
    unit: "L",
    stock: 14,
    minimumStock: 10,
    unitPrice: 38,
  },
  {
    id: "prd_2",
    name: "Cera Liquida",
    sku: "LAV-CER-002",
    unit: "L",
    stock: 7,
    minimumStock: 8,
    unitPrice: 52,
  },
  {
    id: "prd_3",
    name: "Pano de Microfibra",
    sku: "LAV-PAN-003",
    unit: "un",
    stock: 36,
    minimumStock: 20,
    unitPrice: 12,
  },
];

export const serviceTypes: ServiceType[] = [
  {
    id: "srv_1",
    name: "Lavagem simples",
    description: "Lavagem externa completa com secagem.",
    basePrice: 45,
    durationMinutes: 40,
  },
  {
    id: "srv_2",
    name: "Lavagem completa",
    description: "Lavagem externa, interna e aspiracao.",
    basePrice: 80,
    durationMinutes: 70,
  },
  {
    id: "srv_3",
    name: "Cristalizacao",
    description: "Tratamento de pintura e acabamento.",
    basePrice: 180,
    durationMinutes: 120,
  },
];

export const quotes: Quote[] = [
  {
    id: "quo_1",
    customerId: "cus_1",
    vehicleId: "veh_1",
    status: "SENT",
    validUntil: "2026-04-20T18:00:00.000Z",
    total: 260,
    items: [
      {
        id: "qit_1",
        quoteId: "quo_1",
        description: "Lavagem completa",
        quantity: 1,
        unitPrice: 80,
      },
      {
        id: "qit_2",
        quoteId: "quo_1",
        description: "Cristalizacao",
        quantity: 1,
        unitPrice: 180,
      },
    ],
  },
  {
    id: "quo_2",
    customerId: "cus_2",
    vehicleId: "veh_2",
    status: "APPROVED",
    validUntil: "2026-04-18T18:00:00.000Z",
    total: 110,
    items: [
      {
        id: "qit_3",
        quoteId: "quo_2",
        description: "Lavagem completa",
        quantity: 1,
        unitPrice: 80,
      },
      {
        id: "qit_4",
        quoteId: "quo_2",
        description: "Higienizacao de bancos",
        quantity: 1,
        unitPrice: 30,
      },
    ],
  },
];

export const contracts: Contract[] = [
  {
    id: "ctr_1",
    quoteId: "quo_2",
    customerId: "cus_2",
    status: "SIGNED",
    signedAt: "2026-04-12T15:30:00.000Z",
    notes: "Contrato anual para frota leve.",
  },
  {
    id: "ctr_2",
    quoteId: "quo_1",
    customerId: "cus_1",
    status: "PENDING",
    notes: "Aguardando assinatura digital.",
  },
];

export const serviceOrders: ServiceOrder[] = [
  {
    id: "ord_1",
    customerId: "cus_1",
    vehicleId: "veh_1",
    assignedEmployeeId: "usr_joao",
    status: "IN_PROGRESS",
    createdAt: "2026-04-13T12:00:00.000Z",
    scheduledFor: "2026-04-13T13:30:00.000Z",
    total: 80,
    notes: "Cliente pediu foco no acabamento das rodas.",
    items: [
      {
        id: "oit_1",
        serviceOrderId: "ord_1",
        description: "Lavagem completa",
        quantity: 1,
        unitPrice: 80,
      },
    ],
  },
  {
    id: "ord_2",
    customerId: "cus_2",
    vehicleId: "veh_2",
    assignedEmployeeId: "usr_maria",
    status: "WAITING",
    createdAt: "2026-04-13T12:20:00.000Z",
    scheduledFor: "2026-04-13T14:10:00.000Z",
    total: 45,
    notes: "Retirada prevista para 15h.",
    items: [
      {
        id: "oit_2",
        serviceOrderId: "ord_2",
        description: "Lavagem simples",
        quantity: 1,
        unitPrice: 45,
      },
    ],
  },
  {
    id: "ord_3",
    customerId: "cus_3",
    vehicleId: "veh_3",
    assignedEmployeeId: "usr_joao",
    status: "DONE",
    createdAt: "2026-04-13T09:40:00.000Z",
    scheduledFor: "2026-04-13T10:00:00.000Z",
    total: 180,
    notes: "Aguardando entrega ao cliente.",
    items: [
      {
        id: "oit_3",
        serviceOrderId: "ord_3",
        description: "Cristalizacao",
        quantity: 1,
        unitPrice: 180,
      },
    ],
  },
];

export const queueEntries: QueueEntry[] = [
  {
    id: "que_1",
    serviceOrderId: "ord_1",
    position: 1,
    status: "WASHING",
    etaMinutes: 20,
    updatedAt: "2026-04-13T13:35:00.000Z",
  },
  {
    id: "que_2",
    serviceOrderId: "ord_2",
    position: 2,
    status: "QUEUED",
    etaMinutes: 45,
    updatedAt: "2026-04-13T13:32:00.000Z",
  },
  {
    id: "que_3",
    serviceOrderId: "ord_3",
    position: 3,
    status: "READY",
    etaMinutes: 0,
    updatedAt: "2026-04-13T13:00:00.000Z",
  },
];

export const reportRows: ReportRow[] = [
  { label: "Lavagem simples", value: 18 },
  { label: "Lavagem completa", value: 26 },
  { label: "Cristalizacao", value: 8 },
];
