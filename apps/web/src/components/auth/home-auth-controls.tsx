"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import { type AuthenticatedUser, getAuthDisplayName } from '@/lib/auth';
import { buildLocalizedPath, type LocaleCode } from '@/lib/i18n';

type HomeAuthControlsProps = {
  locale: LocaleCode;
  initialUser: AuthenticatedUser | null;
  labels: {
    login: string;
    register: string;
    logout: string;
    account: string;
    signingOut: string;
  };
};

export function HomeAuthControls({ locale, initialUser, labels }: HomeAuthControlsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [isPending, startTransition] = useTransition();

  const loginPath = buildLocalizedPath(locale, '/login');
  const registerPath = buildLocalizedPath(locale, '/register');

  function isActive(target: string) {
    return pathname === target;
  }

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        cache: 'no-store',
      });

      if (!isMounted) {
        return;
      }

      if (!response.ok) {
        setUser(null);
        return;
      }

      const payload = (await response.json().catch(() => ({}))) as { user?: AuthenticatedUser };
      setUser(payload.user ?? null);
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleLogout() {
    startTransition(() => {
      void (async () => {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          return;
        }

        setUser(null);
        router.refresh();
      })();
    });
  }

  if (user) {
    return (
      <div className="home-auth-controls">
        <div className="home-auth-user" title={user.email}>
          <span>{labels.account}</span>
          <strong>{getAuthDisplayName(user)}</strong>
        </div>

        <button type="button" className="landing-button landing-button-secondary home-auth-button" onClick={handleLogout} disabled={isPending}>
          {isPending ? labels.signingOut : labels.logout}
        </button>
      </div>
    );
  }

  return (
    <div className="home-auth-controls">
      <Link
        href={loginPath}
        className={`landing-button home-auth-button ${isActive(loginPath) ? 'home-auth-button-active' : 'landing-button-secondary'}`}
      >
        {labels.login}
      </Link>
      <Link
        href={registerPath}
        className={`landing-button home-auth-button ${isActive(registerPath) ? 'home-auth-button-active' : 'landing-button-secondary'}`}
      >
        {labels.register}
      </Link>
    </div>
  );
}
