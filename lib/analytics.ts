import { createClient } from '@/lib/supabase/server';
import { DbProfile, DbProof } from '@/types';

export interface FunnelStep {
  name: string;
  count: number;
  conversionFromPrevious: number | null; // percentage 0-100
  conversionFromTop: number; // percentage 0-100
  dropoffPercentage: number | null;
}

export interface VelocityMetric {
  medianMinutes: number | null;
  averageMinutes: number | null;
  minMinutes: number | null;
  maxMinutes: number | null;
  formattedMedian: string;
  formattedAverage: string;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
}

export interface CohortRow {
  cohortKey: string;
  signups: number;
  onboardedPercent: number;
  firstProofPercent: number;
  secondProofPercent: number;
  socialPercent: number;
}

export interface AnalyticsSummary {
  timeWindow: 'all' | '7d' | '30d';
  isEarlyData: boolean;
  totalUsers: number;
  onboardedUsers: number;
  activatedUsers: number;
  retainedUsers: number;
  socialUsers: number;
  totalProofs: number;
  totalFollows: number;
  imageProofCount: number;
  imageProofPercentage: number;
  funnel: FunnelStep[];
  timeToFirstProof: VelocityMetric;
  timeToSecondProof: VelocityMetric;
  categoryDistribution: CategoryBreakdown[];
  cohorts: CohortRow[];
  observations: string[];
  diagnostics: {
    profilesCount: number;
    proofsCount: number;
    followsCount: number;
    lastUpdatedUtc: string;
  };
}

