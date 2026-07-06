// Small presentation helpers for chat timestamps. Pure + client-safe (no server imports).

/** "10:05 AM" — clock time for a message bubble / conversation row. */
export function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/** "Today" / "Yesterday" / "Jun 24" — a date divider between message groups. */
export function formatDayDivider(date: Date): string {
  const today = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(today) - startOfDay(date)) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  const sameYear = date.getFullYear() === today.getFullYear();
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

/** Compact time for the conversation-list row: clock time if today, else short date. */
export function formatConversationTime(date: Date): string {
  const today = new Date();
  const sameDay =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  return sameDay ? formatMessageTime(date) : formatDayDivider(date);
}

/** Initials for an avatar fallback, from a display name or email. */
export function initialsFrom(label: string): string {
  return label.slice(0, 2).toUpperCase();
}
