import { describe, it, expect, afterEach, vi } from 'vitest';
import { detectSystemLanguage } from './detectLanguage.js';

const originalLanguage = navigator.language;

function mockNavigatorLanguage(value: string | undefined): void {
	vi.spyOn(navigator, 'language', 'get').mockReturnValue(value as string);
}

afterEach(() => {
	vi.restoreAllMocks();
	expect(navigator.language).toBe(originalLanguage);
});

describe('detectSystemLanguage', () => {
	it('returns "en" for en-US', () => {
		mockNavigatorLanguage('en-US');
		expect(detectSystemLanguage()).toBe('en');
	});

	it('returns "en" for plain "en"', () => {
		mockNavigatorLanguage('en');
		expect(detectSystemLanguage()).toBe('en');
	});

	it('returns "es" for es-MX', () => {
		mockNavigatorLanguage('es-MX');
		expect(detectSystemLanguage()).toBe('es');
	});

	it('returns "es" for es-ES', () => {
		mockNavigatorLanguage('es-ES');
		expect(detectSystemLanguage()).toBe('es');
	});

	it('returns "es" for plain "es"', () => {
		mockNavigatorLanguage('es');
		expect(detectSystemLanguage()).toBe('es');
	});

	it('returns "es" for uppercase "ES"', () => {
		mockNavigatorLanguage('ES');
		expect(detectSystemLanguage()).toBe('es');
	});

	it('returns "en" for any unsupported locale (fr-FR)', () => {
		mockNavigatorLanguage('fr-FR');
		expect(detectSystemLanguage()).toBe('en');
	});

	it('returns "en" for empty string', () => {
		mockNavigatorLanguage('');
		expect(detectSystemLanguage()).toBe('en');
	});

	it('returns "en" when navigator.language is undefined', () => {
		mockNavigatorLanguage(undefined);
		expect(detectSystemLanguage()).toBe('en');
	});
});
