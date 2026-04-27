import type { WeightUnit } from './workout.js';

export type FontScale = 'small' | 'medium' | 'large' | 'extraLarge';

export type Language = 'en' | 'es';

export type LanguagePreference = 'system' | Language;

export interface UserSettings {
	fontScale: FontScale;
	weightUnit: WeightUnit;
	lastExerciseId: string | null;
	language: LanguagePreference;
}

export const FONT_SCALE_VALUES: Record<FontScale, number> = {
	small: 14,
	medium: 18,
	large: 24,
	extraLarge: 32
};
