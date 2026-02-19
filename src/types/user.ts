export type UserRole = 'admin' | 'owner' | 'member';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  customRole?: number | { id: number; name: string; description?: string };
  business: number | { id: number; name: string };
  avatarUrl?: string;
  isActive: boolean;
  onboardingComplete: boolean;
  pushNotificationsEnabled?: boolean;
  emailNotificationsEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  exp: number;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