function formatDuration(minutes: number | null): string {
  if (minutes === null || isNaN(minutes)) return '—';
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${Math.round(minutes)} mins`;
  const hours = minutes / 60;
  if (hours < 24) return `${hours.toFixed(1)} hrs`;
  const days = hours / 24;
  return `${days.toFixed(1)} days`;
}

function calculateMedian(numbers: number[]): number | null {
  if (numbers.length === 0) return null;
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
}

function calculateAverage(numbers: number[]): number | null {
  if (numbers.length === 0) return null;
  const sum = numbers.reduce((acc, curr) => acc + curr, 0);
  return sum / numbers.length;
}

export async function getProductAnalytics(timeWindow: 'all' | '7d' | '30d' = 'all'): Promise<AnalyticsSummary> {
  const supabase = await createClient();

  // 1. Fetch all authoritative records
  let profilesQuery = supabase.from('profiles').select('*').order('created_at', { ascending: true });
  let proofsQuery = supabase.from('proofs').select('*').order('created_at', { ascending: true });
  let followsQuery = supabase.from('follows').select('*').order('created_at', { ascending: true });

  const now = new Date();
  if (timeWindow === '7d') {
    const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    profilesQuery = profilesQuery.gte('created_at', cutoff);
    proofsQuery = proofsQuery.gte('created_at', cutoff);
    followsQuery = followsQuery.gte('created_at', cutoff);
  } else if (timeWindow === '30d') {
    const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    profilesQuery = profilesQuery.gte('created_at', cutoff);
    proofsQuery = proofsQuery.gte('created_at', cutoff);
    followsQuery = followsQuery.gte('created_at', cutoff);
  }

  const [
    { data: rawProfiles },
    { data: rawProofs },
    { data: rawFollows },
  ] = await Promise.all([
    profilesQuery,
    proofsQuery,
    followsQuery,
  ]);

  const profiles: DbProfile[] = (rawProfiles || []) as DbProfile[];
  const proofs: DbProof[] = (rawProofs || []) as DbProof[];
  const follows: { follower_id: string; following_id: string; created_at: string }[] = (rawFollows || []) as { follower_id: string; following_id: string; created_at: string }[];

  const totalUsers = profiles.length;
  const isEarlyData = totalUsers < 25;

  // 2. Compute user proofs map
  const userProofsMap = new Map<string, DbProof[]>();
  for (const proof of proofs) {
    if (!userProofsMap.has(proof.user_id)) {
      userProofsMap.set(proof.user_id, []);
    }
    userProofsMap.get(proof.user_id)!.push(proof);
  }

  // 3. Compute funnel stages
  const onboardedProfiles = profiles.filter((p) => p.username && !p.username.startsWith('user_'));
  const onboardedUsers = onboardedProfiles.length;

  const activatedUserIds = new Set<string>();
  const retainedUserIds = new Set<string>();
  const multiDayUserIds = new Set<string>();

  const timeToFirstProofMinutes: number[] = [];
  const timeToSecondProofMinutes: number[] = [];

  for (const profile of profiles) {
    const userProofs = userProofsMap.get(profile.id) || [];
    if (userProofs.length >= 1) {
      activatedUserIds.add(profile.id);

      // Sort user proofs chronologically
      const sortedProofs = [...userProofs].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      const profileCreatedMs = new Date(profile.created_at).getTime();
      const firstProofMs = new Date(sortedProofs[0].created_at).getTime();
      const diffMinutes = Math.max(0, (firstProofMs - profileCreatedMs) / (1000 * 60));
      timeToFirstProofMinutes.push(diffMinutes);

      if (sortedProofs.length >= 2) {
        retainedUserIds.add(profile.id);
        const secondProofMs = new Date(sortedProofs[1].created_at).getTime();
        const diff2Minutes = Math.max(0, (secondProofMs - firstProofMs) / (1000 * 60));
        timeToSecondProofMinutes.push(diff2Minutes);
      }

      // Check multi-day activity
      const uniqueDays = new Set(sortedProofs.map((p) => new Date(p.created_at).toISOString().slice(0, 10)));
      if (uniqueDays.size >= 2) {
        multiDayUserIds.add(profile.id);
      }
    }
  }

  const activatedUsers = activatedUserIds.size;
  const retainedUsers = retainedUserIds.size;

  const socialUserIds = new Set(follows.map((f) => f.follower_id));
  const socialUsers = socialUserIds.size;

  // 4. Construct Funnel Step Data
  const baseCount = Math.max(1, totalUsers);
  const funnel: FunnelStep[] = [
    {
      name: 'Registered',
      count: totalUsers,
      conversionFromPrevious: null,
      conversionFromTop: 100,
      dropoffPercentage: null,
    },
    {
      name: 'Onboarded',
      count: onboardedUsers,
      conversionFromPrevious: totalUsers > 0 ? Math.round((onboardedUsers / baseCount) * 100) : null,
      conversionFromTop: totalUsers > 0 ? Math.round((onboardedUsers / baseCount) * 100) : 0,
      dropoffPercentage: totalUsers > 0 ? Math.max(0, 100 - Math.round((onboardedUsers / baseCount) * 100)) : null,
    },
    {
      name: 'First Proof (Activated)',
      count: activatedUsers,
      conversionFromPrevious: onboardedUsers > 0 ? Math.round((activatedUsers / onboardedUsers) * 100) : null,
      conversionFromTop: totalUsers > 0 ? Math.round((activatedUsers / baseCount) * 100) : 0,
      dropoffPercentage: onboardedUsers > 0 ? Math.max(0, 100 - Math.round((activatedUsers / onboardedUsers) * 100)) : null,
    },
    {
      name: 'Second Proof (Retained)',
      count: retainedUsers,
      conversionFromPrevious: activatedUsers > 0 ? Math.round((retainedUsers / activatedUsers) * 100) : null,
      conversionFromTop: totalUsers > 0 ? Math.round((retainedUsers / baseCount) * 100) : 0,
      dropoffPercentage: activatedUsers > 0 ? Math.max(0, 100 - Math.round((retainedUsers / activatedUsers) * 100)) : null,
    },
    {
      name: 'Followed Someone',
      count: socialUsers,
      conversionFromPrevious: totalUsers > 0 ? Math.round((socialUsers / baseCount) * 100) : null,
      conversionFromTop: totalUsers > 0 ? Math.round((socialUsers / baseCount) * 100) : 0,
      dropoffPercentage: null,
    },
    {
      name: 'Multi-Day Active',
      count: multiDayUserIds.size,
      conversionFromPrevious: activatedUsers > 0 ? Math.round((multiDayUserIds.size / activatedUsers) * 100) : null,
      conversionFromTop: totalUsers > 0 ? Math.round((multiDayUserIds.size / baseCount) * 100) : 0,
      dropoffPercentage: null,
    },
  ];

  // 5. Velocity Calculations
  const medianTimeToFirst = calculateMedian(timeToFirstProofMinutes);
  const avgTimeToFirst = calculateAverage(timeToFirstProofMinutes);
  const minTimeToFirst = timeToFirstProofMinutes.length > 0 ? Math.min(...timeToFirstProofMinutes) : null;
  const maxTimeToFirst = timeToFirstProofMinutes.length > 0 ? Math.max(...timeToFirstProofMinutes) : null;

  const medianTimeToSecond = calculateMedian(timeToSecondProofMinutes);
  const avgTimeToSecond = calculateAverage(timeToSecondProofMinutes);
  const minTimeToSecond = timeToSecondProofMinutes.length > 0 ? Math.min(...timeToSecondProofMinutes) : null;
  const maxTimeToSecond = timeToSecondProofMinutes.length > 0 ? Math.max(...timeToSecondProofMinutes) : null;

  // 6. Category & Proof Image Breakdown
  const totalProofs = proofs.length;
  const imageProofCount = proofs.filter((p) => !!p.image_url).length;
  const imageProofPercentage = totalProofs > 0 ? Math.round((imageProofCount / totalProofs) * 100) : 0;

  const categoryCountMap: Record<string, number> = {
    Fitness: 0,
    Learning: 0,
    Creating: 0,
    Building: 0,
    Lifestyle: 0,
    Achievement: 0,
  };

  for (const p of proofs) {
    const cat = p.category || 'Lifestyle';
    categoryCountMap[cat] = (categoryCountMap[cat] || 0) + 1;
  }

  const categoryDistribution: CategoryBreakdown[] = Object.entries(categoryCountMap).map(([category, count]) => ({
    category,
    count,
    percentage: totalProofs > 0 ? Math.round((count / totalProofs) * 100) : 0,
  })).sort((a, b) => b.count - a.count);

  // 7. Cohort Grouping by Signup Week
  const cohortMap = new Map<string, { signups: number; onboarded: number; firstProof: number; secondProof: number; social: number }>();

  for (const p of profiles) {
    const date = new Date(p.created_at);
    // Group by Monday of the week (UTC)
    const day = date.getUTCDay();
    const diffToMonday = date.getUTCDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setUTCDate(diffToMonday));
    const cohortKey = monday.toISOString().slice(0, 10);

    if (!cohortMap.has(cohortKey)) {
      cohortMap.set(cohortKey, { signups: 0, onboarded: 0, firstProof: 0, secondProof: 0, social: 0 });
    }

    const entry = cohortMap.get(cohortKey)!;
    entry.signups += 1;
    if (p.username && !p.username.startsWith('user_')) entry.onboarded += 1;
    if (activatedUserIds.has(p.id)) entry.firstProof += 1;
    if (retainedUserIds.has(p.id)) entry.secondProof += 1;
    if (socialUserIds.has(p.id)) entry.social += 1;
  }

  const cohorts: CohortRow[] = Array.from(cohortMap.entries()).map(([cohortKey, data]) => ({
    cohortKey: `Week of ${cohortKey}`,
    signups: data.signups,
    onboardedPercent: Math.round((data.onboarded / data.signups) * 100),
    firstProofPercent: Math.round((data.firstProof / data.signups) * 100),
    secondProofPercent: Math.round((data.secondProof / data.signups) * 100),
    socialPercent: Math.round((data.social / data.signups) * 100),
  })).sort((a, b) => b.cohortKey.localeCompare(a.cohortKey));

  // 8. Deterministic Observation Layer
  const observations: string[] = [];

  if (totalUsers === 0) {
    observations.push('No registered users in this time window yet.');
  } else {
    const actRate = onboardedUsers > 0 ? Math.round((activatedUsers / onboardedUsers) * 100) : 0;
    observations.push(`Activation: ${actRate}% of onboarded users have logged at least 1 verified proof.`);

    if (activatedUsers > 0) {
      const retRate = Math.round((retainedUsers / activatedUsers) * 100);
      observations.push(`Second Proof Retention: ${retRate}% of activated users have gone on to log a second proof.`);
    }

    if (totalProofs > 0) {
      observations.push(`Visual Evidence: ${imageProofPercentage}% of logged proofs contain verified photo evidence (+15 Flex Points).`);
      const topCategory = categoryDistribution[0];
      if (topCategory && topCategory.count > 0) {
        observations.push(`Leading Category: "${topCategory.category}" accounts for ${topCategory.percentage}% (${topCategory.count} proofs) of all recorded accomplishments.`);
      }
    }

    const socialRate = Math.round((socialUsers / totalUsers) * 100);
    observations.push(`Social Discovery: ${socialRate}% of registered accounts actively follow peers in Circle.`);
  }

  return {
    timeWindow,
    isEarlyData,
    totalUsers,
    onboardedUsers,
    activatedUsers,
    retainedUsers,
    socialUsers,
    totalProofs,
    totalFollows: follows.length,
    imageProofCount,
    imageProofPercentage,
    funnel,
    timeToFirstProof: {
      medianMinutes: medianTimeToFirst,
      averageMinutes: avgTimeToFirst,
      minMinutes: minTimeToFirst,
      maxMinutes: maxTimeToFirst,
      formattedMedian: formatDuration(medianTimeToFirst),
      formattedAverage: formatDuration(avgTimeToFirst),
    },
    timeToSecondProof: {
      medianMinutes: medianTimeToSecond,
      averageMinutes: avgTimeToSecond,
      minMinutes: minTimeToSecond,
      maxMinutes: maxTimeToSecond,
      formattedMedian: formatDuration(medianTimeToSecond),
      formattedAverage: formatDuration(avgTimeToSecond),
    },
    categoryDistribution,
    cohorts,
    observations,
    diagnostics: {
      profilesCount: totalUsers,
      proofsCount: totalProofs,
      followsCount: follows.length,
      lastUpdatedUtc: now.toISOString(),
    },
  };
}
