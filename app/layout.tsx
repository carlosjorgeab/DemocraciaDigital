import type {Metadata} from 'next';
import { Work_Sans, Inter } from 'next/font/google';
import './globals.css';
import { DeputadoProvider } from '@/context/DeputadoContext';
import { AuthProvider } from '@/context/AuthContext';
import { SidebarProvider } from '@/context/SidebarContext';
import { InactivityHandler } from '@/components/InactivityHandler';

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Democracia Digital - Gabinete Dep. Carlos Silva',
  description: 'Painel do Parlamentar',
};

export const dynamic = 'force-dynamic';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${workSans.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="font-body bg-background text-on-background bg-subtle-flag min-h-screen antialiased bg-slate-50 text-slate-900" suppressHydrationWarning>
        <AuthProvider>
          <DeputadoProvider>
            <SidebarProvider>
              <InactivityHandler />
              {children}
            </SidebarProvider>
          </DeputadoProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
