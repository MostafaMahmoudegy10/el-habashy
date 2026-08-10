import { apiRequest } from "./api";

export type UserRole = "USER" | "ADMIN";
export type AuthUser = { id: string; firstName: string; lastName: string; email: string; role: UserRole; enabled: boolean; createdAt: string; favorites?: number[] };
export type AuthResponse = { accessToken: string; tokenType: "Bearer"; expiresIn: number; expiresAt?: string; user: AuthUser };
export type RegistrationResponse = { message: string; email: string };
export type MessageResponse = { message: string };
export type PageResponse<T> = { content: T[]; page: number; size: number; totalElements: number; totalPages: number; first: boolean; last: boolean };

const root = "/api/v1/auth";
export const authApi = {
  register: (body: { firstName: string; lastName: string; email: string; password: string }) => apiRequest<RegistrationResponse>(`${root}/register`, { method: "POST", body }),
  login: (body: { email: string; password: string }) => apiRequest<AuthResponse>(`${root}/login`, { method: "POST", body }),
  refresh: () => apiRequest<AuthResponse>(`${root}/refresh`, { method: "POST" }),
  logout: () => apiRequest<void>(`${root}/logout`, { method: "POST" }),
  resendActivation: (email: string) => apiRequest<MessageResponse>(`${root}/resend-activation`, { method: "POST", body: { email } }),
  forgotPassword: (email: string) => apiRequest<MessageResponse>(`${root}/forgot-password`, { method: "POST", body: { email } }),
  resetPassword: (body: { email: string; otp: string; newPassword: string }) => apiRequest<MessageResponse>(`${root}/reset-password`, { method: "POST", body }),
  me: (token: string) => apiRequest<AuthUser>(`${root}/me`, { token }),
};

export const adminApi = {
  users: (token: string, page = 0, size = 20) => apiRequest<PageResponse<AuthUser>>(`/api/v1/admin/users?page=${page}&size=${size}`, { token }),
  role: (token: string, userId: string, role: UserRole) => apiRequest<AuthUser>(`/api/v1/admin/users/${userId}/role`, { method: "PATCH", token, body: { role } }),
  status: (token: string, userId: string, enabled: boolean) => apiRequest<AuthUser>(`/api/v1/admin/users/${userId}/status`, { method: "PATCH", token, body: { enabled } }),
};
