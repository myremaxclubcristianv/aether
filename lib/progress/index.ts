import { ProofRecord, UserProfile } from '@/types';

export interface MilestoneItem {
  id: string;
  title: string;
  description: string;
  category: string;
  isEarned: boolean;
  earnedAt?: string;
  progressText?: string;
}

export interface MonthlyTimelineBucket {
  monthKey: string; // e.g. "2026-10"
  monthName: string; // e.g. "OCTOBER 2026"
  year: number;
  monthIndex: number;
  proofCount: number;
  activeDays: number;
  flexScoreGained: number;
  topCategory: string;
  categories: { name: string; count: number }[];
}

export interface Window30DaysMetrics {
  proofCount: number;
  activeDays: number;
  categoriesCount: number;
  flexScoreGained: number;
  proofsPerActiveDay: number;
  topCategory: string;
  categories: { name: string; count: number }[];
}

export interface WeeklyRecapData {
  currentWeek: {
    startDate: string;
    endDate: string;
    proofCount: number;
    activeDays: number;
    flexScoreGained: number;
    topCategory: string;
    categoriesCount: number;
  };
  previousWeek: {
    startDate: string;
    endDate: string;
    proofCount: number;
    activeDays: number;
    flexScoreGained: number;
  };
  growthPercent: number | null; // e.g. +25 or -10, or null if previous week has 0 proofs
  summaryStatus: 'BUILDING' | 'STEADY' | 'RESETTING' | 'STARTING';
}

export type MomentumState = 'BUILDING' | 'STEADY' | 'RESETTING' | 'STARTING';

export interface PersonalMomentum {
  state: MomentumState;
  title: string;
  description: string;
  recent7DaysCount: number;
  previous7DaysCount: number;
  activeDaysLast7: number;
}

export interface UserProgressData {
  profile: UserProfile;
  totalProofs: number;
  flexScore: number;
  activeDays: number;
  currentStreak: number;
  bestStreak: number;
  momentum: PersonalMomentum;
  window30Days: Window30DaysMetrics;
  weeklyRecap: WeeklyRecapData;
  timeline: MonthlyTimelineBucket[];
  milestones: MilestoneItem[];
  categoryBreakdown: { name: string; count: number; points: number; percent: number }[];
}

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

/**
 * Deterministically computes full progress intelligence from real user Proof records.
 */
