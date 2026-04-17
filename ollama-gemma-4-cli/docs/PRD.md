# Product Requirements Document (PRD) - Micro-SaaS para Lava-Jatos

## 1. Visão Geral
O objetivo deste projeto é desenvolver um Micro-SaaS especializado na gestão de lava-jatos, focando na eficiência operacional, controle de fila em tempo real e gestão financeira simplificada. O sistema visa substituir anotações manuais por um fluxo digital fluido.

## 2. Personas
- **Manager (Gestor):** Proprietário do lava-jato. Precisa de visão macro de faturamento, gestão de funcionários, contratos e relatórios de performance.
- **Employee (Funcionário):** Operador do lava-jato. Responsável por atualizar o status dos serviços, gerenciar a fila e registrar a conclusão de ordens de serviço.
- **Customer (Cliente):** Usuário final. Deseja acompanhar sua posição na fila e receber notificações sobre a conclusão do serviço.

## 3. Requisitos Funcionais

### 3.1 Core Features
- **Gestão de Fila Pública:** Visualização em tempo real da posição do veículo na fila.
- **Ordens de Serviço (OS):** Registro de veículos, serviços contratados, valor e status (Aguardando, Em Andamento, Finalizado).
- **Controle de Acesso:** Autenticação robusta com níveis de permissão (RBAC) para Gerentes e Funcionários.
- **Gestão Financeira:** Controle de pagamentos e faturamento bruto.
- **Gestão de Inventário:** Controle de produtos utilizados nos serviços.

### 3.2 Fluxos Principais
- **Entrada de Veículo:** Registro do cliente/carro $\rightarrow$ Seleção de serviços $\rightarrow$ Inserção na fila.
- **Execução do Serviço:** Funcionário assume a OS $\rightarrow$ Altera status para "Em Andamento" $\rightarrow$ Marca como "Finalizado".
- **Pagamento e Saída:** Validação do pagamento $\rightarrow$ Baixa na OS $\rightarrow$ Veículo liberado.

## 4. Requisitos Não Funcionais
- **Performance:** Alta responsividade na atualização da fila (tempo real).
- **Stack Tecnológica:** Uso de Bun (runtime), Elysia (backend), Next.js (frontend), Drizzle ORM e PostgreSQL.
- **Sustentabilidade:** Código fonte em inglês, UI em Português (BR).
- **Infraestrutura:** Dockerização completa para deploy simplificado.

## 5. Critérios de Sucesso
- Redução do tempo de espera percebido pelo cliente via transparência da fila.
- Eliminação de erros de registro manual de serviços.
- Relatórios financeiros precisos gerados automaticamente.
