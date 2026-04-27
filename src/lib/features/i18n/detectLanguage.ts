import type { Language } from '$lib/shared/types/settings.js';

export function detectSystemLanguage(): Language {
	if (typeof navigator === 'undefined') {
		return 'en';
	}

	const raw = navigator.language;
	if (typeof raw !== 'string' || raw.length === 0) {
		return 'en';
	}

	const prefix = raw.toLowerCase().split('-')[0];
	if (prefix === 'es') {
		return 'es';
	}
	return 'en';
}
