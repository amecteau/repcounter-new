import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import LanguageControl from './LanguageControl.svelte';

const baseLabels = {
	heading: 'Language',
	matchSystem: 'Match system',
	english: 'English',
	spanish: 'Español'
};

describe('LanguageControl', () => {
	it('renders the heading', () => {
		render(LanguageControl, {
			preference: 'system',
			resolvedLanguage: 'en',
			labels: baseLabels,
			onChange: vi.fn()
		});
		expect(screen.getByText('Language')).toBeInTheDocument();
	});

	it('renders three radio options', () => {
		render(LanguageControl, {
			preference: 'system',
			resolvedLanguage: 'en',
			labels: baseLabels,
			onChange: vi.fn()
		});
		expect(screen.getAllByRole('radio')).toHaveLength(3);
	});

	it('shows resolved language in parens for "Match system" — English', () => {
		render(LanguageControl, {
			preference: 'system',
			resolvedLanguage: 'en',
			labels: baseLabels,
			onChange: vi.fn()
		});
		expect(screen.getByText(/Match system \(English\)/)).toBeInTheDocument();
	});

	it('shows resolved language in parens for "Match system" — Español', () => {
		render(LanguageControl, {
			preference: 'system',
			resolvedLanguage: 'es',
			labels: baseLabels,
			onChange: vi.fn()
		});
		expect(screen.getByText(/Match system \(Español\)/)).toBeInTheDocument();
	});

	it('marks the "system" radio as checked when preference is "system"', () => {
		render(LanguageControl, {
			preference: 'system',
			resolvedLanguage: 'en',
			labels: baseLabels,
			onChange: vi.fn()
		});
		const radios = screen.getAllByRole('radio') as HTMLInputElement[];
		const systemRadio = radios.find((r) => r.value === 'system');
		expect(systemRadio?.checked).toBe(true);
	});

	it('marks the "en" radio as checked when preference is "en"', () => {
		render(LanguageControl, {
			preference: 'en',
			resolvedLanguage: 'en',
			labels: baseLabels,
			onChange: vi.fn()
		});
		const radios = screen.getAllByRole('radio') as HTMLInputElement[];
		const enRadio = radios.find((r) => r.value === 'en');
		expect(enRadio?.checked).toBe(true);
	});

	it('marks the "es" radio as checked when preference is "es"', () => {
		render(LanguageControl, {
			preference: 'es',
			resolvedLanguage: 'es',
			labels: baseLabels,
			onChange: vi.fn()
		});
		const radios = screen.getAllByRole('radio') as HTMLInputElement[];
		const esRadio = radios.find((r) => r.value === 'es');
		expect(esRadio?.checked).toBe(true);
	});

	it('calls onChange with "en" when the English option is clicked', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(LanguageControl, {
			preference: 'system',
			resolvedLanguage: 'en',
			labels: baseLabels,
			onChange
		});
		await user.click(screen.getByText('English'));
		expect(onChange).toHaveBeenCalledWith('en');
	});

	it('calls onChange with "es" when the Español option is clicked', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(LanguageControl, {
			preference: 'system',
			resolvedLanguage: 'en',
			labels: baseLabels,
			onChange
		});
		await user.click(screen.getByText('Español'));
		expect(onChange).toHaveBeenCalledWith('es');
	});

	it('calls onChange with "system" when the Match system option is clicked', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(LanguageControl, {
			preference: 'en',
			resolvedLanguage: 'en',
			labels: baseLabels,
			onChange
		});
		await user.click(screen.getByText(/Match system/));
		expect(onChange).toHaveBeenCalledWith('system');
	});
});