export function computeUserProgress(
  profile: UserProfile,
  proofs: ProofRecord[],
  followersCount: number = 0
): UserProgressData {
  const now = new Date();
  const sortedProofs = [...proofs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // 1. Calculate active days (distinct YYYY-MM-DD dates)
  const distinctDatesSet = new Set<string>();
  const proofsByDateMap = new Map<string, ProofRecord[]>();

  sortedProofs.forEach((p) => {
    const d = new Date(p.createdAt);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    distinctDatesSet.add(dateKey);

    const existing = proofsByDateMap.get(dateKey) || [];
    existing.push(p);
    proofsByDateMap.set(dateKey, existing);
  });

  const totalActiveDays = distinctDatesSet.size;

  // 2. Compute category breakdown
  const categoryCounts: Record<string, { count: number; points: number }> = {};

  sortedProofs.forEach((p) => {
    const cat = p.category || 'General';
    const pts = p.points || 10;

    if (!categoryCounts[cat]) {
      categoryCounts[cat] = { count: 0, points: 0 };
    }
    categoryCounts[cat].count += 1;
    categoryCounts[cat].points += pts;
  });

  const categoryBreakdown = Object.entries(categoryCounts)
    .map(([name, data]) => ({
      name,
      count: data.count,
      points: data.points,
      percent: sortedProofs.length > 0 ? Math.round((data.count / sortedProofs.length) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // 3. Compute 30-Day Window (Past 30 days from now)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const proofs30Days = sortedProofs.filter((p) => new Date(p.createdAt) >= thirtyDaysAgo);
  const distinct30Days = new Set<string>();
  const cat30Counts: Record<string, number> = {};
  let score30 = 0;

  proofs30Days.forEach((p) => {
    const d = new Date(p.createdAt);
    distinct30Days.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    cat30Counts[p.category || 'General'] = (cat30Counts[p.category || 'General'] || 0) + 1;
    score30 += p.points || 10;
  });

  const cat30List = Object.entries(cat30Counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const window30Days: Window30DaysMetrics = {
    proofCount: proofs30Days.length,
    activeDays: distinct30Days.size,
    categoriesCount: cat30List.length,
    flexScoreGained: score30,
    proofsPerActiveDay: distinct30Days.size > 0 ? +(proofs30Days.length / distinct30Days.size).toFixed(1) : 0,
    topCategory: cat30List[0]?.name || 'None',
    categories: cat30List,
  };

  // 4. Compute 7-day vs previous 7-day Personal Momentum
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const proofsLast7Days = sortedProofs.filter((p) => new Date(p.createdAt) >= sevenDaysAgo);
  const proofsPrev7Days = sortedProofs.filter(
    (p) => new Date(p.createdAt) >= fourteenDaysAgo && new Date(p.createdAt) < sevenDaysAgo
  );

  const activeDaysLast7Set = new Set<string>();
  proofsLast7Days.forEach((p) => {
    const d = new Date(p.createdAt);
    activeDaysLast7Set.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  });

  let momentumState: MomentumState = 'STARTING';
  let momentumTitle = 'STARTING';
  let momentumDesc = 'Log proofs to establish your weekly momentum.';

  if (sortedProofs.length === 0) {
    momentumState = 'STARTING';
    momentumTitle = 'NO RECORD YET';
    momentumDesc = 'Create your first Proof to begin building your consistency graph.';
  } else if (sortedProofs.length < 3 && proofsLast7Days.length <= 1) {
    momentumState = 'STARTING';
    momentumTitle = 'INITIAL TRACTION';
    momentumDesc = 'Initial proofs recorded. Continue showing up this week.';
  } else if (proofsLast7Days.length > proofsPrev7Days.length) {
    momentumState = 'BUILDING';
    momentumTitle = 'BUILDING MOMENTUM';
    momentumDesc = `Activity is accelerating (+${proofsLast7Days.length - proofsPrev7Days.length} vs prior 7 days).`;
  } else if (proofsLast7Days.length === proofsPrev7Days.length && proofsLast7Days.length > 0) {
    momentumState = 'STEADY';
    momentumTitle = 'STEADY CONSISTENCY';
    momentumDesc = `Consistent output maintained across the last two 7-day cycles (${proofsLast7Days.length} proofs).`;
  } else if (proofsLast7Days.length < proofsPrev7Days.length) {
    momentumState = 'RESETTING';
    momentumTitle = 'RESETTING VELOCITY';
    momentumDesc = 'Fewer proofs logged in the last 7 days. Show up today to restart your momentum.';
  }

  const momentum: PersonalMomentum = {
    state: momentumState,
    title: momentumTitle,
    description: momentumDesc,
    recent7DaysCount: proofsLast7Days.length,
    previous7DaysCount: proofsPrev7Days.length,
    activeDaysLast7: activeDaysLast7Set.size,
  };

  // 5. Compute Weekly Recap (Current week Monday-Sunday)
  let growthPercent: number | null = null;
  if (proofsPrev7Days.length > 0) {
    growthPercent = Math.round(
      ((proofsLast7Days.length - proofsPrev7Days.length) / proofsPrev7Days.length) * 100
    );
  }

  let weeklyTopCategory = 'None';
  const weekCatCounts: Record<string, number> = {};
  let weekScore = 0;
  proofsLast7Days.forEach((p) => {
    const c = p.category || 'General';
    weekCatCounts[c] = (weekCatCounts[c] || 0) + 1;
    weekScore += p.points || 10;
  });
  const sortedWeekCats = Object.entries(weekCatCounts).sort((a, b) => b[1] - a[1]);
  if (sortedWeekCats.length > 0) {
    weeklyTopCategory = sortedWeekCats[0][0];
  }

  let prevWeekScore = 0;
  proofsPrev7Days.forEach((p) => {
    prevWeekScore += p.points || 10;
  });

  const weeklyRecap: WeeklyRecapData = {
    currentWeek: {
      startDate: sevenDaysAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      endDate: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      proofCount: proofsLast7Days.length,
      activeDays: activeDaysLast7Set.size,
      flexScoreGained: weekScore,
      topCategory: weeklyTopCategory,
      categoriesCount: sortedWeekCats.length,
    },
    previousWeek: {
      startDate: fourteenDaysAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      endDate: sevenDaysAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      proofCount: proofsPrev7Days.length,
      activeDays: new Set(proofsPrev7Days.map((p) => new Date(p.createdAt).toDateString())).size,
      flexScoreGained: prevWeekScore,
    },
    growthPercent,
    summaryStatus: momentumState,
  };

  // 6. Compute Monthly Timeline Buckets dynamically
  const monthlyBucketsMap = new Map<string, ProofRecord[]>();
  sortedProofs.forEach((p) => {
    const d = new Date(p.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const list = monthlyBucketsMap.get(key) || [];
    list.push(p);
    monthlyBucketsMap.set(key, list);
  });

  const timeline: MonthlyTimelineBucket[] = Array.from(monthlyBucketsMap.entries()).map(
    ([key, bucketProofs]) => {
      const [yearStr, monthStr] = key.split('-');
      const year = parseInt(yearStr, 10);
      const monthIndex = parseInt(monthStr, 10) - 1;
      const monthName = `${MONTH_NAMES[monthIndex]} ${year}`;

      const activeDates = new Set(
        bucketProofs.map((p) => {
          const d = new Date(p.createdAt);
          return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        })
      );

      const catMap: Record<string, number> = {};
      let flexGained = 0;
      bucketProofs.forEach((p) => {
        const c = p.category || 'General';
        catMap[c] = (catMap[c] || 0) + 1;
        flexGained += p.points || 10;
      });

      const categories = Object.entries(catMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      return {
        monthKey: key,
        monthName,
        year,
        monthIndex,
        proofCount: bucketProofs.length,
        activeDays: activeDates.size,
        flexScoreGained: flexGained,
        topCategory: categories[0]?.name || 'General',
        categories,
      };
    }
  );

  // 7. Compute Milestones deterministically
  const totalProofsCount = sortedProofs.length;
  const currentStreak = profile.streak || 0;
  const flexScoreVal = profile.flexScore || 0;

  const milestones: MilestoneItem[] = [
    {
      id: 'FIRST_PROOF',
      title: 'FIRST PROOF',
      description: 'Submitted initial verified proof of real-world action.',
      category: 'Activation',
      isEarned: totalProofsCount >= 1,
      earnedAt: sortedProofs[sortedProofs.length - 1]?.createdAt,
      progressText: totalProofsCount >= 1 ? 'Earned' : '0 / 1 Proof',
    },
    {
      id: '7_DAY_STREAK',
      title: '7-DAY STREAK',
      description: 'Maintained 7 consecutive active days of verified progress.',
      category: 'Consistency',
      isEarned: currentStreak >= 7,
      progressText: currentStreak >= 7 ? 'Earned' : `${currentStreak} / 7 Days`,
    },
    {
      id: '10_PROOFS',
      title: '10 PROOFS',
      description: 'Recorded a foundation of 10 distinct verified achievements.',
      category: 'Milestone',
      isEarned: totalProofsCount >= 10,
      progressText: totalProofsCount >= 10 ? 'Earned' : `${totalProofsCount} / 10 Proofs`,
    },
    {
      id: '50_PROOFS',
      title: '50 PROOFS',
      description: 'Built a comprehensive archive of 50 verified actions.',
      category: 'Volume',
      isEarned: totalProofsCount >= 50,
      progressText: totalProofsCount >= 50 ? 'Earned' : `${totalProofsCount} / 50 Proofs`,
    },
    {
      id: '100_PROOFS',
      title: '100 PROOFS',
      description: 'Century mark. 100 verified proof submissions on record.',
      category: 'Mastery',
      isEarned: totalProofsCount >= 100,
      progressText: totalProofsCount >= 100 ? 'Earned' : `${totalProofsCount} / 100 Proofs`,
    },
    {
      id: 'FIRST_FOLLOWER',
      title: 'FIRST CIRCLE FOLLOWER',
      description: 'Another builder started following your verified accomplishments.',
      category: 'Social Proof',
      isEarned: followersCount >= 1,
      progressText: followersCount >= 1 ? 'Earned' : `${followersCount} / 1 Follower`,
    },
  ];

  return {
    profile,
    totalProofs: totalProofsCount,
    flexScore: flexScoreVal,
    activeDays: totalActiveDays,
    currentStreak,
    bestStreak: Math.max(currentStreak, totalActiveDays > 0 ? 1 : 0),
    momentum,
    window30Days,
    weeklyRecap,
    timeline,
    milestones,
    categoryBreakdown,
  };
}
