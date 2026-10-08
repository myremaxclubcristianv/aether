import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { VisitorTracker } from '@/components/analytics/visitor-tracker';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Aether • Achieve',
  description: 'The premium network for what you actually achieve. Objective, minimal, high agency.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-black">
      <body className={`${inter.variable} font-sans antialiased bg-black text-white min-h-screen flex justify-center selection:bg-zinc-800 selection:text-white`}>
        <VisitorTracker />
        <div className="w-full max-w-md min-h-screen bg-black border-x border-zinc-900 flex flex-col shadow-2xl relative">
          {children}
        </div>
      </body>
    </html>
  );
}
