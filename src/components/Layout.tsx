import { ThemeToggle } from '@/components/ThemeToggle';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex items-start justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Explorador de Datos Abiertos de Uruguay
        </h1>
        <ThemeToggle />
      </div>
      {children}
    </div>
  );
} 