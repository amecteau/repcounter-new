import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatWorkoutDate } from './formatDate.js';

const TODAY = '2026-04-28';
const YESTERDAY = '2026-04-27';
const OLD_DATE = '2026-04-01';

describe('formatWorkoutDate', () => {
	beforeEach(() => {
		vi.spyOn(Date, 'now').mockReturnValue(new Date(`${TODAY}T12:00:00Z`).getTime());
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('prefixes today with todayLabel', () => {
		const result = formatWorkoutDate(TODAY, 'Today', 'Yesterday', 'en-US');
		expect(result.startsWith('Today, ')).toBe(true);
	});

	it('prefixes yesterday with yesterdayLabel', () => {
		const result = formatWorkoutDate(YESTERDAY, 'Today', 'Yesterday', 'en-US');
		expect(result.startsWith('Yesterday, ')).toBe(true);
	});

	it('returns just the formatted date for older dates', () => {
		const result = formatWorkoutDate(OLD_DATE, 'Today', 'Yesterday', 'en-US');
		expect(result.startsWith('Today')).toBe(false);
		expect(result.startsWith('Yesterday')).toBe(false);
		expect(result).toContain('2026');
	});

	it('includes the date string after the today label', () => {
		const result = formatWorkoutDate(TODAY, 'Today', 'Yesterday', 'en-US');
		expect(result).toContain('2026');
		expect(result.length).toBeGreaterThan('Today, '.length);
	});

	it('uses provided labels for today in Spanish', () => {
		const result = formatWorkoutDate(TODAY, 'Hoy', 'Ayer', 'es-ES');
		expect(result.startsWith('Hoy, ')).toBe(true);
	});

	it('uses provided labels for yesterday in Spanish', () => {
		const result = formatWorkoutDate(YESTERDAY, 'Hoy', 'Ayer', 'es-ES');
		expect(result.startsWith('Ayer, ')).toBe(true);
	});

	it('older date with es-ES locale contains year', () => {
		const result = formatWorkoutDate(OLD_DATE, 'Hoy', 'Ayer', 'es-ES');
		expect(result).toContain('2026');
	});
});
