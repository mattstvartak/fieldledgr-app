import type { UserRole } from '@/types/user';

export function isOwner(role: UserRole | undefined): boolean {
  return role === 'owner' || role === 'admin';
}

export function isMember(role: UserRole | undefined): boolean {
  return role === 'member';
}
