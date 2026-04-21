import { UsersOverview } from '@/components/users/users-overview';
import { getUsersOverview } from '@/lib/api/users';
import { getServerLocale } from '@/lib/i18n';

const PAGE_SIZE = 20;

function parsePage(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsed = Number(rawValue ?? 1);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

type UsersPageProps = {
  searchParams?: Promise<{
    page?: string | string[];
  }>;
};

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const locale = await getServerLocale();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const requestedPage = parsePage(resolvedSearchParams.page);
  const overview = await getUsersOverview({
    page: requestedPage,
    pageSize: PAGE_SIZE,
  });

  return <UsersOverview locale={locale} overview={overview} />;
}
