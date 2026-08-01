export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "https://el-habashy-back-1947033daeaf.herokuapp.com").replace(/\/$/, "");

export type ProblemDetails = {
  type?: string;
  title?: string;
  status: number;
  detail: string;
  errors?: Record<string, string | string[]>;
};

export class ApiError extends Error {
  status: number;
  errors: Record<string, string>;

  constructor(problem: ProblemDetails) {
    super(problem.detail || problem.title || "Request failed");
    this.name = "ApiError";
    this.status = problem.status;
    this.errors = Object.fromEntries(
      Object.entries(problem.errors || {}).map(([key, value]) => [key, Array.isArray(value) ? value.join("، ") : value]),
    );
  }
}

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown; token?: string | null };

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      credentials: "include",
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError({ status: 0, detail: "تعذر الاتصال بالخادم. تحقق من الإنترنت ثم حاول مرة أخرى." });
  }

  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError({
      status: response.status,
      title: payload?.title,
      detail: payload?.detail || payload?.message || "حدث خطأ غير متوقع.",
      errors: payload?.errors,
    });
  }
  return payload as T;
}
