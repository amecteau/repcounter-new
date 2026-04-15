import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import AddExerciseForm from './AddExerciseForm.svelte';

describe('AddExerciseForm', () => {
	it('renders name input and muscle group select', () => {
		render(AddExerciseForm, { onSave: vi.fn(), onCancel: vi.fn() });
		expect(screen.getByRole('textbox', { name: /exercise name/i })).toBeInTheDocument();
		expect(screen.getByRole('combobox', { name: /muscle group/i })).toBeInTheDocument();
	});

	it('renders Cancel and Save buttons', () => {
		render(AddExerciseForm, { onSave: vi.fn(), onCancel: vi.fn() });
		expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
	});

	it('calls onCancel when Cancel is clicked', async () => {
		const user = userEvent.setup();
		const onCancel = vi.fn();
		render(AddExerciseForm, { onSave: vi.fn(), onCancel });
		await user.click(screen.getByRole('button', { name: /cancel/i }));
		expect(onCancel).toHaveBeenCalledOnce();
	});

	it('shows an error and does not call onSave when name is empty', async () => {
		const user = userEvent.setup();
		const onSave = vi.fn();
		render(AddExerciseForm, { onSave, onCancel: vi.fn() });
		await user.click(screen.getByRole('button', { name: /save/i }));
		expect(screen.getByRole('alert')).toHaveTextContent(/name is required/i);
		expect(onSave).not.toHaveBeenCalled();
	});

	it('calls onSave with trimmed name and selected muscle group', async () => {
		const user = userEvent.setup();
		const onSave = vi.fn();
		render(AddExerciseForm, { onSave, onCancel: vi.fn() });
		await user.type(screen.getByRole('textbox', { name: /exercise name/i }), '  Cable Fly  ');
		await user.click(screen.getByRole('button', { name: /save/i }));
		expect(onSave).toHaveBeenCalledWith('Cable Fly', 'chest');
	});

	it('calls onSave with the chosen muscle group', async () => {
		const user = userEvent.setup();
		const onSave = vi.fn();
		render(AddExerciseForm, { onSave, onCancel: vi.fn() });
		await user.type(screen.getByRole('textbox', { name: /exercise name/i }), 'Hip Thrust');
		await user.selectOptions(screen.getByRole('combobox', { name: /muscle group/i }), 'legs');
		await user.click(screen.getByRole('button', { name: /save/i }));
		expect(onSave).toHaveBeenCalledWith('Hip Thrust', 'legs');
	});

	it('displays an externalError when provided', () => {
		render(AddExerciseForm, {
			onSave: vi.fn(),
			onCancel: vi.fn(),
			externalError: 'Already exists'
		});
		expect(screen.getByRole('alert')).toHaveTextContent('Already exists');
	});
});
