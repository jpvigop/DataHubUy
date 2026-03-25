import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

import { ThemeToggle } from '@/components/ThemeToggle';

import './globals.css';

export const metadata: Metadata = {
  title: 'DataHubUy - Explorador de Datos Abiertos',
  description: 'Explorador de datos abiertos de Uruguay',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950" suppressHydrationWarning>
        <Script id="theme-init" strategy="beforeInteractive">
          {`try {
            const theme = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.classList.toggle('dark', theme === 'dark' || (!theme && prefersDark));
          } catch (error) {
            document.documentElement.classList.remove('dark');
          }`}
        </Script>

        <div className="flex min-h-screen flex-col justify-between">
          <header className="border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
              <Link className="text-xl font-semibold text-slate-900 dark:text-white" href="/">
                DataHubUy
              </Link>
              <ThemeToggle />
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>

          <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto max-w-6xl px-6 py-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Datos obtenidos del{' '}
                <a
                  className="text-primary hover:underline"
                  href="https://catalogodatos.gub.uy"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Catalogo Nacional de Datos Abiertos
                </a>
                , Ministerio de Economia y Finanzas, 2024.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
