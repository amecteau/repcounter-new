import type { FontScale, LanguagePreference } from '$lib/shared/types/settings.js';
import type { WeightUnit } from '$lib/shared/types/workout.js';
import { FONT_SCALE_VALUES } from '$lib/shared/types/settings.js';
import * as settingsService from './settings.service.js';

const SCALES: FontScale[] = ['small', 'medium', 'large', 'extraLarge'];
const LANGUAGE_PREFERENCES: LanguagePreference[] = ['system', 'en', 'es'];

function isLanguagePreference(value: string): value is LanguagePreference {
	return (LANGUAGE_PREFERENCES as string[]).includes(value);
}

export function createSettingsStore() {
	let fontScale = $state<FontScale>('medium');
	let weightUnit = $state<WeightUnit>('lb');
	let lastExerciseId = $state<string | null>(null);
	let language = $state<LanguagePreference>('system');

	function applyFontScale(scale: FontScale) {
		if (typeof document !== 'undefined') {
			document.documentElement.style.fontSize = `${FONT_SCALE_VALUES[scale]}px`;
		}
	}

	return {
		get fontScale() {
			return fontScale;
		},
		get weightUnit() {
			return weightUnit;
		},
		get lastExerciseId() {
			return lastExerciseId;
		},
		get language() {
			return language;
		},

		setFontScale(scale: FontScale) {
			fontScale = scale;
			applyFontScale(scale);
		},

		increase() {
			const idx = SCALES.indexOf(fontScale);
			if (idx < SCALES.length - 1) this.setFontScale(SCALES[idx + 1]);
		},

		decrease() {
			const idx = SCALES.indexOf(fontScale);
			if (idx > 0) this.setFontScale(SCALES[idx - 1]);
		},

		setWeightUnit(unit: WeightUnit) {
			weightUnit = unit;
		},

		setLastExerciseId(id: string | null) {
			lastExerciseId = id;
		},

		setLanguage(preference: LanguagePreference) {
			language = preference;
		},

		async load() {
			const saved = await settingsService.getSettings();
			if (saved) {
				fontScale = saved.fontScale as FontScale;
				weightUnit = saved.weightUnit as WeightUnit;
				lastExerciseId = saved.lastExerciseId;
				language = isLanguagePreference(saved.language) ? saved.language : 'system';
				applyFontScale(fontScale);
			}
		},

		async persist() {
			await settingsService.saveSettings({
				fontScale,
				weightUnit,
				lastExerciseId,
				language
			});
		}
	};
}

export const settingsStore = createSettingsStore();
