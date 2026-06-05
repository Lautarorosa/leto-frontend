import type { Metadata } from 'next';
import { ThemeProvider } from '@/context/ThemeContext';
import { QueryProvider } from '@/components/providers/QueryProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'LETO - Análisis de Márgenes',
  description: 'Conecta tu tienda TiendaNube y obtén recomendaciones inteligentes de márgenes',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                document.documentElement.classList.add('dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-[#060a06] text-white transition-colors">
        <QueryProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
