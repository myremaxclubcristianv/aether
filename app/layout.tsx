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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://aether.cristianvaduva.com'),
  title: {
    default: 'AETHER — The Instagram for What You Actually Achieve',
    template: '%s | AETHER',
  },
  description: "Your life isn't a feed. It's what you do. Track real progress, turn actions into Proofs, build your Flex Score, and see what your Circle is accomplishing.",
  keywords: ['AETHER', 'Proofs', 'Flex Score', 'Achievements', 'Social Network', 'Discipline', 'Productivity', 'Habits'],
  authors: [{ name: 'AETHER', url: 'https://aether.cristianvaduva.com' }],
  openGraph: {
    title: 'AETHER — The Instagram for What You Actually Achieve',
    description: 'Track real progress, turn actions into Proofs, build your Flex Score, and discover what your Circle is accomplishing.',
    url: 'https://aether.cristianvaduva.com',
    siteName: 'AETHER',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AETHER — The Instagram for What You Actually Achieve',
    description: 'Track real progress, turn actions into Proofs, build your Flex Score, and discover what your Circle is accomplishing.',
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
