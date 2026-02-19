import type { UserRole } from '@/types/user';

export interface Invitation {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  customRole?: number | { id: number; name: string };
  business: number;
  invitedBy: number | { id: number; firstName: string; lastName: string };
  status: 'pending' | 'accepted' | 'expired';
  emailSent?: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvitationData {
  email: string;
  firstName: string;
  lastName: string;
  role: 'member';
  customRole?: number;
}
