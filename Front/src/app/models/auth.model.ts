export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'operator';
}

export interface LoginPayload {
  token: string;
  expires_at: string;
  operator: AuthUser;
}

export interface LoginResponse extends Partial<LoginPayload> {
  proxyResponse?: LoginPayload;
}
