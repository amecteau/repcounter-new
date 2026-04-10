import { describe, it, expect } from 'vitest';
import type { Exercise } from './exercise.js';
import type { WorkoutSet, Workout, WeightUnit } from './workout.js';
import type { UserSettings, FontScale } from './settings.js';
import { FONT_SCALE_VALUES } from './settings.js';
import type { ServiceResult } from './common.js';

describe('shared types smoke test', () => {
	it('Exercise type has expected shape', () => {
		const ex: Exercise = {
			id: 'uuid-1',
			name: 'Bench Press',
			muscleGroup: 'chest',
			isCustom: false
		};
		expect(ex.id).toBe('uuid-1');
		expect(ex.muscleGroup).toBe('chest');
	});

	it('WorkoutSet type has expected shape', () => {
		const set: WorkoutSet = {
			id: 'uuid-2',
			exerciseId: 'uuid-1',
			reps: 10,
			weight: 100,
			unit: 'lb',
			timestamp: '2026-04-09T10:00:00Z',
			notes: ''
		};
		expect(set.reps).toBe(10);
		expect(set.unit).toBe('lb');
	});

	it('FONT_SCALE_VALUES has all four keys', () => {
		const keys: FontScale[] = ['small', 'medium', 'large', 'extraLarge'];
		for (const k of keys) {
			expect(FONT_SCALE_VALUES[k]).toBeGreaterThan(0);
		}
	});

	it('ServiceResult success shape', () => {
		const ok: ServiceResult<number> = { success: true, data: 42 };
		expect(ok.success).toBe(true);
		if (ok.success) expect(ok.data).toBe(42);
	});

	it('WeightUnit is lb or kg', () => {
		const units: WeightUnit[] = ['lb', 'kg'];
		expect(units).toHaveLength(2);
	});

	it('UserSettings type has expected defaults shape', () => {
		const s: UserSettings = {
			fontScale: 'medium',
			weightUnit: 'lb',
			lastExerciseId: null
		};
		expect(s.fontScale).toBe('medium');
		expect(s.lastExerciseId).toBeNull();
	});

	it('Workout type accepts empty sets', () => {
		const w: Workout = {
			id: 'w1',
			date: '2026-04-09',
			sets: [],
			durationMinutes: null
		};
		expect(w.sets).toHaveLength(0);
	});
});
