"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useTransition } from 'react';

import { Button } from '@/components/ui/button';

const AUTO_REFRESH_INTERVAL_MS = 15_000;

type UsersAutoRefreshProps = {
  refreshLabel: string;
  refreshingLabel: string;
  autoRefreshLabel: string;
  onlineWindowLabel: string;
  updatedAtLabel: string;
};

export function UsersAutoRefresh({
  refreshLabel,
  refreshingLabel,
  autoRefreshLabel,
  onlineWindowLabel,
  updatedAtLabel,
}: UsersAutoRefreshProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      startTransition(() => {
        router.refresh();
      });
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [router]);

  function handleRefresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="users-refresh-panel">
      <div className="users-refresh-copy">
        <span>{autoRefreshLabel}</span>
        <strong>{onlineWindowLabel}</strong>
        <small>{updatedAtLabel}</small>
      </div>

      <Button type="button" onClick={handleRefresh} disabled={isPending}>
        {isPending ? refreshingLabel : refreshLabel}
      </Button>
    </div>
  );
}
