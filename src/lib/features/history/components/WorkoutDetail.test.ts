import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import WorkoutDetail from './WorkoutDetail.svelte';
import type { Workout, WeightUnit } from '$lib/shared/types/workout.js';

const labels = {
	formatDuration: (n: number) => `Duration: ${n} min`,
	formatSetLine: (n: number, reps: number, weight: number | null, unit: WeightUnit) =>
		weight === null ? `Set ${n}: ${reps} × bodyweight` : `Set ${n}: ${reps} × ${weight} ${unit}`,
	exerciseNames: {
		'bench-press': 'Bench Press',
		squat: 'Squat'
	} as Record<string, string>
};

const labelsEs = {
	formatDuration: (n: number) => `Duración: ${n} min`,
	formatSetLine: (n: number, reps: number, weight: number | null, unit: WeightUnit) =>
		weight === null
			? `Serie ${n}: ${reps} × peso corporal`
			: `Serie ${n}: ${reps} × ${weight} ${unit}`,
	exerciseNames: {
		'bench-press': 'Press de Banca',
		squat: 'Sentadilla'
	} as Record<string, string>
};

const workout: Workout = {
	id: 'w1',
	date: '2026-04-12',
	durationMinutes: 52,
	sets: [
		{
			id: 's1',
			exerciseId: 'bench-press',
			reps: 12,
			weight: 135,
			unit: 'lb',
			timestamp: '',
			notes: ''
		},
		{
			id: 's2',
			exerciseId: 'bench-press',
			reps: 10,
			weight: 135,
			unit: 'lb',
			timestamp: '',
			notes: ''
		},
		{
			id: 's3',
			exerciseId: 'squat',
			reps: 8,
			weight: 225,
			unit: 'lb',
			timestamp: '',
			notes: ''
		}
	]
};

describe('WorkoutDetail', () => {
	it('renders duration when present', () => {
		render(WorkoutDetail, { workout, labels });
		expect(screen.getByText(/52 min/)).toBeInTheDocument();
	});

	it('does not render duration line when durationMinutes is null', () => {
		render(WorkoutDetail, { workout: { ...workout, durationMinutes: null }, labels });
		expect(screen.queryByText(/min/)).not.toBeInTheDocument();
	});

	it('renders exercise names as headings', () => {
		render(WorkoutDetail, { workout, labels });
		expect(screen.getByRole('heading', { name: 'Bench Press' })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: 'Squat' })).toBeInTheDocument();
	});

	it('renders each set with reps and weight', () => {
		render(WorkoutDetail, { workout, labels });
		expect(screen.getByText(/Set 1: 12 × 135 lb/)).toBeInTheDocument();
		expect(screen.getByText(/Set 2: 10 × 135 lb/)).toBeInTheDocument();
		expect(screen.getByText(/Set 1: 8 × 225 lb/)).toBeInTheDocument();
	});

	it('renders bodyweight when weight is null', () => {
		const bwWorkout: Workout = {
			...workout,
			sets: [
				{
					id: 's1',
					exerciseId: 'bench-press',
					reps: 10,
					weight: null,
					unit: 'lb',
					timestamp: '',
					notes: ''
				}
			]
		};
		render(WorkoutDetail, { workout: bwWorkout, labels });
		expect(screen.getByText(/bodyweight/)).toBeInTheDocument();
	});

	it('groups sets under each exercise', () => {
		render(WorkoutDetail, { workout, labels });
		const benchSection = screen.getByRole('heading', { name: 'Bench Press' }).closest('section');
		expect(benchSection?.querySelectorAll('li')).toHaveLength(2);
	});

	it('renders Spanish labels when provided', () => {
		render(WorkoutDetail, { workout, labels: labelsEs });
		expect(screen.getByText(/Duración: 52 min/)).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: 'Press de Banca' })).toBeInTheDocument();
		expect(screen.getByText(/Serie 1: 12 × 135 lb/)).toBeInTheDocument();
	});
});
