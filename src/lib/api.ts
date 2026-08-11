const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

// Production uses Vercel's same-origin /api rewrite so authentication cookies
// remain first-party. Development can still target a local or remote backend.
export const API_BASE_URL = import.meta.env.PROD
  ? ""
  : (configuredApiBaseUrl || "http://localhost:8080").replace(/\/$/, "");

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

const inFlightGetRequests = new Map<string, Promise<unknown>>();

async function executeRequest<T>(path: string, options: RequestOptions): Promise<T> {
  const headers = new Headers(options.headers);
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (options.body !== undefined && !isFormData) headers.set("Content-Type", "application/json");
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      credentials: "include",
      body: options.body === undefined
        ? undefined
        : isFormData
          ? options.body as FormData
          : JSON.stringify(options.body),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
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

export function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  if (method !== "GET" || options.body !== undefined || options.token) {
    return executeRequest<T>(path, options);
  }

  const requestKey = `${API_BASE_URL}${path}`;
  const pending = inFlightGetRequests.get(requestKey) as Promise<T> | undefined;
  if (pending) return pending;

  const request = executeRequest<T>(path, options).finally(() => {
    inFlightGetRequests.delete(requestKey);
  });
  inFlightGetRequests.set(requestKey, request);
  return request;
}
