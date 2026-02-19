import type { User, AuthResponse } from '@/types/user';

export const mockUser: User = {
  id: 1,
  email: 'mike.johnson@example.com',
  firstName: 'Mike',
  lastName: 'Johnson',
  phone: '(555) 234-5678',
  role: 'member',
  business: 1,
  avatarUrl: undefined,
  isActive: true,
  onboardingComplete: true,
  createdAt: '2025-06-15T08:00:00Z',
  updatedAt: '2025-12-01T10:30:00Z',
};

export const mockAuthResponse: AuthResponse = {
  token: 'mock-jwt-token-abc123',
  exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
  user: mockUser,
};
