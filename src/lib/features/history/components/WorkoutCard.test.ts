import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import WorkoutCard from './WorkoutCard.svelte';
import type { Workout } from '$lib/shared/types/workout.js';
import type { Exercise } from '$lib/shared/types/exercise.js';

const exercises: Exercise[] = [
	{ id: 'bench-press', name: 'Bench Press', muscleGroup: 'chest', isCustom: false },
	{ id: 'squat', name: 'Squat', muscleGroup: 'legs', isCustom: false }
];

const workout: Workout = {
	id: 'w1',
	date: '2026-04-12',
	durationMinutes: 45,
	sets: [
		{
			id: 's1',
			exerciseId: 'bench-press',
			reps: 10,
			weight: 135,
			unit: 'lb',
			timestamp: '',
			notes: ''
		},
		{
			id: 's2',
			exerciseId: 'bench-press',
			reps: 8,
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

describe('WorkoutCard', () => {
	it('renders workout date', () => {
		render(WorkoutCard, { workout, exercises, expanded: false, onToggle: vi.fn(), onDelete: vi.fn() });
		expect(screen.getByText(/Apr 12, 2026/)).toBeInTheDocument();
	});

	it('renders exercise and set counts', () => {
		render(WorkoutCard, { workout, exercises, expanded: false, onToggle: vi.fn(), onDelete: vi.fn() });
		expect(screen.getByText(/2 exercises · 3 sets/)).toBeInTheDocument();
	});

	it('renders exercise summaries when collapsed', () => {
		render(WorkoutCard, { workout, exercises, expanded: false, onToggle: vi.fn(), onDelete: vi.fn() });
		const summary = screen.getByRole('list', { name: /exercise summary/i });
		expect(within(summary).getByText(/Bench Press/)).toBeInTheDocument();
		expect(within(summary).getByText(/Squat/)).toBeInTheDocument();
	});

	it('hides exercise summaries when expanded', () => {
		render(WorkoutCard, { workout, exercises, expanded: true, onToggle: vi.fn(), onDelete: vi.fn() });
		expect(screen.queryByRole('list', { name: /exercise summary/i })).not.toBeInTheDocument();
	});

	it('calls onToggle when header button is clicked', async () => {
		const user = userEvent.setup();
		const onToggle = vi.fn();
		render(WorkoutCard, { workout, exercises, expanded: false, onToggle, onDelete: vi.fn() });
		// The toggle button contains the date text
		await user.click(screen.getByRole('button', { name: /Apr 12, 2026/ }));
		expect(onToggle).toHaveBeenCalledOnce();
	});

	it('shows WorkoutDetail when expanded', () => {
		render(WorkoutCard, { workout, exercises, expanded: true, onToggle: vi.fn(), onDelete: vi.fn() });
		expect(screen.getByText(/45 min/)).toBeInTheDocument();
	});

	it('shows confirm dialog when Delete action is triggered', async () => {
		const user = userEvent.setup();
		render(WorkoutCard, { workout, exercises, expanded: false, onToggle: vi.fn(), onDelete: vi.fn() });
		await user.click(screen.getByRole('button', { name: 'Delete' }));
		expect(screen.getByRole('dialog')).toBeInTheDocument();
	});

	it('calls onDelete when confirm dialog is confirmed', async () => {
		const user = userEvent.setup();
		const onDelete = vi.fn();
		render(WorkoutCard, { workout, exercises, expanded: false, onToggle: vi.fn(), onDelete });
		// Trigger the delete via SwipeToReveal action button
		await user.click(screen.getByRole('button', { name: 'Delete' }));
		// Confirm the dialog
		const dialog = screen.getByRole('dialog');
		await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
		expect(onDelete).toHaveBeenCalledOnce();
	});

	it('dismisses confirm dialog on Cancel', async () => {
		const user = userEvent.setup();
		render(WorkoutCard, { workout, exercises, expanded: false, onToggle: vi.fn(), onDelete: vi.fn() });
		await user.click(screen.getByRole('button', { name: 'Delete' }));
		await user.click(screen.getByRole('button', { name: /cancel/i }));
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});
});
