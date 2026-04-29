export function formatWorkoutDate(
	dateStr: string,
	todayLabel: string,
	yesterdayLabel: string,
	locale: string
): string {
	const today = new Date(Date.now()).toISOString().slice(0, 10);
	const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
	const d = new Date(dateStr + 'T12:00:00');
	const formatted = d.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
	if (dateStr === today) return `${todayLabel}, ${formatted}`;
	if (dateStr === yesterday) return `${yesterdayLabel}, ${formatted}`;
	return formatted;
}
