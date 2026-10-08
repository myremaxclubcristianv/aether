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
  metadataBase: new URL('https://aether-sable-delta.vercel.app'),
  title: 'Aether — The Instagram for What You Actually Achieve',
  description: "Your life isn't a feed. It's what you do. Track real progress, turn actions into Proofs, build your Flex Score, and see what your Circle is accomplishing.",
  keywords: ['Aether', 'Proofs', 'Flex Score', 'Achievements', 'Social Network', 'Discipline', 'Productivity', 'Habits'],
  authors: [{ name: 'Aether' }],
  openGraph: {
    title: 'Aether — The Instagram for What You Actually Achieve',
    description: 'Track real progress, turn actions into Proofs, build your Flex Score, and discover what your Circle is actually accomplishing.',
    url: 'https://aether-sable-delta.vercel.app',
    siteName: 'Aether',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aether — The Instagram for What You Actually Achieve',
    description: 'Track real progress, turn actions into Proofs, build your Flex Score, and discover what your Circle is actually accomplishing.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-black">
      <body className={`${inter.variable} font-sans antialiased bg-black text-white min-h-screen selection:bg-zinc-800 selection:text-white`}>
        <VisitorTracker />
        {children}
      </body>
    </html>
  );
}
