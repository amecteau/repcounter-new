import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import ExerciseList from './ExerciseList.svelte';
import type { Exercise } from '$lib/shared/types/exercise.js';

const builtInExercises: Exercise[] = [
	{ id: 'bench-press', name: 'Bench Press', muscleGroup: 'chest', isCustom: false },
	{ id: 'squat', name: 'Squat', muscleGroup: 'legs', isCustom: false },
	{ id: 'pull-up', name: 'Pull-Up', muscleGroup: 'back', isCustom: false }
];

const customExercise: Exercise = {
	id: 'cable-crunch',
	name: 'Cable Crunch',
	muscleGroup: 'core',
	isCustom: true
};

describe('ExerciseList', () => {
	it('renders built-in exercises grouped by muscle group', () => {
		render(ExerciseList, { exercises: builtInExercises, onSelect: vi.fn(), onDeleteCustom: vi.fn() });
		expect(screen.getByRole('heading', { name: /chest/i })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: /legs/i })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: /back/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Bench Press' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Squat' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Pull-Up' })).toBeInTheDocument();
	});

	it('calls onSelect when a built-in exercise is clicked', async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		render(ExerciseList, { exercises: builtInExercises, onSelect, onDeleteCustom: vi.fn() });
		await user.click(screen.getByRole('button', { name: 'Bench Press' }));
		expect(onSelect).toHaveBeenCalledWith(builtInExercises[0]);
	});

	it('does not show the Custom section when there are no custom exercises', () => {
		render(ExerciseList, { exercises: builtInExercises, onSelect: vi.fn(), onDeleteCustom: vi.fn() });
		expect(screen.queryByRole('heading', { name: /custom/i })).not.toBeInTheDocument();
	});

	it('renders custom exercises in a Custom section', () => {
		render(ExerciseList, {
			exercises: [...builtInExercises, customExercise],
			onSelect: vi.fn(),
			onDeleteCustom: vi.fn()
		});
		expect(screen.getByRole('heading', { name: /custom/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Cable Crunch (custom)' })).toBeInTheDocument();
	});

	it('calls onSelect when a custom exercise is clicked', async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		render(ExerciseList, {
			exercises: [...builtInExercises, customExercise],
			onSelect,
			onDeleteCustom: vi.fn()
		});
		await user.click(screen.getByRole('button', { name: 'Cable Crunch (custom)' }));
		expect(onSelect).toHaveBeenCalledWith(customExercise);
	});

	it('shows a delete button for custom exercises', () => {
		render(ExerciseList, {
			exercises: [...builtInExercises, customExercise],
			onSelect: vi.fn(),
			onDeleteCustom: vi.fn()
		});
		expect(screen.getByRole('button', { name: /Delete Cable Crunch/i })).toBeInTheDocument();
	});

	it('does not show delete buttons for built-in exercises', () => {
		render(ExerciseList, {
			exercises: builtInExercises,
			onSelect: vi.fn(),
			onDeleteCustom: vi.fn()
		});
		expect(screen.queryByRole('button', { name: /delete bench press/i })).not.toBeInTheDocument();
	});

	it('shows a confirm dialog when a delete action is triggered', async () => {
		const user = userEvent.setup();
		render(ExerciseList, {
			exercises: [...builtInExercises, customExercise],
			onSelect: vi.fn(),
			onDeleteCustom: vi.fn()
		});
		await user.click(screen.getByRole('button', { name: /Delete Cable Crunch/i }));
		expect(screen.getByRole('dialog')).toBeInTheDocument();
	});

	it('calls onDeleteCustom when delete is confirmed', async () => {
		const user = userEvent.setup();
		const onDeleteCustom = vi.fn();
		render(ExerciseList, {
			exercises: [...builtInExercises, customExercise],
			onSelect: vi.fn(),
			onDeleteCustom
		});
		await user.click(screen.getByRole('button', { name: /Delete Cable Crunch/i }));
		const dialog = screen.getByRole('dialog');
		await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
		expect(onDeleteCustom).toHaveBeenCalledWith(customExercise.id);
	});

	it('dismisses confirm dialog on Cancel', async () => {
		const user = userEvent.setup();
		render(ExerciseList, {
			exercises: [...builtInExercises, customExercise],
			onSelect: vi.fn(),
			onDeleteCustom: vi.fn()
		});
		await user.click(screen.getByRole('button', { name: /Delete Cable Crunch/i }));
		await user.click(screen.getByRole('button', { name: /cancel/i }));
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});
});
