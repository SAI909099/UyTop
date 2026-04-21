"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import { type AuthActionErrorResponse, type AuthActionSuccessResponse } from '@/lib/auth';
import { authDictionary, buildLocalizedPath, type LocaleCode } from '@/lib/i18n';

type RegisterFormProps = {
  locale: LocaleCode;
};

function isValidEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

export function RegisterForm({ locale }: RegisterFormProps) {
  const router = useRouter();
  const dictionary = authDictionary[locale];
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const loginPath = buildLocalizedPath(locale, '/login');
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

    if (!email.trim()) {
      nextErrors.email = dictionary.validation.required;
    } else if (!isValidEmail(email.trim())) {
      nextErrors.email = dictionary.validation.invalidEmail;
    }

    if (!phoneNumber.trim()) {
      nextErrors.phone_number = dictionary.validation.required;
    }

    if (!password) {
      nextErrors.password = dictionary.validation.required;
    } else if (password.length < 8) {
      nextErrors.password = dictionary.validation.passwordTooShort;
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
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            email: email.trim(),
            phone_number: phoneNumber.trim(),
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
        <h2>{dictionary.register.title}</h2>
        <p>{dictionary.register.body}</p>
      </div>

      <div className="auth-form-grid auth-form-grid-halves">
        <label className="auth-field">
          <span>{dictionary.register.firstNameLabel}</span>
          <input
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            placeholder={dictionary.register.firstNamePlaceholder}
            autoComplete="given-name"
          />
        </label>

        <label className="auth-field">
          <span>{dictionary.register.lastNameLabel}</span>
          <input
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            placeholder={dictionary.register.lastNamePlaceholder}
            autoComplete="family-name"
          />
        </label>
      </div>

      <label className="auth-field">
        <span>{dictionary.register.emailLabel}</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={dictionary.register.emailPlaceholder}
          autoComplete="email"
          aria-invalid={Boolean(fieldErrors.email)}
        />
        {fieldErrors.email ? <small className="auth-field-error">{fieldErrors.email}</small> : null}
      </label>

      <label className="auth-field">
        <span>{dictionary.register.phoneLabel}</span>
        <input
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
          placeholder={dictionary.register.phonePlaceholder}
          autoComplete="tel"
          aria-invalid={Boolean(fieldErrors.phone_number)}
        />
        {fieldErrors.phone_number ? <small className="auth-field-error">{fieldErrors.phone_number}</small> : null}
      </label>

      <label className="auth-field">
        <span>{dictionary.register.passwordLabel}</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={dictionary.register.passwordPlaceholder}
          autoComplete="new-password"
          aria-invalid={Boolean(fieldErrors.password)}
        />
        {fieldErrors.password ? <small className="auth-field-error">{fieldErrors.password}</small> : null}
      </label>

      {error ? <p className="auth-form-error">{error}</p> : null}

      <button type="submit" className="landing-button landing-button-primary auth-submit" disabled={isPending}>
        {isPending ? dictionary.register.submitting : dictionary.register.submit}
      </button>

      <p className="auth-form-footer">
        <span>{dictionary.register.alternatePrompt}</span>
        <Link href={loginPath}>{dictionary.register.alternateCta}</Link>
      </p>
    </form>
  );
}
