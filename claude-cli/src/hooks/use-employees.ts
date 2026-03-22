import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateUserInput, UpdateUserInput } from "@/lib/validations/user";

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EmployeesResponse {
  success: true;
  data: Employee[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface EmployeeResponse {
  success: true;
  data: Employee;
}

interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

async function fetchEmployees(search?: string): Promise<EmployeesResponse> {
  const params = new URLSearchParams({ limit: "100" });
  if (search) params.set("search", search);

  const res = await fetch(`/api/funcionarios?${params.toString()}`);
  const json = await res.json();

  if (!res.ok) {
    const errorData = json as ApiError;
    throw new Error(errorData.error?.message || "Erro ao buscar funcionarios");
  }

  return json as EmployeesResponse;
}

async function createEmployee(data: CreateUserInput): Promise<EmployeeResponse> {
  const res = await fetch("/api/funcionarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    const errorData = json as ApiError;
    throw new Error(errorData.error?.message || "Erro ao criar funcionario");
  }

  return json as EmployeeResponse;
}

async function updateEmployee({
  id,
  data,
}: {
  id: string;
  data: UpdateUserInput;
}): Promise<EmployeeResponse> {
  const res = await fetch(`/api/funcionarios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    const errorData = json as ApiError;
    throw new Error(errorData.error?.message || "Erro ao atualizar funcionario");
  }

  return json as EmployeeResponse;
}

async function deleteEmployee(id: string): Promise<void> {
  const res = await fetch(`/api/funcionarios/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const json = await res.json();
    const errorData = json as ApiError;
    throw new Error(errorData.error?.message || "Erro ao remover funcionario");
  }
}

export function useEmployees(search?: string) {
  return useQuery({
    queryKey: ["employees", search],
    queryFn: () => fetchEmployees(search),
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}
