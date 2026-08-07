/**
 * Formats a Firestore Timestamp or Date to a relative time string.
 * e.g., "2 minutes ago", "3 hours ago"
 */
export function formatDistanceToNow(value) {
  try {
    let date;
    // Firestore Timestamp objects have a toDate() method
    if (value && typeof value.toDate === 'function') {
      date = value.toDate();
    } else if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'number') {
      date = new Date(value);
    } else if (typeof value === 'string') {
      date = new Date(value);
    } else {
      return '—';
    }

    const now = Date.now();
    const diff = now - date.getTime();

    if (isNaN(diff)) return '—';
    if (diff < 60_000) return 'just now';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}d ago`;

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '—';
  }
}

/**
 * Formats a date to a short readable string.
 */
export function formatDate(value) {
  try {
    let date;
    if (value && typeof value.toDate === 'function') {
      date = value.toDate();
    } else if (value instanceof Date) {
      date = value;
    } else {
      date = new Date(value);
    }
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '—';
  }
}
