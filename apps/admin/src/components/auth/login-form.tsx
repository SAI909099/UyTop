"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

type LoginResponse = {
  error?: string;
};

export function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    startTransition(async () => {
      const response = await fetch('/api/admin-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier,
          password,
        }),
      });

      const payload = (await response.json()) as LoginResponse;

      if (!response.ok) {
        setError(payload.error ?? 'Failed to sign in.');
        return;
      }

      router.replace('/catalog');
      router.refresh();
    });
  }

  return (
    <form style={{ display: 'grid', gap: '12px' }} onSubmit={handleSubmit}>
      <input
        aria-label="Email or phone"
        placeholder="Admin email or phone"
        style={inputStyle}
        value={identifier}
        onChange={(event) => setIdentifier(event.target.value)}
        required
      />
      <input
        aria-label="Password"
        placeholder="Password"
        type="password"
        style={inputStyle}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      {error ? <p style={{ margin: 0, color: 'var(--danger)' }}>{error}</p> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  background: 'var(--surface)',
};
