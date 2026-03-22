async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Erro desconhecido");
  return json.data;
}

export async function apiGet<T>(url: string): Promise<T> {
  return fetchAPI<T>(url);
}

export async function apiPost<T>(url: string, data: unknown): Promise<T> {
  return fetchAPI<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function apiPut<T>(url: string, data: unknown): Promise<T> {
  return fetchAPI<T>(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function apiPatch<T>(url: string, data: unknown): Promise<T> {
  return fetchAPI<T>(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function apiDelete<T>(url: string): Promise<T> {
  return fetchAPI<T>(url, { method: "DELETE" });
}

export async function apiUpload<T>(url: string, formData: FormData): Promise<T> {
  const res = await fetch(url, { method: "POST", body: formData });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Erro ao enviar arquivo");
  return json.data;
}
