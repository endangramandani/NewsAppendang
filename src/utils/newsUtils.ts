import { BloggerPost } from '../types/blogger';

export interface PostStats {
  upvotes: number;
  downvotes: number;
  credibilityScore: number;
  userVote?: 'up' | 'down' | null;
}

const STATS_STORAGE_KEY = 'rmndni_post_stats';

/**
 * Deterministically generates initial base stats for a post based on its ID
 */
export function getInitialPostStats(post: BloggerPost): PostStats {
  let hash = 0;
  for (let i = 0; i < post.id.length; i++) {
    hash = (hash << 5) - hash + post.id.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  // Initial upvotes between 150 and 1500
  const upvotes = 120 + (absHash % 1200);
  const downvotes = 3 + (absHash % 25);
  // Credibility score between 88% and 100%
  const credibilityScore = 90 + (absHash % 11);

  return {
    upvotes,
    downvotes,
    credibilityScore,
    userVote: null
  };
}

/**
 * Loads stored user votes from localStorage
 */
export function loadAllPostStats(): Record<string, PostStats> {
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore
  }
  return {};
}

/**
 * Saves all stats to localStorage
 */
export function saveAllPostStats(stats: Record<string, PostStats>): void {
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Ignore
  }
}

/**
 * Format count to human readable (e.g., 1200 -> "1.2k", 120000 -> "120k")
 */
export function formatStatCount(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return String(count);
}

/**
 * Formats relative time (e.g., "2h ago", "1d ago") in Indonesian
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Baru saja';
  if (diffInMinutes < 60) return `${diffInMinutes}m yang lalu`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}j yang lalu`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}h yang lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}
