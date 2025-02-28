import type { Metadata } from 'next'
import './globals.css'
import { ThemeToggle } from '@/components/ThemeToggle'

export const metadata: Metadata = {
  title: 'DataHubUy - Explorador de Datos Abiertos',
  description: 'Explorador de datos abiertos de Uruguay',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="min-h-screen flex flex-col justify-between">
          <header className="w-full border-b bg-white dark:bg-gray-800 transition-colors">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                DataHubUy
              </h1>
              <ThemeToggle />
            </div>
          </header>
          <main className="w-full max-w-6xl px-6 py-8 mx-auto">
            {children}
          </main>
          <footer className="w-full border-t bg-white dark:bg-gray-800 dark:border-gray-700 transition-colors">
            <div className="max-w-6xl mx-auto px-6 py-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Datos obtenidos del{' '}
                <a 
                  href="https://catalogodatos.gub.uy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Catálogo Nacional de Datos Abiertos
                </a>
                , Ministerio de Economía y Finanzas, 2024.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
} 