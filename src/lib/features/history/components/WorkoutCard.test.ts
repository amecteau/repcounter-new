import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import WorkoutCard from './WorkoutCard.svelte';
import type { Workout, WeightUnit } from '$lib/shared/types/workout.js';

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

const exerciseNames = {
	'bench-press': 'Bench Press',
	squat: 'Squat'
} as Record<string, string>;

const detailLabels = {
	formatDuration: (n: number) => `Duration: ${n} min`,
	formatSetLine: (n: number, reps: number, weight: number | null, unit: WeightUnit) =>
		weight === null ? `Set ${n}: ${reps} × bodyweight` : `Set ${n}: ${reps} × ${weight} ${unit}`,
	exerciseNames
};

const labels = {
	dateLabel: 'Apr 12, 2026',
	deleteActionLabel: 'Delete',
	confirmMessage: 'Delete workout from Apr 12, 2026?',
	confirmLabel: 'Delete',
	cancelLabel: 'Cancel',
	formatExerciseCount: (n: number) => (n === 1 ? '1 exercise' : `${n} exercises`),
	formatSetCount: (n: number) => (n === 1 ? '1 set' : `${n} sets`),
	exerciseSummaryAriaLabel: 'Exercise summary',
	exerciseNames,
	detailLabels
};

const labelsEs = {
	...labels,
	dateLabel: '12 abr 2026',
	deleteActionLabel: 'Eliminar',
	confirmMessage: 'Eliminar el entrenamiento del 12 abr 2026?',
	confirmLabel: 'Eliminar',
	cancelLabel: 'Cancelar',
	formatExerciseCount: (n: number) => (n === 1 ? '1 ejercicio' : `${n} ejercicios`),
	formatSetCount: (n: number) => (n === 1 ? '1 serie' : `${n} series`),
	exerciseSummaryAriaLabel: 'Resumen de ejercicios'
};

describe('WorkoutCard', () => {
	it('renders workout date', () => {
		render(WorkoutCard, { workout, expanded: false, onToggle: vi.fn(), onDelete: vi.fn(), labels });
		expect(screen.getByText(/Apr 12, 2026/)).toBeInTheDocument();
	});

	it('renders exercise and set counts', () => {
		render(WorkoutCard, { workout, expanded: false, onToggle: vi.fn(), onDelete: vi.fn(), labels });
		expect(screen.getByText(/2 exercises · 3 sets/)).toBeInTheDocument();
	});

	it('renders exercise summaries when collapsed', () => {
		render(WorkoutCard, { workout, expanded: false, onToggle: vi.fn(), onDelete: vi.fn(), labels });
		const summary = screen.getByRole('list', { name: /exercise summary/i });
		expect(within(summary).getByText(/Bench Press/)).toBeInTheDocument();
		expect(within(summary).getByText(/Squat/)).toBeInTheDocument();
	});

	it('hides exercise summaries when expanded', () => {
		render(WorkoutCard, { workout, expanded: true, onToggle: vi.fn(), onDelete: vi.fn(), labels });
		expect(screen.queryByRole('list', { name: /exercise summary/i })).not.toBeInTheDocument();
	});

	it('calls onToggle when header button is clicked', async () => {
		const user = userEvent.setup();
		const onToggle = vi.fn();
		render(WorkoutCard, { workout, expanded: false, onToggle, onDelete: vi.fn(), labels });
		await user.click(screen.getByRole('button', { name: /Apr 12, 2026/ }));
		expect(onToggle).toHaveBeenCalledOnce();
	});

	it('shows WorkoutDetail when expanded', () => {
		render(WorkoutCard, { workout, expanded: true, onToggle: vi.fn(), onDelete: vi.fn(), labels });
		expect(screen.getByText(/45 min/)).toBeInTheDocument();
	});

	it('shows confirm dialog when Delete action is triggered', async () => {
		const user = userEvent.setup();
		render(WorkoutCard, { workout, expanded: false, onToggle: vi.fn(), onDelete: vi.fn(), labels });
		await user.click(screen.getByRole('button', { name: 'Delete' }));
		expect(screen.getByRole('dialog')).toBeInTheDocument();
	});

	it('calls onDelete when confirm dialog is confirmed', async () => {
		const user = userEvent.setup();
		const onDelete = vi.fn();
		render(WorkoutCard, { workout, expanded: false, onToggle: vi.fn(), onDelete, labels });
		await user.click(screen.getByRole('button', { name: 'Delete' }));
		const dialog = screen.getByRole('dialog');
		await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
		expect(onDelete).toHaveBeenCalledOnce();
	});

	it('dismisses confirm dialog on Cancel', async () => {
		const user = userEvent.setup();
		render(WorkoutCard, { workout, expanded: false, onToggle: vi.fn(), onDelete: vi.fn(), labels });
		await user.click(screen.getByRole('button', { name: 'Delete' }));
		await user.click(screen.getByRole('button', { name: /cancel/i }));
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	it('renders Spanish labels when provided', () => {
		render(WorkoutCard, {
			workout,
			expanded: false,
			onToggle: vi.fn(),
			onDelete: vi.fn(),
			labels: labelsEs
		});
		expect(screen.getByText(/12 abr 2026/)).toBeInTheDocument();
		expect(screen.getByText(/2 ejercicios · 3 series/)).toBeInTheDocument();
	});
});
