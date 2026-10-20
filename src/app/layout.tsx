import { DataNotice } from '@/components/data-notice';
import type { Metadata } from 'next';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'TrainView',
  description:
    'A simple way to review workouts, distance, and training history.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={'min-h-screen antialiased'}
      >
        <ThemeProvider>
          <DashboardShell><DataNotice />{children}</DashboardShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
