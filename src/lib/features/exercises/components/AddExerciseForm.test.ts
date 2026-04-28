import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import AddExerciseForm from './AddExerciseForm.svelte';

const labels = {
	nameLabel: 'Exercise Name',
	namePlaceholder: 'e.g. Cable Fly',
	muscleGroupLabel: 'Muscle Group',
	cancel: 'Cancel',
	save: 'Save',
	nameRequired: 'Name is required',
	nameTooLong: 'Name must be 50 characters or fewer',
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
	}
};

describe('AddExerciseForm', () => {
	it('renders name input and muscle group select', () => {
		render(AddExerciseForm, { onSave: vi.fn(), onCancel: vi.fn(), labels });
		expect(screen.getByRole('textbox', { name: /exercise name/i })).toBeInTheDocument();
		expect(screen.getByRole('combobox', { name: /muscle group/i })).toBeInTheDocument();
	});

	it('renders Cancel and Save buttons', () => {
		render(AddExerciseForm, { onSave: vi.fn(), onCancel: vi.fn(), labels });
		expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
	});

	it('calls onCancel when Cancel is clicked', async () => {
		const user = userEvent.setup();
		const onCancel = vi.fn();
		render(AddExerciseForm, { onSave: vi.fn(), onCancel, labels });
		await user.click(screen.getByRole('button', { name: /cancel/i }));
		expect(onCancel).toHaveBeenCalledOnce();
	});

	it('shows an error and does not call onSave when name is empty', async () => {
		const user = userEvent.setup();
		const onSave = vi.fn();
		render(AddExerciseForm, { onSave, onCancel: vi.fn(), labels });
		await user.click(screen.getByRole('button', { name: /save/i }));
		expect(screen.getByRole('alert')).toHaveTextContent(/name is required/i);
		expect(onSave).not.toHaveBeenCalled();
	});

	it('calls onSave with trimmed name and selected muscle group', async () => {
		const user = userEvent.setup();
		const onSave = vi.fn();
		render(AddExerciseForm, { onSave, onCancel: vi.fn(), labels });
		await user.type(screen.getByRole('textbox', { name: /exercise name/i }), '  Cable Fly  ');
		await user.click(screen.getByRole('button', { name: /save/i }));
		expect(onSave).toHaveBeenCalledWith('Cable Fly', 'chest');
	});

	it('calls onSave with the chosen muscle group', async () => {
		const user = userEvent.setup();
		const onSave = vi.fn();
		render(AddExerciseForm, { onSave, onCancel: vi.fn(), labels });
		await user.type(screen.getByRole('textbox', { name: /exercise name/i }), 'Hip Thrust');
		await user.selectOptions(screen.getByRole('combobox', { name: /muscle group/i }), 'legs');
		await user.click(screen.getByRole('button', { name: /save/i }));
		expect(onSave).toHaveBeenCalledWith('Hip Thrust', 'legs');
	});

	it('displays an externalError when provided', () => {
		render(AddExerciseForm, {
			onSave: vi.fn(),
			onCancel: vi.fn(),
			externalError: 'Already exists',
			labels
		});
		expect(screen.getByRole('alert')).toHaveTextContent('Already exists');
	});

	it('renders translated labels when Spanish labels are provided', () => {
		const spanishLabels = {
			...labels,
			nameLabel: 'Nombre del ejercicio',
			cancel: 'Cancelar',
			save: 'Guardar'
		};
		render(AddExerciseForm, { onSave: vi.fn(), onCancel: vi.fn(), labels: spanishLabels });
		expect(screen.getByRole('textbox', { name: /nombre del ejercicio/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument();
	});
});
