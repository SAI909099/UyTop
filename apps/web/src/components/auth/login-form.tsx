"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import { type AuthActionErrorResponse, type AuthActionSuccessResponse } from '@/lib/auth';
import { authDictionary, buildLocalizedPath, type LocaleCode } from '@/lib/i18n';

type LoginFormProps = {
  locale: LocaleCode;
};

export function LoginForm({ locale }: LoginFormProps) {
  const router = useRouter();
  const dictionary = authDictionary[locale];
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const registerPath = buildLocalizedPath(locale, '/register');
  const homePath = buildLocalizedPath(locale, '/');

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

      if (!isMounted || !response.ok) {
        return;
      }

      router.replace(homePath);
      router.refresh();
    })();

    return () => {
      isMounted = false;
    };
  }, [homePath, router]);

  function validateForm() {
    const nextErrors: Record<string, string> = {};

    if (!identifier.trim()) {
      nextErrors.identifier = dictionary.validation.required;
    }

    if (!password) {
      nextErrors.password = dictionary.validation.required;
    }

    return nextErrors;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm();
    setFieldErrors(nextErrors);
    setError('');

    if (Object.keys(nextErrors).length) {
      return;
    }

    startTransition(() => {
      void (async () => {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            identifier: identifier.trim(),
            password,
          }),
        });

        const payload = (await response.json().catch(() => ({}))) as
          | AuthActionErrorResponse
          | AuthActionSuccessResponse;

        if (!response.ok) {
          setFieldErrors('fieldErrors' in payload && payload.fieldErrors ? payload.fieldErrors : {});
          setError(('error' in payload && payload.error) || dictionary.messages.authUnavailable);
          return;
        }

        router.replace(homePath);
        router.refresh();
      })();
    });
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form-head">
        <h2>{dictionary.login.title}</h2>
        <p>{dictionary.login.body}</p>
      </div>

      <label className="auth-field">
        <span>{dictionary.login.identifierLabel}</span>
        <input
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          placeholder={dictionary.login.identifierPlaceholder}
          autoComplete="username"
          aria-invalid={Boolean(fieldErrors.identifier)}
        />
        {fieldErrors.identifier ? <small className="auth-field-error">{fieldErrors.identifier}</small> : null}
      </label>

      <label className="auth-field">
        <span>{dictionary.login.passwordLabel}</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={dictionary.login.passwordPlaceholder}
          autoComplete="current-password"
          aria-invalid={Boolean(fieldErrors.password)}
        />
        {fieldErrors.password ? <small className="auth-field-error">{fieldErrors.password}</small> : null}
      </label>

      {error ? <p className="auth-form-error">{error}</p> : null}

      <button type="submit" className="landing-button landing-button-primary auth-submit" disabled={isPending}>
        {isPending ? dictionary.login.submitting : dictionary.login.submit}
      </button>

      <p className="auth-form-footer">
        <span>{dictionary.login.alternatePrompt}</span>
        <Link href={registerPath}>{dictionary.login.alternateCta}</Link>
      </p>
    </form>
  );
}
