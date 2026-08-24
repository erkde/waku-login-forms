import '../styles.css';

import type { ReactNode } from 'react';
import { Link } from 'waku';

type RootLayoutProps = { children: ReactNode };

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="min-h-svh bg-zinc-50 font-sans text-zinc-950">
      <meta
        name="description"
        content="A comparison of React login form submission strategies."
      />
      <main className="mx-6 flex min-h-svh items-center justify-center">
        <div className="w-full max-w-md py-12">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 grid size-12 place-items-center rounded-2xl bg-zinc-950 text-lg font-bold text-white shadow-lg shadow-zinc-950/15">
              W
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Enter your details to access your account
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-950/5 sm:p-8">
            {children}
          </div>

          <nav
            aria-label="Login implementations"
            className="mt-7 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm"
          >
            <Link
              to="/login/onsubmit"
              className="text-zinc-500 hover:text-zinc-950"
            >
              onSubmit
            </Link>
            <Link
              to="/login/client-action"
              className="text-zinc-500 hover:text-zinc-950"
            >
              Client action
            </Link>
            <Link
              to="/login/server-action"
              className="text-zinc-500 hover:text-zinc-950"
            >
              Server action
            </Link>
          </nav>
        </div>
      </main>
    </div>
  );
}

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
