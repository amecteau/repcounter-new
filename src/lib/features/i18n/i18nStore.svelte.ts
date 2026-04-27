import type { Language, LanguagePreference } from '$lib/shared/types/settings.js';
import type { Dictionary, TranslationKey } from './types.js';
import { en } from './locales/en.js';
import { es } from './locales/es.js';
import { detectSystemLanguage } from './detectLanguage.js';

const DICTIONARIES: Record<Language, Dictionary> = { en, es };

export type Interpolations = Record<string, string | number>;

function interpolate(template: string, values: Interpolations | undefined): string {
	if (!values) return template;
	return template.replace(/\{(\w+)\}/g, (match, key: string) => {
		const value = values[key];
		return value === undefined ? match : String(value);
	});
}

export function createI18nStore(initialSystem: Language = detectSystemLanguage()) {
	let preference = $state<LanguagePreference>('system');
	let systemLanguage = $state<Language>(initialSystem);

	const active = $derived<Language>(preference === 'system' ? systemLanguage : preference);
	const dict = $derived<Dictionary>(DICTIONARIES[active]);

	return {
		get language(): Language {
			return active;
		},
		get preference(): LanguagePreference {
			return preference;
		},
		get systemLanguage(): Language {
			return systemLanguage;
		},

		setPreference(next: LanguagePreference): void {
			preference = next;
		},

		setSystemLanguage(next: Language): void {
			systemLanguage = next;
		},

		t(key: TranslationKey, values?: Interpolations): string {
			const template = dict[key];
			if (template === undefined) return key;
			return interpolate(template, values);
		}
	};
}

export const i18nStore = createI18nStore();
