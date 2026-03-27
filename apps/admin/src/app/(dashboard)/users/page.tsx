import { Inter } from 'next/font/google';

const pageFont = Inter({
  subsets: ['latin'],
});

export default function UsersPage() {
  return (
    <section className={`users-workspace-page ${pageFont.className}`}>
      <header className="users-workspace-header">
        <div className="users-workspace-copy">
          <p className="users-workspace-eyebrow">Users</p>
          <h1>User workspace</h1>
          <p>
            A clean white canvas for building the user-management experience container by container, without forcing any
            structure before we are ready.
          </p>
        </div>

        <div className="users-workspace-accent" aria-hidden="true">
          <span />
          <small>Prepared for custom modules</small>
        </div>
      </header>

      <section className="users-workspace-canvas" aria-label="Users page workspace canvas">
        <div className="users-workspace-canvas-mark">
          <span className="users-workspace-canvas-dot" aria-hidden="true" />
          <p>White workspace ready for future containers</p>
        </div>
      </section>
    </section>
  );
}
