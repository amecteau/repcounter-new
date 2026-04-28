import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import ExercisePicker from './ExercisePicker.svelte';
import type { Exercise } from '$lib/shared/types/exercise.js';

const exercises: Exercise[] = [
	{ id: 'bench-press', name: 'Bench Press', muscleGroup: 'chest', isCustom: false },
	{ id: 'squat', name: 'Squat', muscleGroup: 'legs', isCustom: false },
	{ id: 'pull-up', name: 'Pull-Up', muscleGroup: 'back', isCustom: false }
];

const labels = {
	dialogLabel: 'Select exercise',
	searchPlaceholder: 'Search exercises…',
	searchAriaLabel: 'Search exercises…',
	cancelLabel: 'Cancel',
	muscleGroups: {
		chest: 'Chest',
		back: 'Back',
		shoulders: 'Shoulders',
		traps: 'Traps',
		biceps: 'Biceps',
		triceps: 'Triceps',
		forearms: 'Forearms',
		legs: 'Legs',
		calves: 'Calves',
		core: 'Core',
		fullBody: 'Full Body'
	},
	exerciseNames: {
		'bench-press': 'Bench Press',
		'squat': 'Squat',
		'pull-up': 'Pull-Up'
	},
	customMarker: '(custom)'
};

describe('ExercisePicker', () => {
	it('renders as a dialog', () => {
		render(ExercisePicker, {
			exercises,
			searchQuery: '',
			onSelect: vi.fn(),
			onSearch: vi.fn(),
			onCancel: vi.fn(),
			labels
		});
		expect(screen.getByRole('dialog', { name: /select exercise/i })).toBeInTheDocument();
	});

	it('renders a search input', () => {
		render(ExercisePicker, {
			exercises,
			searchQuery: '',
			onSelect: vi.fn(),
			onSearch: vi.fn(),
			onCancel: vi.fn(),
			labels
		});
		expect(screen.getByRole('searchbox', { name: /search exercises/i })).toBeInTheDocument();
	});

	it('renders all provided exercises', () => {
		render(ExercisePicker, {
			exercises,
			searchQuery: '',
			onSelect: vi.fn(),
			onSearch: vi.fn(),
			onCancel: vi.fn(),
			labels
		});
		expect(screen.getByRole('button', { name: 'Bench Press' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Squat' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Pull-Up' })).toBeInTheDocument();
	});

	it('calls onSelect with the exercise when clicked', async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		render(ExercisePicker, {
			exercises,
			searchQuery: '',
			onSelect,
			onSearch: vi.fn(),
			onCancel: vi.fn(),
			labels
		});
		await user.click(screen.getByRole('button', { name: 'Bench Press' }));
		expect(onSelect).toHaveBeenCalledWith(exercises[0]);
	});

	it('calls onSearch when text is typed in the search box', async () => {
		const user = userEvent.setup();
		const onSearch = vi.fn();
		render(ExercisePicker, {
			exercises,
			searchQuery: '',
			onSelect: vi.fn(),
			onSearch,
			onCancel: vi.fn(),
			labels
		});
		await user.type(screen.getByRole('searchbox', { name: /search exercises/i }), 'bench');
		expect(onSearch).toHaveBeenCalled();
	});

	it('calls onCancel when the Cancel button is clicked', async () => {
		const user = userEvent.setup();
		const onCancel = vi.fn();
		render(ExercisePicker, {
			exercises,
			searchQuery: '',
			onSelect: vi.fn(),
			onSearch: vi.fn(),
			onCancel,
			labels
		});
		await user.click(screen.getByRole('button', { name: /cancel/i }));
		expect(onCancel).toHaveBeenCalledOnce();
	});

	it('calls onCancel when Escape is pressed', async () => {
		const user = userEvent.setup();
		const onCancel = vi.fn();
		render(ExercisePicker, {
			exercises,
			searchQuery: '',
			onSelect: vi.fn(),
			onSearch: vi.fn(),
			onCancel,
			labels
		});
		await user.keyboard('{Escape}');
		expect(onCancel).toHaveBeenCalledOnce();
	});

	it('groups exercises under muscle group headings', () => {
		render(ExercisePicker, {
			exercises,
			searchQuery: '',
			onSelect: vi.fn(),
			onSearch: vi.fn(),
			onCancel: vi.fn(),
			labels
		});
		expect(screen.getByRole('heading', { name: /chest/i })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: /legs/i })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: /back/i })).toBeInTheDocument();
	});

	it('displays the current search query in the input', () => {
		render(ExercisePicker, {
			exercises,
			searchQuery: 'bench',
			onSelect: vi.fn(),
			onSearch: vi.fn(),
			onCancel: vi.fn(),
			labels
		});
		expect(screen.getByRole('searchbox', { name: /search exercises/i })).toHaveValue('bench');
	});

	it('renders translated labels when Spanish labels are provided', () => {
		const spanishLabels = {
			...labels,
			dialogLabel: 'Seleccionar ejercicio',
			cancelLabel: 'Cancelar',
			muscleGroups: { ...labels.muscleGroups, chest: 'Pecho', legs: 'Piernas', back: 'Espalda' }
		};
		render(ExercisePicker, {
			exercises,
			searchQuery: '',
			onSelect: vi.fn(),
			onSearch: vi.fn(),
			onCancel: vi.fn(),
			labels: spanishLabels
		});
		expect(screen.getByRole('dialog', { name: /seleccionar ejercicio/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: /pecho/i })).toBeInTheDocument();
	});
});
