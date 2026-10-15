import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account & Data Deletion Portal | AETHER Legal Center',
  description: 'Procedures and verified requests for permanent deletion of account and personal data on AETHER.',
  alternates: {
    canonical: '/legal/delete-account',
  },
};

export default function DeleteAccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
