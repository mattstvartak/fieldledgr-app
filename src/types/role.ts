export type PermissionLevel = 'none' | 'view' | 'edit' | 'full';

export interface Role {
  id: number;
  name: string;
  description?: string;
  business: number;
  isDefault?: boolean;
  permCustomers: PermissionLevel;
  permJobs: PermissionLevel;
  permEstimates: PermissionLevel;
  permInvoices: PermissionLevel;
  permPayments: PermissionLevel;
  permProducts: PermissionLevel;
  permReports: PermissionLevel;
  permTeam: PermissionLevel;
  permSettings: PermissionLevel;
  permBilling: PermissionLevel;
  createdAt: string;
  updatedAt: string;
}
