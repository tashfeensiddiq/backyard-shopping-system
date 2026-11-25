
const API_URL = "http://127.0.0.1:8000";

export interface User {
  id: number;
  name: string;
  email: string;
  is_verified: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Register user
export async function register(data: RegisterData) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || "Registration failed.");
  }

  return result;
}

// Verify email
export async function verifyEmail(email: string, code: string) {
  const response = await fetch(`${API_URL}/auth/verify-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      code,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || "Email verification failed.");
  }

  return result;
}

// Login
export async function login(data: LoginData): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || "Login failed.");
  }

  // Save token and user information
  localStorage.setItem("access_token", result.access_token);
  localStorage.setItem("user", JSON.stringify(result.user));

  return result;
}

// Get saved token
export function getToken(): string | null {
  return localStorage.getItem("access_token");
}

// Get saved user
export function getUser(): User | null {
  const user = localStorage.getItem("user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

// Check authentication status
export function isAuthenticated(): boolean {
  return !!getToken();
}

// Logout
export function logout(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
}
