import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import WorkoutDetail from './WorkoutDetail.svelte';
import type { Workout } from '$lib/shared/types/workout.js';
import type { Exercise } from '$lib/shared/types/exercise.js';

const exercises: Exercise[] = [
	{ id: 'bench-press', name: 'Bench Press', muscleGroup: 'chest', isCustom: false },
	{ id: 'squat', name: 'Squat', muscleGroup: 'legs', isCustom: false }
];

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
		render(WorkoutDetail, { workout, exercises });
		expect(screen.getByText(/52 min/)).toBeInTheDocument();
	});

	it('does not render duration line when durationMinutes is null', () => {
		render(WorkoutDetail, { workout: { ...workout, durationMinutes: null }, exercises });
		expect(screen.queryByText(/min/)).not.toBeInTheDocument();
	});

	it('renders exercise names as headings', () => {
		render(WorkoutDetail, { workout, exercises });
		expect(screen.getByRole('heading', { name: 'Bench Press' })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: 'Squat' })).toBeInTheDocument();
	});

	it('renders each set with reps and weight', () => {
		render(WorkoutDetail, { workout, exercises });
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
		render(WorkoutDetail, { workout: bwWorkout, exercises });
		expect(screen.getByText(/bodyweight/)).toBeInTheDocument();
	});

	it('groups sets under each exercise', () => {
		render(WorkoutDetail, { workout, exercises });
		// Bench Press has 2 sets, Squat has 1
		const benchSection = screen.getByRole('heading', { name: 'Bench Press' }).closest('section');
		expect(benchSection?.querySelectorAll('li')).toHaveLength(2);
	});
});
