export function formatLongDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatWeekday(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' });
}

export function renderTitleWithEmphasis(title: string, emphasis?: string): {
  parts: { text: string; italic: boolean }[];
} {
  if (!emphasis) return { parts: [{ text: title, italic: false }] };
  const idx = title.toLowerCase().indexOf(emphasis.toLowerCase());
  if (idx < 0) return { parts: [{ text: title, italic: false }] };
  const before = title.slice(0, idx);
  const word = title.slice(idx, idx + emphasis.length);
  const after = title.slice(idx + emphasis.length);
  const parts: { text: string; italic: boolean }[] = [];
  if (before) parts.push({ text: before, italic: false });
  parts.push({ text: word, italic: true });
  if (after) parts.push({ text: after, italic: false });
  return { parts };
}
