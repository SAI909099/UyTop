import { apiFetch } from '@/lib/api/client';
import type { AdminUsersOverview } from '@/types/api';

type UsersOverviewParams = {
  page?: number;
  pageSize?: number;
};

function buildQuery(params: Record<string, string | number | null | undefined>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      return;
    }

    query.set(key, String(value));
  });

  return query.size ? `?${query.toString()}` : '';
}

export function getUsersOverview(params: UsersOverviewParams = {}) {
  const query = buildQuery({
    page: params.page,
    page_size: params.pageSize,
  });

  return apiFetch<AdminUsersOverview>(`/admin/users/overview${query}`);
}
