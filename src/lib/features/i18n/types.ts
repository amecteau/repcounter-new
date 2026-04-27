import type { en } from './locales/en.js';

export type TranslationKey = keyof typeof en;

export type Dictionary = Record<TranslationKey, string>;
