export interface ProjectItem {
  id: string;
  name: string;
  brandTitle?: string;
  category: 'TECH' | 'REAL ESTATE' | 'INSURANCE' | 'FINANCE' | 'MEDIA' | 'CONSTRUCTION' | 'AVIATION' | 'HEALTH';
  categoryLabel: string;
  tagline: string;
  description: string;
  role: string;
  url: string;
  status: 'LIVE' | 'ECOSYSTEM' | 'IN DEVELOPMENT' | 'CONCEPT';
  features?: string[];
  highlight?: boolean;
}

export interface ServiceVertical {
  id: string;
  title: string;
  icon: string;
  summary: string;
  description: string;
  platforms: string[];
  services: string[];
  privateClient?: string[];
}

export interface ContactInfo {
  phone: { display: string; raw: string; url: string };
  whatsapp: { display: string; raw: string; url: string };
  email: { display: string; url: string };
  telegram: { display: string; handle: string; url: string };
  location: string;
}

export interface SocialLink {
  platform: string;
  handle: string;
  url: string;
  category: string;
}

export const FOUNDER_DATA = {
  identity: {
    name: 'Cristian Văduva',
    title: 'Founder. Builder. Advisor.',
    tagline: 'Building businesses, platforms and systems designed to turn real-world action into real-world value.',
    anchor: 'AETHER is one of them.',
    statement:
      'Cristian Văduva operates across real estate, insurance, finance and technology, building digital platforms and advisory systems around real-world decisions, assets, protection and growth.',
    regionContext:
      'În România, activitatea este concentrată în jurul ecosistemului CristianVaduva / AiXLuxury și al platformelor dezvoltate pentru diferite verticale.',
    disciplines: [
      'Real Estate',
      'Insurance',
      'Finance / Credit Advisory',
      'Business & Sales Strategy',
      'Technology / Digital Products',
      'Entrepreneurship',
      'Platform Building',
    ],
  },

  contact: {
    phone: {
      display: '+40 767 110 439',
      raw: '+40767110439',
      url: 'tel:+40767110439',
    },
    whatsapp: {
      display: '+43 650 953 6345',
      raw: '+436509536345',
      url: 'https://wa.me/436509536345',
    },
    email: {
      display: 'cristianvaduva@duck.com',
      url: 'mailto:cristianvaduva@duck.com',
    },
    telegram: {
      display: '@capitalinvestcristianvaduva',
      handle: 'capitalinvestcristianvaduva',
      url: 'https://t.me/capitalinvestcristianvaduva',
    },
    location: 'Bucharest, Romania',
  } satisfies ContactInfo,

  socials: [
    {
      platform: 'Telegram',
      handle: '@capitalinvestcristianvaduva',
      url: 'https://t.me/capitalinvestcristianvaduva',
      category: 'Direct Messaging & Updates',
    },
    {
      platform: 'Instagram',
      handle: '@cristianvaduva',
      url: 'https://instagram.com/cristianvaduva',
      category: 'Visual & Daily Updates',
    },
    {
      platform: 'LinkedIn',
      handle: 'Cristian Văduva',
      url: 'https://linkedin.com/in/cristianvaduva',
      category: 'Professional Network',
    },
    {
      platform: 'Facebook',
      handle: 'Cristian Văduva',
      url: 'https://facebook.com/cristianvaduva',
      category: 'Ecosystem & Community',
    },
    {
      platform: 'YouTube',
      handle: '@cristianvaduva',
      url: 'https://youtube.com/@cristianvaduva',
      category: 'Video & Keynotes',
    },
    {
      platform: 'Linktree',
      handle: 'cristianvaduva',
      url: 'https://linktr.ee/cristianvaduva',
      category: 'Digital Hub',
    },
  ] as SocialLink[],

  whatIDo: [
    {
      id: 'real-estate',
      title: 'REAL ESTATE',
      icon: 'Building2',
      summary: 'Property advisory, buyer representation and property intelligence.',
      description:
        'Property advisory, buyer representation, property discovery, investment-oriented real estate and premium/off-market opportunities.',
      platforms: ['HomeFind', 'AiXLuxury', 'AiX OS', 'Dubai Real Estate'],
      services: [
        'Property Advisory',
        'Buyer Representation',
        'Property Discovery',
        'Investment-Oriented Real Estate',
        'Premium & Off-Market Opportunities',
        'Verified Real Estate Matching',
      ],
    },
    {
      id: 'insurance',
      title: 'INSURANCE',
      icon: 'Shield',
      summary: 'Risk assessment, personal and business insurance, and Private Client asset protection.',
      description:
        'Risk assessment, personal and business insurance, asset protection and Private Client insurance advisory.',
      platforms: ['Insurance by Cristian Văduva', 'Private Client Advisory'],
      services: [
        'Life',
        'Health',
        'Home',
        'Auto',
        'Travel',
        'IMM',
        'Business',
        'Professional Liability',
        'Cyber Risk',
        'Cargo',
        'Construction',
      ],
      privateClient: [
        'Supercars',
        'Yachts',
        'Private Aviation',
        'Jewellery & Watches',
        'Fine Art',
        'Luxury Homes',
      ],
    },
    {
      id: 'finance',
      title: 'FINANCE',
      icon: 'TrendingUp',
      summary: 'Credit advisory, structured financing and financial optimization.',
      description: 'Credit advisory and financial optimization across retail, green and commercial sectors.',
      platforms: ['CV Finance', 'Subvenții / Funding Intelligence'],
      services: [
        'Mortgage',
        'Refinancing',
        'New Home',
        'Construction Financing',
        'Green Credit',
        'Real Estate Investment Financing',
        'Business Financing',
      ],
    },
    {
      id: 'technology',
      title: 'TECHNOLOGY',
      icon: 'Cpu',
      summary: 'Building digital products that turn real-world activity into usable systems.',
      description:
        'Building digital products that transform fragmented information and real-world activity into usable systems.',
      platforms: ['AETHER', 'AiX OS', 'HomeFind', 'Ecosystem Architecture'],
      services: [
        'Product Architecture',
        'Identity & Social Proof Systems',
        'Intelligence Layer Development',
        'Cross-Vertical Workflow OS',
        'High-Performance Interfaces',
      ],
    },
  ] as ServiceVertical[],

  creations: [
    {
      id: 'aether',
      name: 'AETHER',
      brandTitle: 'AETHER',
      category: 'TECH',
      categoryLabel: 'Tech / Social Proof',
      tagline: 'The Instagram for what you actually achieve.',
      description:
        'A social identity and proof platform built around action, evidence, progress and reputation.',
      role: 'Founder & Architect',
      url: 'https://aether-sable-delta.vercel.app',
      status: 'LIVE',
      highlight: true,
      features: ['Proof Submissions', 'Flex Score Engine', 'Streak Tracking', 'Circle Social Graph'],
    },
    {
      id: 'homefind',
      name: 'HOME FIND',
      brandTitle: 'HomeFind',
      category: 'REAL ESTATE',
      categoryLabel: 'Real Estate Intelligence',
      tagline: 'Verified Real Estate. Redesigned around better decisions.',
      description:
        'Platform for property discovery, buyer/seller requests, real estate intelligence, property matching, and investment-oriented discovery.',
      role: 'Founder & System Creator',
      url: 'https://homefind.cristianvaduva.com',
      status: 'LIVE',
      features: ['Property Matching', 'Buyer/Seller Requests', 'Investment Intelligence', 'Verified Listings'],
    },
    {
      id: 'insurance-platform',
      name: 'INSURANCE',
      brandTitle: 'Insurance Advisory & Asset Protection',
      category: 'INSURANCE',
      categoryLabel: 'Asset Protection',
      tagline: 'Insurance Advisory & High-Value Asset Protection.',
      description:
        'Comprehensive advisory platform for personal protection, commercial risk, and high-value Private Client assets.',
      role: 'Principal Advisor',
      url: 'https://insurance.cristianvaduva.com',
      status: 'LIVE',
      features: ['Personal & Business', 'Private Client Coverage', 'Risk Assessment', 'Custom Asset Protection'],
    },
    {
      id: 'cv-finance',
      name: 'CV FINANCE',
      brandTitle: 'CV Finance',
      category: 'FINANCE',
      categoryLabel: 'Credit & Capital Advisory',
      tagline: 'Credit Advisory & Financial Optimization.',
      description:
        'Structured advisory platform for mortgages, refinancing, green credit, construction financing, and commercial investments.',
      role: 'Founder & Financial Advisor',
      url: 'https://credite.cristianvaduva.com',
      status: 'LIVE',
      features: ['Mortgage Advisory', 'Refinancing', 'Construction Capital', 'Investment Financing'],
    },
    {
      id: 'aix-media',
      name: 'AiX MEDIA',
      brandTitle: 'AiX Media',
      category: 'MEDIA',
      categoryLabel: 'Media & Digital Growth',
      tagline: 'Media & Digital Growth Infrastructure.',
      description:
        'Dedicated division and platform within the ecosystem for media production, digital presence, content strategy and growth.',
      role: 'Founder',
      url: 'https://aixmedia.cristianvaduva.com',
      status: 'LIVE',
      features: ['Digital Presence', 'Content Infrastructure', 'Growth Strategy', 'Media Distribution'],
    },
    {
      id: 'aixluxury',
      name: 'AiXLuxury',
      brandTitle: 'AiXLuxury',
      category: 'REAL ESTATE',
      categoryLabel: 'Luxury & Global Assets',
      tagline: 'Luxury Real Estate & Asset Ecosystem.',
      description:
        'Dedicated ecosystem for luxury real estate, international property, asset acquisition strategy, and prime market positioning.',
      role: 'Founder',
      url: 'https://aixluxury.com',
      status: 'LIVE',
      features: ['Luxury Real Estate', 'International Property', 'Asset Strategy', 'Acquisition & Protection'],
    },
    {
      id: 'aix-os',
      name: 'AiX OS',
      brandTitle: 'AiX OS',
      category: 'TECH',
      categoryLabel: 'Operating System & Infrastructure',
      tagline: 'The operating system behind the ecosystem.',
      description:
        'The unified digital infrastructure and intelligence layer connecting all vertical platforms, workflows, and lead operations.',
      role: 'Architect & Lead Builder',
      url: 'https://os.aixluxury.com',
      status: 'LIVE',
      features: ['Unified Operations', 'Intelligence Layer', 'Cross-Platform Workflows', 'Centralized Hub'],
    },
    {
      id: 'fly',
      name: 'FLY',
      brandTitle: 'FLY',
      category: 'AVIATION',
      categoryLabel: 'Aviation Platform',
      tagline: 'THE EASIEST WAY TO FLY.',
      description:
        'Dedicated flight discovery and private aviation platform designed for seamless air travel solutions.',
      role: 'Founder',
      url: 'https://fly.cristianvaduva.com',
      status: 'LIVE',
      features: ['Flight Discovery', 'Private Aviation Advisory', 'Direct Route Intelligence'],
    },
    {
      id: 'dubai',
      name: 'DUBAI',
      brandTitle: 'Dubai Real Estate Intelligence',
      category: 'REAL ESTATE',
      categoryLabel: 'Dubai Property Intelligence',
      tagline: 'Dubai Real Estate Intelligence.',
      description:
        'Specialized discovery platform focused on verified property information, UAE market insights, and cross-border investor intelligence.',
      role: 'Founder & Advisor',
      url: 'https://dubai.cristianvaduva.com',
      status: 'LIVE',
      features: ['Verified Properties', 'Market Trends', 'Investor Intelligence', 'Off-Plan & Prime'],
    },
    {
      id: 'constructions',
      name: 'CONSTRUCTIONS by AiXLuxury',
      brandTitle: 'CONSTRUCTIONS by AiXLuxury',
      category: 'CONSTRUCTION',
      categoryLabel: 'Construction & Material Intelligence',
      tagline: 'Construction Market Intelligence & Factually Verified Materials Platform.',
      description:
        'Ecosystem dedicated to connecting developers, general contractors, suppliers, architects, structural engineers, and key industry participants.',
      role: 'Founder & Platform Creator',
      url: 'https://constructions.cristianvaduva.com',
      status: 'LIVE',
      features: ['Material Verification', 'Industry Network', 'Market Intelligence', 'Contractor Ecosystem'],
    },
    {
      id: 'subventii',
      name: 'SUBVENȚII',
      brandTitle: 'Subvenții / Funding Intelligence',
      category: 'FINANCE',
      categoryLabel: 'Funding Intelligence',
      tagline: 'Subvenții / Funding Intelligence.',
      description:
        'Dedicated platform for structured information, grant programs, and funding intelligence opportunities.',
      role: 'Creator',
      url: 'https://subventii.ro',
      status: 'LIVE',
      features: ['Funding Intelligence', 'Grant Programs', 'Opportunity Tracking'],
    },
    {
      id: 'health',
      name: 'HEALTH',
      brandTitle: 'Health Solutions',
      category: 'HEALTH',
      categoryLabel: 'Health & Vitality',
      tagline: 'Health & Vitality Solutions.',
      description:
        'Health advisory and ecosystem vitality vertical connecting longevity and health protection resources.',
      role: 'Founder',
      url: 'https://cristianvaduva.com',
      status: 'ECOSYSTEM',
      features: ['Health Advisory', 'Protection Solutions', 'Vitality Ecosystem'],
    },
  ] as ProjectItem[],

  manifesto: {
    whyAetherExists: {
      headline: 'WHY AETHER EXISTS',
      lines: [
        'Most platforms measure attention.',
        'Aether measures action.',
        'Social media became a record of what people post.',
        'Aether is built around what people actually do.',
      ],
      examples: [
        'The workout.',
        'The project.',
        'The exam.',
        'The business.',
        'The skill.',
        'The milestone.',
        'The thing you said you would do — and actually did.',
      ],
      conclusion: 'Aether turns those actions into visible proof.',
    },

    theProblem: {
      headline: 'THE INTERNET GOT VERY GOOD AT SHOWING WHO PEOPLE WANT TO LOOK LIKE.',
      subheadline: 'But much less good at showing: who they are becoming.',
      contrasts: [
        { fake: 'Followers', real: 'are not proof.' },
        { fake: 'Likes', real: 'are not progress.' },
        { fake: 'Views', real: 'are not achievement.' },
        { fake: 'Aesthetic posts', real: 'are not evidence.' },
      ],
      primitive: 'Aether introduces a different primitive: PROOF.',
    },

    whatAetherDoes: {
      loopSummary: 'DO → PROVE → FLEX → SEE PROGRESS → SEE OTHERS → DO AGAIN',
      steps: [
        {
          key: 'DO',
          title: 'DO',
          description: 'Go into the real world and do something.',
        },
        {
          key: 'PROVE',
          title: 'PROVE',
          description: 'Create a Proof of the action.',
        },
        {
          key: 'FLEX',
          title: 'FLEX',
          description: 'Your achievements become part of your visible identity.',
        },
        {
          key: 'PROGRESS',
          title: 'PROGRESS',
          description: 'Your Flex Score and streak reflect consistency.',
        },
        {
          key: 'REPEAT',
          title: 'REPEAT',
          description: 'The system encourages the next real action.',
        },
      ],
    },

    whyItMatters: {
      headline: 'YOUR DIGITAL IDENTITY SHOULD REFLECT YOUR REAL LIFE.',
      currentStatus: [
        'followers',
        'likes',
        'photos',
        'comments',
        'opinions',
        'aesthetics',
      ],
      aetherQuestion: 'What have you actually done?',
      body: 'Your profile becomes a record of progress. Not just what you say. Not just what you post. What you can prove.',
    },

    benefits: [
      {
        number: '01',
        title: 'IDENTITY',
        description: 'Build an identity around what you actually accomplish.',
      },
      {
        number: '02',
        title: 'ACCOUNTABILITY',
        description: 'A visible record creates pressure to keep moving.',
      },
      {
        number: '03',
        title: 'PROGRESS',
        description: 'See your consistency instead of relying on memory.',
      },
      {
        number: '04',
        title: 'SOCIAL MOTIVATION',
        description: "Other people's progress becomes inspiration for your own action.",
      },
    ],
    tagline: 'Proof over popularity.',

    whyIBuiltIt: {
      title: 'WHY I BUILT AETHER',
      copy: [
        "I've spent years working around decisions, assets, businesses, sales, risk, technology and growth.",
        'Across all of those environments, one thing became increasingly obvious: What people build matters more than what they say.',
        'Aether was created around that idea.',
        'A place where progress can become visible. Where consistency can become identity. Where actions can become proof.',
        'And where your digital profile can represent something that actually happened in your real life.',
      ],
    },

    biggerVision: {
      badge: 'THE BIGGER VISION',
      title: 'FROM SOCIAL MEDIA TO SOCIAL PROOF',
      statement: "The next generation of social identity shouldn't only answer: “Who do you follow?”",
      questions: [
        'It should also answer: “What have you done?”',
        'Then: “What are you building?”',
        'Then: “Who are you becoming?”',
      ],
    },

    ecosystemConnection: {
      title: 'AETHER & THE DIGITAL ECOSYSTEM',
      body:
        'AETHER is not another business directory. It is the personal proof / identity layer of a builder’s life.',
      contrast:
        'The other platforms are designed around real-world verticals: Real Estate, Insurance, Finance, Construction, Aviation, Technology and Intelligence. AETHER is different. AETHER is about the person behind the work.',
    },
  },
};
