import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

interface DashboardStats {
  activeJobs: number;
  pendingEstimates: number;
  unpaidInvoices: number;
  monthlyRevenue: number;
}

interface PayloadListResponse {
  totalDocs: number;
  docs: { total?: number }[];
}

export function useOwnerDashboard() {
  return useQuery({
    queryKey: ['owner-dashboard'],
    queryFn: async (): Promise<DashboardStats> => {
      const [jobsRes, estimatesRes, invoicesRes, paidRes] = await Promise.all([
        apiClient.get<PayloadListResponse>('/api/jobs', {
          'where[status][in]': 'scheduled,en_route,on_site,in_progress',
          limit: '0',
        }),
        apiClient.get<PayloadListResponse>('/api/estimates', {
          'where[status][equals]': 'draft',
          limit: '0',
        }),
        apiClient.get<PayloadListResponse>('/api/invoices', {
          'where[status][equals]': 'sent',
          limit: '0',
        }),
        apiClient.get<PayloadListResponse>('/api/invoices', {
          'where[status][equals]': 'paid',
          'where[paidAt][greater_than]': new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1,
          ).toISOString(),
          limit: '100',
          depth: '0',
        }),
      ]);

      const monthlyRevenue = paidRes.docs.reduce((sum, inv) => sum + (inv.total ?? 0), 0);

      return {
        activeJobs: jobsRes.totalDocs,
        pendingEstimates: estimatesRes.totalDocs,
        unpaidInvoices: invoicesRes.totalDocs,
        monthlyRevenue,
      };
    },
    staleTime: 1000 * 60 * 2,
  });
}
