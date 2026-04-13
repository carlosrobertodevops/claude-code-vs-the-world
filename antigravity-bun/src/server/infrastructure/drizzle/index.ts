import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../../../drizzle/schema';

// Cria a conexão usando a variável de ambiente correspondente ao ambiente de execução (Docker ou Local)
const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
