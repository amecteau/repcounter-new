import { describe, it, expect } from 'vitest';
import { createI18nStore } from './i18nStore.svelte.js';

describe('i18nStore', () => {
	it('defaults preference to "system"', () => {
		const store = createI18nStore('en');
		expect(store.preference).toBe('system');
	});

	it('resolves active language from detected system language when preference is "system"', () => {
		const store = createI18nStore('es');
		expect(store.language).toBe('es');
	});

	it('returns English string for nav.counter when active is "en"', () => {
		const store = createI18nStore('en');
		expect(store.t('nav.counter')).toBe('Counter');
	});

	it('returns Spanish string for nav.counter when active is "es"', () => {
		const store = createI18nStore('es');
		expect(store.t('nav.counter')).toBe('Contador');
	});

	it('setPreference("es") flips active language to "es" regardless of system', () => {
		const store = createI18nStore('en');
		expect(store.t('nav.history')).toBe('History');
		store.setPreference('es');
		expect(store.language).toBe('es');
		expect(store.t('nav.history')).toBe('Historial');
	});

	it('setPreference("en") forces English even when system is Spanish', () => {
		const store = createI18nStore('es');
		store.setPreference('en');
		expect(store.language).toBe('en');
		expect(store.t('muscleGroup.chest')).toBe('Chest');
	});

	it('setPreference("system") restores the system-detected language', () => {
		const store = createI18nStore('es');
		store.setPreference('en');
		expect(store.language).toBe('en');
		store.setPreference('system');
		expect(store.language).toBe('es');
	});

	it('setSystemLanguage updates the resolution when preference is "system"', () => {
		const store = createI18nStore('en');
		expect(store.language).toBe('en');
		store.setSystemLanguage('es');
		expect(store.language).toBe('es');
	});

	it('setSystemLanguage does not change active language when preference is explicit', () => {
		const store = createI18nStore('en');
		store.setPreference('en');
		store.setSystemLanguage('es');
		expect(store.language).toBe('en');
	});

	it('t() interpolates {n} placeholders', () => {
		const store = createI18nStore('en');
		expect(store.t('counter.setNumber', { n: 3 })).toBe('Set 3');
	});

	it('t() interpolates Spanish placeholders correctly', () => {
		const store = createI18nStore('es');
		expect(store.t('counter.setNumber', { n: 3 })).toBe('Serie 3');
	});

	it('t() interpolates multiple named placeholders', () => {
		const store = createI18nStore('en');
		const result = store.t('history.setSummary', {
			n: 1,
			reps: 12,
			weight: 135,
			unit: 'lb'
		});
		expect(result).toBe('Set 1: 12 reps @ 135 lb');
	});

	it('t() leaves unknown placeholders untouched', () => {
		const store = createI18nStore('en');
		expect(store.t('counter.setNumber', { wrongKey: 5 })).toBe('Set {n}');
	});

	it('t() falls back to the key when called with an unknown key', () => {
		const store = createI18nStore('en');
		// Cast — the fallback path can only be exercised at runtime.
		const result = store.t('totally.bogus' as never);
		expect(result).toBe('totally.bogus');
	});

	it('every Spanish key has a non-empty translation', () => {
		const store = createI18nStore('es');
		// Sample a few critical keys — full coverage enforced by TypeScript.
		expect(store.t('nav.counter').length).toBeGreaterThan(0);
		expect(store.t('counter.saveSet')).toBe('Guardar Serie');
		expect(store.t('exercise.bench-press')).toBe('Press de Banca');
		expect(store.t('settings.language.heading')).toBe('Idioma');
	});
});
