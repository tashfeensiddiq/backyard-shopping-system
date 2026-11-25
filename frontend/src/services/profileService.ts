import { getToken } from "./authService";

const API_URL = "http://127.0.0.1:8000";

export interface Profile {
  id: number;
  name: string;
  email: string;
  phone_number: string | null;
  address: string | null;
  profile_picture: string | null;
  is_verified: boolean;
}

export interface ProfileUpdateData {
  name?: string;
  phone_number?: string;
  address?: string;
  profile_picture?: string;
}

// Get current user's profile
export async function getProfile(): Promise<Profile> {
  const token = getToken();

  if (!token) {
    throw new Error("You are not logged in.");
  }

  const response = await fetch(`${API_URL}/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || "Failed to load profile.");
  }

  return result;
}

// Update current user's profile
export async function updateProfile(
  data: ProfileUpdateData
): Promise<Profile> {
  const token = getToken();

  if (!token) {
    throw new Error("You are not logged in.");
  }

  const response = await fetch(`${API_URL}/users/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || "Failed to update profile.");
  }

  return result;
}