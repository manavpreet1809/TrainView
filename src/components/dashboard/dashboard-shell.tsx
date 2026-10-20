'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const pages = [
  { title: 'Dashboard', href: '/' },
  { title: 'Workouts', href: '/workouts' },
  { title: 'AI Coach', href: '/chat' },
  { title: 'Data setup', href: '/setup' },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-muted/30">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:p-3">Skip to content</a>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex min-h-16 max-w-5xl items-center gap-5 px-4 sm:px-6">
          <Link href="/" className="text-xl font-bold text-primary">TrainView</Link>
          <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
            {pages.map(page => (
              <Link key={page.href} href={page.href} aria-current={pathname === page.href ? 'page' : undefined}
                className={`rounded-md px-3 py-2 text-sm transition-colors duration-150 ${pathname === page.href ? 'bg-accent font-semibold text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                {page.title}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="md:hidden" variant="outline" size="icon" aria-label="Open navigation"><Menu className="size-5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {pages.map(page => <DropdownMenuItem key={page.href} asChild><Link href={page.href} aria-current={pathname === page.href ? 'page' : undefined}>{page.title}</Link></DropdownMenuItem>)}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      <footer className="mx-auto max-w-5xl border-t px-4 py-5 text-sm text-muted-foreground sm:px-6">TrainView · A fitness project by Manavpreet Singh</footer>
    </div>
  );
}
