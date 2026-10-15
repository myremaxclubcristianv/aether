import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Subject Rights & GDPR Request Portal | AETHER Legal Center',
  description: 'Exercise your GDPR rights regarding access, rectification, restriction, objection and personal data erasure.',
  alternates: {
    canonical: '/legal/data-rights',
  },
};

export default function DataRightsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
