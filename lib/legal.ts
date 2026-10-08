export interface LegalDocSummary {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  version: string;
  lastUpdated: string;
  effectiveDate: string;
}

export const LEGAL_METADATA = {
  version: 'Version 1.0',
  lastUpdated: 'October 2026',
  effectiveDate: '[DATE TO BE CONFIRMED]',
  controllerPlaceholder: '[LEGAL ENTITY / CONTROLLER TO BE COMPLETED]',
  registeredAddressPlaceholder: '[REGISTERED OFFICE ADDRESS TO BE COMPLETED]',
  registrationNumberPlaceholder: '[TRADE REGISTER / CUI TO BE COMPLETED]',
  dpoStatement: 'No Data Protection Officer has been designated unless otherwise stated here.',
  privacyEmail: 'cristianvaduva@duck.com',
  securityEmail: 'cristianvaduva@duck.com',
  supervisoryAuthority: {
    name: 'Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)',
    address: 'B-dul G-ral. Gheorghe Magheru 28-30, Sector 1, București, România',
    website: 'https://www.dataprotection.ro',
  },
};

export const LEGAL_DOCS: LegalDocSummary[] = [
  {
    id: 'privacy',
    slug: '/legal/privacy',
    title: 'Privacy Policy',
    category: 'Privacy & Data Protection',
    summary: 'How AETHER collects, processes, protects and retains personal data in accordance with GDPR.',
    version: '1.0',
    lastUpdated: 'October 2026',
    effectiveDate: '[DATE TO BE CONFIRMED]',
  },
  {
    id: 'terms',
    slug: '/legal/terms',
    title: 'Terms of Service',
    category: 'Platform Rules',
    summary: 'The rules and contractual terms governing access to and use of the AETHER platform.',
    version: '1.0',
    lastUpdated: 'October 2026',
    effectiveDate: '[DATE TO BE CONFIRMED]',
  },
  {
    id: 'cookies',
    slug: '/legal/cookies',
    title: 'Cookie Policy',
    category: 'Tracking & Storage',
    summary: 'Explanation of essential authentication tokens, session storage and tracking technologies.',
    version: '1.0',
    lastUpdated: 'October 2026',
    effectiveDate: '[DATE TO BE CONFIRMED]',
  },
  {
    id: 'community',
    slug: '/legal/community',
    title: 'Community Guidelines',
    category: 'Conduct & Safety',
    summary: 'Expected behavioral standards, anti-harassment rules and fair use of the social layer.',
    version: '1.0',
    lastUpdated: 'October 2026',
    effectiveDate: '[DATE TO BE CONFIRMED]',
  },
  {
    id: 'acceptable-use',
    slug: '/legal/acceptable-use',
    title: 'Acceptable Use Policy',
    category: 'Security & Compliance',
    summary: 'Prohibited actions including scraping, abuse, security bypassing and malicious activity.',
    version: '1.0',
    lastUpdated: 'October 2026',
    effectiveDate: '[DATE TO BE CONFIRMED]',
  },
  {
    id: 'proof-policy',
    slug: '/legal/proof-policy',
    title: 'Content & Proof Policy',
    category: 'User Content & Evidence',
    summary: 'Rules regarding user-submitted Proofs, media rights and the definition of proof evidence.',
    version: '1.0',
    lastUpdated: 'October 2026',
    effectiveDate: '[DATE TO BE CONFIRMED]',
  },
  {
    id: 'intellectual-property',
    slug: '/legal/intellectual-property',
    title: 'Intellectual Property',
    category: 'Ownership & Rights',
    summary: 'Platform ownership, brand trademarks, software rights and user content licensing.',
    version: '1.0',
    lastUpdated: 'October 2026',
    effectiveDate: '[DATE TO BE CONFIRMED]',
  },
  {
    id: 'data-rights',
    slug: '/legal/data-rights',
    title: 'Data Subject Rights',
    category: 'GDPR / RGPD Rights',
    summary: 'How to exercise access, rectification, restriction, portability, objection and erasure rights.',
    version: '1.0',
    lastUpdated: 'October 2026',
    effectiveDate: '[DATE TO BE CONFIRMED]',
  },
  {
    id: 'delete-account',
    slug: '/legal/delete-account',
    title: 'Account & Data Deletion',
    category: 'Self-Service & Erasure',
    summary: 'Procedures and verified requests for permanent deletion of account and personal data.',
    version: '1.0',
    lastUpdated: 'October 2026',
    effectiveDate: '[DATE TO BE CONFIRMED]',
  },
  {
    id: 'security',
    slug: '/legal/security',
    title: 'Security & Disclosure',
    category: 'Infrastructure & Safety',
    summary: 'Platform security architecture, protection controls and responsible vulnerability disclosure.',
    version: '1.0',
    lastUpdated: 'October 2026',
    effectiveDate: '[DATE TO BE CONFIRMED]',
  },
];
