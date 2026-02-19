import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { isOwner } from '@/lib/roles';
import { OwnerDashboard } from '@/components/dashboard/OwnerDashboard';
import { TechnicianDashboard } from '@/components/dashboard/TechnicianDashboard';

export default function HomeScreen() {
  const role = useAuthStore((s) => s.user?.role);

  if (isOwner(role)) {
    return <OwnerDashboard />;
  }
  return <TechnicianDashboard />;
}
