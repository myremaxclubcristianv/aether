export type DailyCategory =
  | 'COMMUNICATION'
  | 'PSYCHOLOGY'
  | 'BUSINESS'
  | 'MARKETING'
  | 'HUMAN'
  | 'KNOWLEDGE'
  | 'WORLD'
  | 'OBSERVATION'
  | 'CONFIDENCE'
  | 'CREATIVITY'
  | 'DECISION'
  | 'CRITICAL_THINKING'
  | 'DISCIPLINE'
  | 'REFLECTION'
  | 'LEADERSHIP'
  | 'NEGOTIATION'
  | 'EMPATHY'
  | 'PERSUASION'
  | 'WRITING'
  | 'SOCIAL'
  | 'FINANCE'
  | 'NETWORKING'
  | 'PERSONALITY';

export interface DailyTask {
  id: string;
  title: string;
  category: DailyCategory;
  proofCategory: 'Learning' | 'Creating' | 'Building' | 'Lifestyle' | 'Achievement' | 'Fitness' | 'General';
  action: string;
  why: string;
  timeEstimate: string;
  proofPrompt: string;
  difficulty: 'EASY' | 'MEDIUM' | 'DEEP';
  domains: string[];
  requiresInteraction: boolean;
  cooldownDays: number;
}

export const DAILY_TASKS: DailyTask[] = [
  // ==========================================
  // COMMUNICATION
  // ==========================================
  {
    id: 'comm-001',
    title: 'Listen without preparing your reply.',
    category: 'COMMUNICATION',
    proofCategory: 'Learning',
    action: 'Have one conversation today where you deliberately listen to someone for at least 3 minutes without preparing what you will say next.',
    why: 'Most people listen to respond. Practicing curiosity over response dramatically increases relational trust and comprehension.',
    timeEstimate: '5 MIN',
    proofPrompt: 'What did you notice about the other person when you truly stayed present?',
    difficulty: 'EASY',
    domains: ['communication', 'social', 'listening'],
    requiresInteraction: true,
    cooldownDays: 14,
  },
  {
    id: 'comm-002',
    title: 'Ask one deep follow-up question.',
    category: 'COMMUNICATION',
    proofCategory: 'Learning',
    action: 'In your next conversation, before talking about yourself, ask one sincere follow-up question digging deeper into what they just said.',
    why: 'Follow-up questions signal genuine intelligence and social respect.',
    timeEstimate: '2 MIN',
    proofPrompt: 'What follow-up question did you ask, and what did you learn?',
    difficulty: 'EASY',
    domains: ['communication', 'curiosity'],
    requiresInteraction: true,
    cooldownDays: 10,
  },
  {
    id: 'comm-003',
    title: 'Explain a complex concept in 60 seconds.',
    category: 'COMMUNICATION',
    proofCategory: 'Creating',
    action: 'Take a complex idea or part of your work and explain it out loud in under 60 seconds to someone without using any industry jargon.',
    why: 'If you cannot explain it simply, you do not understand it deeply enough.',
    timeEstimate: '5 MIN',
    proofPrompt: 'What concept did you explain, and which part was hardest to simplify?',
    difficulty: 'MEDIUM',
    domains: ['communication', 'clarity', 'teaching'],
    requiresInteraction: false,
    cooldownDays: 14,
  },
  {
    id: 'comm-004',
    title: 'Call instead of text.',
    category: 'COMMUNICATION',
    proofCategory: 'Lifestyle',
    action: 'Pick one message you were going to type and make a brief voice call instead.',
    why: 'Tone, pacing, and human presence communicate nuances that text flatlines.',
    timeEstimate: '5 MIN',
    proofPrompt: 'How did the tone of the interaction differ from a standard text thread?',
    difficulty: 'EASY',
    domains: ['communication', 'relationships'],
    requiresInteraction: true,
    cooldownDays: 12,
  },
  {
    id: 'comm-005',
    title: 'Give an unattached sincere compliment.',
    category: 'COMMUNICATION',
    proofCategory: 'Lifestyle',
    action: 'Give someone a specific, sincere compliment on their effort or character, without adding any joke or request afterward.',
    why: 'Clean recognition with no hidden agenda builds genuine rapport.',
    timeEstimate: '2 MIN',
    proofPrompt: 'What specific trait did you acknowledge?',
    difficulty: 'EASY',
    domains: ['communication', 'empathy'],
    requiresInteraction: true,
    cooldownDays: 10,
  },
  {
    id: 'comm-006',
    title: 'The Silent Pause.',
    category: 'COMMUNICATION',
    proofCategory: 'Learning',
    action: 'When asked a question today, pause for 2 full seconds before answering instead of rushing to fill the silence.',
    why: 'A measured pause projects composure and allows thought quality to precede reaction.',
    timeEstimate: '2 MIN',
    proofPrompt: 'How did the pause affect your answer and the other person’s demeanor?',
    difficulty: 'EASY',
    domains: ['communication', 'presence'],
    requiresInteraction: true,
    cooldownDays: 10,
  },

  // ==========================================
  // PSYCHOLOGY
  // ==========================================
  {
    id: 'psych-001',
    title: 'Identify what the other person is protecting.',
    category: 'PSYCHOLOGY',
    proofCategory: 'Learning',
    action: 'Think of a recent disagreement or tension. Ask yourself: what insecurity, identity, or resource was the other person trying to protect?',
    why: 'Conflict is rarely about the surface topic; it is almost always about status, fear, or security.',
    timeEstimate: '5 MIN',
    proofPrompt: 'What underlying need or fear was driving their stance?',
    difficulty: 'MEDIUM',
    domains: ['psychology', 'empathy', 'conflict'],
    requiresInteraction: false,
    cooldownDays: 14,
  },
  {
    id: 'psych-002',
    title: 'Catch yourself seeking validation.',
    category: 'PSYCHOLOGY',
    proofCategory: 'Learning',
    action: 'Notice one instance today where you altered your words, posture, or opinion solely to gain approval from someone in the room.',
    why: 'Self-awareness of approval-seeking is the first step toward genuine internal sovereignty.',
    timeEstimate: '5 MIN',
    proofPrompt: 'What was the situation, and what were you hoping they would think of you?',
    difficulty: 'MEDIUM',
    domains: ['psychology', 'self-awareness'],
    requiresInteraction: false,
    cooldownDays: 12,
  },
  {
    id: 'psych-003',
    title: 'Separate fact from narrative.',
    category: 'PSYCHOLOGY',
    proofCategory: 'Learning',
    action: 'Take a frustrating event from today and split it into two columns: 1) The objective facts. 2) The story you told yourself about it.',
    why: 'Suffering lives in the story, not in the factual event.',
    timeEstimate: '10 MIN',
    proofPrompt: 'What was the raw fact versus your interpreted story?',
    difficulty: 'MEDIUM',
    domains: ['psychology', 'mental-models', 'clarity'],
    requiresInteraction: false,
    cooldownDays: 14,
  },
  {
    id: 'psych-004',
    title: 'Notice an emotional trigger in real time.',
    category: 'PSYCHOLOGY',
    proofCategory: 'Learning',
    action: 'The moment you feel irritated or defensive today, take one slow breath and name the exact emotion before speaking.',
    why: 'Labeling an emotion engages the prefrontal cortex and reduces amygdala reactivity.',
    timeEstimate: '2 MIN',
    proofPrompt: 'What triggered the reaction and what was the root feeling beneath it?',
    difficulty: 'EASY',
    domains: ['psychology', 'emotional-intelligence'],
    requiresInteraction: false,
    cooldownDays: 10,
  },

  // ==========================================
  // BUSINESS
  // ==========================================
  {
    id: 'biz-001',
    title: 'Find the real value proposition.',
    category: 'BUSINESS',
    proofCategory: 'Building',
    action: 'Choose a business you paid money to recently. Identify what you actually bought (convenience, status, time savings, peace of mind) vs the physical item.',
    why: 'Great businesses sell emotional and operational outcomes, not features.',
    timeEstimate: '5 MIN',
    proofPrompt: 'What was the nominal product vs the actual underlying value you paid for?',
    difficulty: 'EASY',
    domains: ['business', 'strategy', 'value'],
    requiresInteraction: false,
    cooldownDays: 12,
  },
  {
    id: 'biz-002',
    title: 'Inspect the unit economics.',
    category: 'BUSINESS',
    proofCategory: 'Building',
    action: 'Look at a local cafe, gym, or retail shop you visit. Estimate their top 3 cost centers and where their main margin comes from.',
    why: 'Understanding gross margins and fixed overhead transforms how you see the commercial world.',
    timeEstimate: '10 MIN',
    proofPrompt: 'Where does their primary profit margin likely originate?',
    difficulty: 'MEDIUM',
    domains: ['business', 'economics', 'margins'],
    requiresInteraction: false,
    cooldownDays: 14,
  },
  {
    id: 'biz-003',
    title: 'Audit a 10-second homepage experience.',
    category: 'BUSINESS',
    proofCategory: 'Building',
    action: 'Open a B2B or SaaS homepage. Within 10 seconds, answer: What problem do they solve, for whom, and what is the exact next step?',
    why: 'Clarity beats cleverness every single time.',
    timeEstimate: '5 MIN',
    proofPrompt: 'Was their headline clear or vague, and how could it be sharper?',
    difficulty: 'EASY',
    domains: ['business', 'marketing', 'conversion'],
    requiresInteraction: false,
    cooldownDays: 10,
  },
  {
    id: 'biz-004',
    title: 'Identify the bottleneck in your workflow.',
    category: 'BUSINESS',
    proofCategory: 'Building',
    action: 'Examine your current project or workday. What is the single constraint slowing down throughput right now?',
    why: 'Improving anything other than the primary bottleneck is an illusion of progress (Theory of Constraints).',
    timeEstimate: '10 MIN',
    proofPrompt: 'What is the real constraint, and what one action clears it?',
    difficulty: 'MEDIUM',
    domains: ['business', 'productivity', 'systems'],
    requiresInteraction: false,
    cooldownDays: 14,
  },

  // ==========================================
  // MARKETING
  // ==========================================
  {
    id: 'mkt-001',
    title: 'Deconstruct an ad’s primary emotion.',
    category: 'MARKETING',
    proofCategory: 'Creating',
    action: 'Pick one advertisement you saw today. Identify the single core emotion it targets (belonging, fear of missing out, relief, pride, security).',
    why: 'Advertising works on emotional transfer before rational justification.',
    timeEstimate: '5 MIN',
    proofPrompt: 'What emotion was being transferred to the product?',
    difficulty: 'EASY',
    domains: ['marketing', 'psychology', 'persuasion'],
    requiresInteraction: false,
    cooldownDays: 10,
  },
  {
    id: 'mkt-002',
    title: 'Rewrite a weak headline in one sentence.',
    category: 'MARKETING',
    proofCategory: 'Creating',
    action: 'Find a generic marketing claim (e.g. "We deliver quality solutions") and rewrite it with high specificity and direct benefit.',
    why: 'Specific claims create mental imagery; generic claims create blindness.',
    timeEstimate: '5 MIN',
    proofPrompt: 'What was the original line and what was your rewritten version?',
    difficulty: 'EASY',
    domains: ['marketing', 'copywriting', 'clarity'],
    requiresInteraction: false,
    cooldownDays: 12,
  },
  {
    id: 'mkt-003',
    title: 'Ask why someone chose their brand.',
    category: 'MARKETING',
    proofCategory: 'Learning',
    action: 'Ask a friend or colleague why they bought their current phone, watch, or car brand. Don’t prompt them; just record their spontaneous reasons.',
    why: 'Consumer narratives reveal the gap between rationalized logic and emotional identity.',
    timeEstimate: '5 MIN',
    proofPrompt: 'What was their stated reason vs the underlying identity symbol?',
    difficulty: 'MEDIUM',
    domains: ['marketing', 'consumer-behavior'],
    requiresInteraction: true,
    cooldownDays: 14,
  },

  // ==========================================
  // HUMAN & EMPATHY
  // ==========================================
  {
    id: 'human-001',
    title: 'Ask how someone is and stay for the answer.',
    category: 'HUMAN',
    proofCategory: 'Lifestyle',
    action: 'Ask a coworker, friend, or service worker "How are you doing today?" and wait attentively for their real response without rushing away.',
    why: 'Genuine human presence is one of the rarest gifts in modern fragmented life.',
    timeEstimate: '5 MIN',
    proofPrompt: 'What shifted when you stayed present for their response?',
    difficulty: 'EASY',
    domains: ['human', 'empathy', 'connection'],
    requiresInteraction: true,
    cooldownDays: 10,
  },
  {
    id: 'human-002',
    title: 'Do not fix their problem immediately.',
    category: 'HUMAN',
    proofCategory: 'Lifestyle',
    action: 'When someone shares a struggle or frustration today, do not offer any solution. Simply reflect back what you heard and validate their feeling.',
    why: 'Unsolicited advice makes people feel unheard. Validation creates safety.',
    timeEstimate: '5 MIN',
    proofPrompt: 'How did they respond when you listened instead of giving advice?',
    difficulty: 'MEDIUM',
    domains: ['human', 'listening', 'relationships'],
    requiresInteraction: true,
    cooldownDays: 12,
  },
  {
    id: 'human-003',
    title: 'Send a debt of gratitude.',
    category: 'HUMAN',
    proofCategory: 'Lifestyle',
    action: 'Send a short message to someone from your past who helped or influenced you, thanking them for something specific.',
    why: 'Gratitude strengthens social fabric and resets perspective.',
    timeEstimate: '5 MIN',
    proofPrompt: 'Who did you thank and for what specific contribution?',
    difficulty: 'EASY',
    domains: ['human', 'gratitude'],
    requiresInteraction: false,
    cooldownDays: 20,
  },
  {
    id: 'human-004',
    title: 'Learn one thing about someone you took for granted.',
    category: 'HUMAN',
    proofCategory: 'Lifestyle',
    action: 'Ask someone you see regularly (barista, neighbor, security guard, colleague) about their background or what they enjoy doing outside work.',
    why: 'Everyone has a rich internal universe you know nothing about.',
    timeEstimate: '5 MIN',
    proofPrompt: 'What did you discover about them that you never knew?',
    difficulty: 'EASY',
    domains: ['human', 'curiosity', 'respect'],
    requiresInteraction: true,
    cooldownDays: 12,
  },

  // ==========================================
  // OBSERVATION
  // ==========================================
  {
    id: 'obs-001',
    title: 'Observe a public room without looking at your phone.',
    category: 'OBSERVATION',
    proofCategory: 'Learning',
    action: 'Sit in a public place (cafe, transit station, lobby) for 10 minutes without touching your phone. Watch posture, micro-expressions, and interactions.',
    why: 'Constant phone usage destroys situational awareness and observational intuition.',
    timeEstimate: '10 MIN',
    proofPrompt: 'What did you observe that most people looking at their screens missed?',
    difficulty: 'EASY',
    domains: ['observation', 'presence', 'focus'],
    requiresInteraction: false,
    cooldownDays: 10,
  },
  {
    id: 'obs-002',
    title: 'Notice who speaks first in a group.',
    category: 'OBSERVATION',
    proofCategory: 'Learning',
    action: 'During your next group meeting or table conversation, observe who speaks first, who speaks most, and who gets interrupted.',
    why: 'Group dynamics reveal informal status hierarchies and social dynamics.',
    timeEstimate: '15 MIN',
    proofPrompt: 'What was the dynamic between the loudest participant and the quietest?',
    difficulty: 'MEDIUM',
    domains: ['observation', 'social-intelligence'],
    requiresInteraction: true,
    cooldownDays: 14,
  },
  {
    id: 'obs-003',
    title: 'Walk without headphones for 15 minutes.',
    category: 'OBSERVATION',
    proofCategory: 'Fitness',
    action: 'Take a 15-minute walk outside with zero audio input—no podcasts, no music, no phone calls. Notice the ambient soundscape.',
    why: 'Sensory overload prevents passive consolidation and creativity.',
    timeEstimate: '15 MIN',
    proofPrompt: 'What thoughts or physical observations surfaced during the quiet walk?',
    difficulty: 'EASY',
    domains: ['observation', 'mindfulness', 'clarity'],
    requiresInteraction: false,
    cooldownDays: 10,
  },

  // ==========================================
  // CONFIDENCE & COURAGE
  // ==========================================
  {
    id: 'conf-001',
    title: 'Make a decision without asking for validation.',
    category: 'CONFIDENCE',
    proofCategory: 'Achievement',
    action: 'Make one small or medium decision today entirely on your own without polling friends, family, or colleagues for reassurance.',
    why: 'Self-trust is a muscle built through repeated unvalidated choices.',
    timeEstimate: '5 MIN',
    proofPrompt: 'What decision did you make, and how did it feel to own it completely?',
    difficulty: 'MEDIUM',
    domains: ['confidence', 'autonomy', 'decision'],
    requiresInteraction: false,
    cooldownDays: 12,
  },
  {
    id: 'conf-002',
    title: 'Say a clean "No" without an over-apology.',
    category: 'CONFIDENCE',
    proofCategory: 'Achievement',
    action: 'Decline one reasonable invitation or request that you genuinely do not have bandwidth for, using polite brevity without writing an essay of excuses.',
    why: 'Boundaries stated calmly without excessive defense project strength and respect everyone’s time.',
    timeEstimate: '2 MIN',
    proofPrompt: 'How did you phrase the refusal, and what was the outcome?',
    difficulty: 'MEDIUM',
    domains: ['confidence', 'boundaries'],
    requiresInteraction: true,
    cooldownDays: 14,
  },
  {
    id: 'conf-003',
    title: 'Start one conversation you would normally avoid.',
    category: 'CONFIDENCE',
    proofCategory: 'Achievement',
    action: 'Initiate a direct conversation about a topic or with a person where you felt slight hesitation or resistance.',
    why: 'The conversations you avoid hold the growth you are seeking.',
    timeEstimate: '10 MIN',
    proofPrompt: 'What was the conversation about, and was the reality better than your anticipation?',
    difficulty: 'DEEP',
    domains: ['confidence', 'courage', 'directness'],
    requiresInteraction: true,
    cooldownDays: 16,
  },

  // ==========================================
  // CRITICAL THINKING & DECISION
  // ==========================================
  {
    id: 'crit-001',
    title: 'Steel-man your strongest disagreement.',
    category: 'CRITICAL_THINKING',
    proofCategory: 'Learning',
    action: 'Take a position you disagree with. Write down the most coherent, intelligent, compassionate argument for that viewpoint in 3 sentences.',
    why: 'If you cannot articulate the opposing view better than your opponent, you do not understand the debate.',
    timeEstimate: '10 MIN',
    proofPrompt: 'What is the strongest rationale for the stance you usually oppose?',
    difficulty: 'MEDIUM',
    domains: ['critical-thinking', 'reasoning'],
    requiresInteraction: false,
    cooldownDays: 14,
  },
  {
    id: 'crit-002',
    title: 'Second-order consequence check.',
    category: 'DECISION',
    proofCategory: 'Learning',
    action: 'For a decision you are facing, ask: "And then what happens?" for the next 3 stages (1 month, 6 months, 2 years).',
    why: 'First-order effects look attractive; second- and third-order effects determine real outcomes.',
    timeEstimate: '10 MIN',
    proofPrompt: 'What hidden second-order consequence did you identify?',
    difficulty: 'MEDIUM',
    domains: ['decision', 'strategy', 'forecasting'],
    requiresInteraction: false,
    cooldownDays: 14,
  },
  {
    id: 'crit-003',
    title: 'Identify a sunk cost you are defending.',
    category: 'DECISION',
    proofCategory: 'Achievement',
    action: 'Identify one project, habit, or commitment you are continuing solely because you already spent time or money on it.',
    why: 'Past investment is unrecoverable; future allocation should only be guided by expected future value.',
    timeEstimate: '10 MIN',
    proofPrompt: 'What sunk cost did you recognize, and should you adjust your course?',
    difficulty: 'MEDIUM',
    domains: ['decision', 'economics', 'clarity'],
    requiresInteraction: false,
    cooldownDays: 16,
  },

  // ==========================================
  // KNOWLEDGE & WORLD
  // ==========================================
  {
    id: 'know-001',
    title: 'Learn one concept you have faked understanding.',
    category: 'KNOWLEDGE',
    proofCategory: 'Learning',
    action: 'Pick a term or concept you have heard people use (e.g. inflation mechanism, DNS routing, how a circuit breaker works) and spend 10 minutes actually understanding it.',
    why: 'True intellectual depth comes from closing the small gaps you usually nod along to.',
    timeEstimate: '10 MIN',
    proofPrompt: 'Explain the concept in your own words in two clear sentences.',
    difficulty: 'MEDIUM',
    domains: ['knowledge', 'intellect', 'learning'],
    requiresInteraction: false,
    cooldownDays: 12,
  },
  {
    id: 'know-002',
    title: 'Understand a culture or region outside your feed.',
    category: 'WORLD',
    proofCategory: 'Learning',
    action: 'Read a neutral historical or geographical summary of a country you know very little about (its population, primary industries, modern challenges).',
    why: 'Expanding your geographical and geopolitical aperture prevents parochial bias.',
    timeEstimate: '15 MIN',
    proofPrompt: 'What country or topic did you research and what was the most surprising fact?',
    difficulty: 'MEDIUM',
    domains: ['world', 'geography', 'history'],
    requiresInteraction: false,
    cooldownDays: 14,
  },
  {
    id: 'know-003',
    title: 'Trace where an everyday object comes from.',
    category: 'WORLD',
    proofCategory: 'Learning',
    action: 'Pick one physical item on your desk (coffee mug, pen, microchip). Trace the supply chain and materials required to produce it.',
    why: 'Modern civilization is an astonishing web of global coordination that we rarely appreciate.',
    timeEstimate: '10 MIN',
    proofPrompt: 'What raw materials and global steps went into making this item?',
    difficulty: 'EASY',
    domains: ['world', 'supply-chain', 'appreciation'],
    requiresInteraction: false,
    cooldownDays: 16,
  },

  // ==========================================
  // CREATIVITY & DISCIPLINE
  // ==========================================
  {
    id: 'creat-001',
    title: 'Combine two unrelated fields.',
    category: 'CREATIVITY',
    proofCategory: 'Creating',
    action: 'Pick one concept from biology, architecture, or sports, and apply its principle to a problem in your primary work.',
    why: 'True innovation is rarely inventing from zero; it is cross-pollinating proven principles across boundaries.',
    timeEstimate: '10 MIN',
    proofPrompt: 'What two concepts did you link and what new angle emerged?',
    difficulty: 'MEDIUM',
    domains: ['creativity', 'innovation', 'synthesis'],
    requiresInteraction: false,
    cooldownDays: 14,
  },
  {
    id: 'disc-001',
    title: 'Complete the task you have been putting off for days.',
    category: 'DISCIPLINE',
    proofCategory: 'Achievement',
    action: 'Identify the one annoying administrative or practical chore you have postponed all week. Spend 15 minutes doing it right now.',
    why: 'Unfinished low-grade tasks drain psychological bandwidth continuously.',
    timeEstimate: '15 MIN',
    proofPrompt: 'What task did you finally complete and how much mental weight did it release?',
    difficulty: 'MEDIUM',
    domains: ['discipline', 'execution'],
    requiresInteraction: false,
    cooldownDays: 10,
  },
  {
    id: 'disc-002',
    title: 'Single-task for 25 uninterrupted minutes.',
    category: 'DISCIPLINE',
    proofCategory: 'Building',
    action: 'Close all tabs, silence notifications, and work on a single critical document or task for 25 minutes without switching contexts once.',
    why: 'Monotasking restores depth and neural focus.',
    timeEstimate: '25 MIN',
    proofPrompt: 'What did you achieve when attention wasn’t split across tabs?',
    difficulty: 'MEDIUM',
    domains: ['discipline', 'focus', 'deep-work'],
    requiresInteraction: false,
    cooldownDays: 10,
  },

  // ==========================================
  // REFLECTION & HUMILITY
  // ==========================================
  {
    id: 'ref-001',
    title: 'Today I Realized...',
    category: 'REFLECTION',
    proofCategory: 'Learning',
    action: 'Pause at the end of the day. Complete the sentence: "Today I realized something about myself or the world that I hadn’t clearly recognized before."',
    why: 'Experience without reflection is merely passing time; reflection turns events into wisdom.',
    timeEstimate: '5 MIN',
    proofPrompt: 'What did today teach you that you want to remember?',
    difficulty: 'EASY',
    domains: ['reflection', 'growth', 'wisdom'],
    requiresInteraction: false,
    cooldownDays: 7,
  },
  {
    id: 'ref-002',
    title: 'Ask someone to teach you something.',
    category: 'REFLECTION',
    proofCategory: 'Learning',
    action: 'Ask a colleague, friend, or younger/older person to explain or teach you a skill or tool they understand better than you.',
    why: 'Humility opens knowledge pipelines that arrogance keeps sealed.',
    timeEstimate: '10 MIN',
    proofPrompt: 'What did they teach you, and what nuance did you learn?',
    difficulty: 'EASY',
    domains: ['reflection', 'humility', 'learning'],
    requiresInteraction: true,
    cooldownDays: 14,
  },
  {
    id: 'ref-003',
    title: 'Identify one belief you changed your mind about.',
    category: 'REFLECTION',
    proofCategory: 'Learning',
    action: 'Reflect on a topic where your opinion today is substantially different from 2 years ago. What evidence or experience caused the shift?',
    why: 'The ability to update beliefs in light of reality is the ultimate hallmark of intellectual integrity.',
    timeEstimate: '10 MIN',
    proofPrompt: 'What belief changed and what was the catalyst?',
    difficulty: 'MEDIUM',
    domains: ['reflection', 'mindset', 'growth'],
    requiresInteraction: false,
    cooldownDays: 16,
  },

  // ==========================================
  // LEADERSHIP & CULTURE
  // ==========================================
  {
    id: 'lead-001',
    title: 'Give credit publicly, critique privately.',
    category: 'LEADERSHIP',
    proofCategory: 'Lifestyle',
    action: 'Acknowledge someone else’s contribution or success in front of others today, without attaching your own name to the credit.',
    why: 'True leaders act as mirrors when things go well and shields when things go wrong.',
    timeEstimate: '2 MIN',
    proofPrompt: 'Whom did you spotlight and what was the reaction?',
    difficulty: 'EASY',
    domains: ['leadership', 'team', 'culture'],
    requiresInteraction: true,
    cooldownDays: 12,
  },
  {
    id: 'lead-002',
    title: 'Ask "What do you need from me?"',
    category: 'LEADERSHIP',
    proofCategory: 'Building',
    action: 'Ask a team member, partner, or peer: "What is currently getting in your way, and how can I help clear it?"',
    why: 'Servant leadership focuses on removing friction rather than asserting authority.',
    timeEstimate: '5 MIN',
    proofPrompt: 'What bottleneck did they describe?',
    difficulty: 'EASY',
    domains: ['leadership', 'support', 'management'],
    requiresInteraction: true,
    cooldownDays: 14,
  },

  // ==========================================
  // NEGOTIATION & PERSUASION
  // ==========================================
  {
    id: 'neg-001',
    title: 'Uncover the non-monetary currency.',
    category: 'NEGOTIATION',
    proofCategory: 'Learning',
    action: 'In any trade-off or agreement today, identify what the other party values that does not cost money (speed, recognition, flexibility, certainty).',
    why: 'Great negotiation expands the pie by trading low-cost high-value asymmetric terms.',
    timeEstimate: '10 MIN',
    proofPrompt: 'What non-monetary currency did you discover?',
    difficulty: 'MEDIUM',
    domains: ['negotiation', 'value', 'alignment'],
    requiresInteraction: true,
    cooldownDays: 14,
  },
  {
    id: 'pers-001',
    title: 'Address the main objection first.',
    category: 'PERSUASION',
    proofCategory: 'Creating',
    action: 'When pitching an idea, request, or proposal today, bring up the biggest potential counter-argument yourself before they can.',
    why: 'Preempting objections disarms skepticism and signals supreme confidence in your reasoning.',
    timeEstimate: '5 MIN',
    proofPrompt: 'What objection did you voice first, and how was it received?',
    difficulty: 'MEDIUM',
    domains: ['persuasion', 'sales', 'clarity'],
    requiresInteraction: true,
    cooldownDays: 14,
  },

  // ==========================================
  // WRITING & CLARITY
  // ==========================================
  {
    id: 'writ-001',
    title: 'Cut every message by 30%.',
    category: 'WRITING',
    proofCategory: 'Creating',
    action: 'Before sending your next important email or document, delete 30% of the words without losing any essential meaning.',
    why: 'Brevity is the soul of wit and the mark of respect for the reader’s attention.',
    timeEstimate: '5 MIN',
    proofPrompt: 'How many sentences did you cut, and how did it read afterwards?',
    difficulty: 'EASY',
    domains: ['writing', 'clarity', 'communication'],
    requiresInteraction: false,
    cooldownDays: 10,
  },

  // ==========================================
  // SOCIAL & NETWORKING
  // ==========================================
  {
    id: 'soc-001',
    title: 'Make a warm introduction.',
    category: 'SOCIAL',
    proofCategory: 'Lifestyle',
    action: 'Introduce two people in your network who could genuinely benefit from knowing each other, explaining why the connection is valuable.',
    why: 'Superconnectors create non-zero-sum value across disparate circles.',
    timeEstimate: '5 MIN',
    proofPrompt: 'Whom did you introduce and what was the mutual connection point?',
    difficulty: 'MEDIUM',
    domains: ['social', 'networking', 'generosity'],
    requiresInteraction: true,
    cooldownDays: 20,
  },
  {
    id: 'soc-002',
    title: 'Say hello to someone in transit.',
    category: 'SOCIAL',
    proofCategory: 'Lifestyle',
    action: 'Exchange a polite, warm greeting with an elevator operator, transit driver, or clerk without staring down at your phone screen.',
    why: 'Micro-interactions ground your humanity in everyday reality.',
    timeEstimate: '2 MIN',
    proofPrompt: 'What was their reaction to genuine eye contact and a greeting?',
    difficulty: 'EASY',
    domains: ['social', 'warmth', 'presence'],
    requiresInteraction: true,
    cooldownDays: 10,
  },

  // ==========================================
  // FINANCE & DECISION
  // ==========================================
  {
    id: 'fin-001',
    title: 'Audit recurring subscriptions.',
    category: 'FINANCE',
    proofCategory: 'Achievement',
    action: 'Look at your bank or credit card statement for the past month. Cancel at least one subscription you haven’t actively used in 30 days.',
    why: 'Financial leakages reflect unexamined psychological inertia.',
    timeEstimate: '10 MIN',
    proofPrompt: 'What service did you cancel, and what was your original justification?',
    difficulty: 'EASY',
    domains: ['finance', 'discipline', 'clarity'],
    requiresInteraction: false,
    cooldownDays: 30,
  },
];
