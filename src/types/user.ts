export type UserRole = 'owner' | 'admin' | 'technician' | 'team_member';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  business: number | { id: number; name: string };
  avatarUrl?: string;
  isActive: boolean;
  onboardingComplete: boolean;
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
