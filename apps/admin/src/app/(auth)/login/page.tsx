import { LoginForm } from '@/components/auth/login-form';
import { Card } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
      }}
    >
      <Card>
        <div style={{ display: 'grid', gap: '16px', maxWidth: '420px' }}>
          <div>
            <p style={{ margin: 0, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              UyTop
            </p>
            <h1 style={{ margin: '8px 0 0', fontSize: '2rem' }}>Admin Login</h1>
          </div>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>
            Sign in with a real backend admin account. Bypass mode can still be used for local development, but this form now supports actual admin email/phone and password login.
          </p>
          <LoginForm />
        </div>
      </Card>
    </main>
  );
}
