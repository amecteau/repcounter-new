import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import ClearHistoryControl from './ClearHistoryControl.svelte';

const baseLabels = {
	sectionHeading: 'Clear Data',
	buttonLabel: 'Clear History',
	confirmTitle: 'Delete all workout history?',
	confirmLabel: 'Confirm',
	cancelLabel: 'Cancel'
};

const spanishLabels = {
	sectionHeading: 'Borrar datos',
	buttonLabel: 'Borrar historial',
	confirmTitle: '¿Borrar todo el historial de entrenamiento?',
	confirmLabel: 'Confirmar',
	cancelLabel: 'Cancelar'
};

describe('ClearHistoryControl', () => {
	it('renders the section heading and button', () => {
		render(ClearHistoryControl, { labels: baseLabels, onClear: vi.fn() });
		expect(screen.getByText('Clear Data')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Clear History' })).toBeInTheDocument();
	});

	it('opens the confirm dialog when the button is clicked', async () => {
		const user = userEvent.setup();
		render(ClearHistoryControl, { labels: baseLabels, onClear: vi.fn() });
		await user.click(screen.getByRole('button', { name: 'Clear History' }));
		expect(screen.getByRole('dialog')).toBeInTheDocument();
		expect(screen.getByText('Delete all workout history?')).toBeInTheDocument();
	});

	it('does not fire onClear and closes dialog when Cancel is clicked', async () => {
		const user = userEvent.setup();
		const onClear = vi.fn();
		render(ClearHistoryControl, { labels: baseLabels, onClear });
		await user.click(screen.getByRole('button', { name: 'Clear History' }));
		await user.click(screen.getByRole('button', { name: 'Cancel' }));
		expect(onClear).not.toHaveBeenCalled();
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	it('fires onClear when Confirm is clicked', async () => {
		const user = userEvent.setup();
		const onClear = vi.fn().mockResolvedValue(undefined);
		render(ClearHistoryControl, { labels: baseLabels, onClear });
		await user.click(screen.getByRole('button', { name: 'Clear History' }));
		await user.click(screen.getByRole('button', { name: 'Confirm' }));
		expect(onClear).toHaveBeenCalledOnce();
	});

	it('renders correctly with Spanish labels', () => {
		render(ClearHistoryControl, { labels: spanishLabels, onClear: vi.fn() });
		expect(screen.getByText('Borrar datos')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Borrar historial' })).toBeInTheDocument();
	});
});
