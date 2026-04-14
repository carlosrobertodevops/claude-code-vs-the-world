import { UserRepository } from "./user.repository";
import { CustomerRepository, VehicleRepository } from "./customer.repository";
import { ProductRepository } from "./product.repository";
import { ServiceOrderRepository } from "./service-order.repository";
import { QueueRepository } from "./queue.repository";
import { QuoteRepository } from "./quote.repository";
import { ContractRepository } from "./contract.repository";
import { UploadRepository } from "./upload.repository";

export const userRepository = new UserRepository();
export const customerRepository = new CustomerRepository();
export const vehicleRepository = new VehicleRepository();
export const productRepository = new ProductRepository();
export const serviceOrderRepository = new ServiceOrderRepository();
export const queueRepository = new QueueRepository();
export const quoteRepository = new QuoteRepository();
export const contractRepository = new ContractRepository();
export const uploadRepository = new UploadRepository();

export {
  UserRepository, CustomerRepository, VehicleRepository, ProductRepository,
  ServiceOrderRepository, QueueRepository, QuoteRepository, ContractRepository, UploadRepository,
};
