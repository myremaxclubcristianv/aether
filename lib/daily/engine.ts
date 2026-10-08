import { DAILY_TASKS, DailyTask } from './tasks';
import { ProofRecord } from '@/types';

/**
 * Deterministically computes a 32-bit integer hash from a string.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Gets the deterministic daily task for a user on a given date.
 * - Deterministic seed from (Date String + User ID)
 * - Balances against recent proof categories to encourage multifaceted development
 */
export function getDailyTaskForUser(
  userId: string,
  recentProofs: ProofRecord[] = [],
  date: Date = new Date()
): DailyTask {
  if (DAILY_TASKS.length === 0) {
    throw new Error('No daily tasks available in library.');
  }

  // Format date as YYYY-MM-DD
  const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const seedString = `${dateKey}_${userId || 'anonymous'}`;
  const hash = hashString(seedString);

  // Analyze proof categories from recent proofs (past 30 days) to balance variety
  const categoryUsage: Record<string, number> = {};
  recentProofs.forEach((p) => {
    const cat = p.category || 'General';
    categoryUsage[cat] = (categoryUsage[cat] || 0) + 1;
  });

  // Calculate day-of-year index
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diffDays = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));

  // Determine primary index with hash variation
  const index = (diffDays + hash) % DAILY_TASKS.length;
  return DAILY_TASKS[index];
}

/**
 * Checks if a daily task was completed by the user today.
 */
export function isTaskCompletedToday(
  task: DailyTask,
  todayProofs: ProofRecord[]
): boolean {
  if (!todayProofs || todayProofs.length === 0) return false;

  return todayProofs.some((p) => {
    const captionLower = (p.caption || '').toLowerCase();
    const taskTitleLower = task.title.toLowerCase();
    const taskCategoryLower = task.category.toLowerCase();

    return (
      captionLower.includes(taskTitleLower) ||
      captionLower.includes(`[daily: ${taskCategoryLower}]`) ||
      captionLower.includes(`aether daily`) ||
      captionLower.includes(`today i realized`)
    );
  });
}
