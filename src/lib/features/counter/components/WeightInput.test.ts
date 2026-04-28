import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import WeightInput from './WeightInput.svelte';

const labels = {
	heading: 'Weight',
	weightAriaLabel: 'Weight',
	unitToggleAriaLabel: (unit: string) => `Toggle weight unit: ${unit}`,
	decreaseAriaLabel: (delta: number) => `Decrease weight ${delta}`,
	increaseAriaLabel: (delta: number) => `Increase weight ${delta}`
};

describe('WeightInput', () => {
	it('renders the weight field and stepper buttons', () => {
		render(WeightInput, {
			weight: 135,
			unit: 'lb',
			onWeightChange: vi.fn(),
			onUnitChange: vi.fn(),
			onAdjust: vi.fn(),
			labels
		});
		expect(screen.getByRole('textbox', { name: /weight/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /decrease weight 5/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /increase weight 5/i })).toBeInTheDocument();
	});

	it('displays the current weight value', () => {
		render(WeightInput, {
			weight: 135,
			unit: 'lb',
			onWeightChange: vi.fn(),
			onUnitChange: vi.fn(),
			onAdjust: vi.fn(),
			labels
		});
		expect(screen.getByRole('textbox', { name: /weight/i })).toHaveValue('135');
	});

	it('shows empty field when weight is null', () => {
		render(WeightInput, {
			weight: null,
			unit: 'lb',
			onWeightChange: vi.fn(),
			onUnitChange: vi.fn(),
			onAdjust: vi.fn(),
			labels
		});
		expect(screen.getByRole('textbox', { name: /weight/i })).toHaveValue('');
	});

	it('calls onAdjust with -5 when minus stepper is clicked (lb)', async () => {
		const user = userEvent.setup();
		const onAdjust = vi.fn();
		render(WeightInput, {
			weight: 135,
			unit: 'lb',
			onWeightChange: vi.fn(),
			onUnitChange: vi.fn(),
			onAdjust,
			labels
		});
		await user.click(screen.getByRole('button', { name: /decrease weight 5/i }));
		expect(onAdjust).toHaveBeenCalledWith(-5);
	});

	it('calls onAdjust with +5 when plus stepper is clicked (lb)', async () => {
		const user = userEvent.setup();
		const onAdjust = vi.fn();
		render(WeightInput, {
			weight: 135,
			unit: 'lb',
			onWeightChange: vi.fn(),
			onUnitChange: vi.fn(),
			onAdjust,
			labels
		});
		await user.click(screen.getByRole('button', { name: /increase weight 5/i }));
		expect(onAdjust).toHaveBeenCalledWith(5);
	});

	it('uses 2.5 step for kg unit', () => {
		render(WeightInput, {
			weight: 60,
			unit: 'kg',
			onWeightChange: vi.fn(),
			onUnitChange: vi.fn(),
			onAdjust: vi.fn(),
			labels
		});
		expect(screen.getByRole('button', { name: /decrease weight 2.5/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /increase weight 2.5/i })).toBeInTheDocument();
	});

	it('calls onUnitChange when unit toggle is clicked', async () => {
		const user = userEvent.setup();
		const onUnitChange = vi.fn();
		render(WeightInput, {
			weight: 135,
			unit: 'lb',
			onWeightChange: vi.fn(),
			onUnitChange,
			onAdjust: vi.fn(),
			labels
		});
		await user.click(screen.getByRole('button', { name: /unit/i }));
		expect(onUnitChange).toHaveBeenCalledWith('kg');
	});

	it('toggles from kg to lb', async () => {
		const user = userEvent.setup();
		const onUnitChange = vi.fn();
		render(WeightInput, {
			weight: 60,
			unit: 'kg',
			onWeightChange: vi.fn(),
			onUnitChange,
			onAdjust: vi.fn(),
			labels
		});
		await user.click(screen.getByRole('button', { name: /unit/i }));
		expect(onUnitChange).toHaveBeenCalledWith('lb');
	});

	it('calls onWeightChange with parsed number when user types a value', async () => {
		const user = userEvent.setup();
		const onWeightChange = vi.fn();
		render(WeightInput, {
			weight: null,
			unit: 'lb',
			onWeightChange,
			onUnitChange: vi.fn(),
			onAdjust: vi.fn(),
			labels
		});
		await user.type(screen.getByRole('textbox', { name: /weight/i }), '135');
		expect(onWeightChange).toHaveBeenLastCalledWith(135);
	});

	it('calls onWeightChange with null when the input is cleared', async () => {
		const user = userEvent.setup();
		const onWeightChange = vi.fn();
		render(WeightInput, {
			weight: 135,
			unit: 'lb',
			onWeightChange,
			onUnitChange: vi.fn(),
			onAdjust: vi.fn(),
			labels
		});
		await user.clear(screen.getByRole('textbox', { name: /weight/i }));
		expect(onWeightChange).toHaveBeenLastCalledWith(null);
	});

	it('calls onAdjust with -2.5 when minus stepper is clicked (kg)', async () => {
		const user = userEvent.setup();
		const onAdjust = vi.fn();
		render(WeightInput, {
			weight: 60,
			unit: 'kg',
			onWeightChange: vi.fn(),
			onUnitChange: vi.fn(),
			onAdjust,
			labels
		});
		await user.click(screen.getByRole('button', { name: /decrease weight 2.5/i }));
		expect(onAdjust).toHaveBeenCalledWith(-2.5);
	});

	it('calls onAdjust with +2.5 when plus stepper is clicked (kg)', async () => {
		const user = userEvent.setup();
		const onAdjust = vi.fn();
		render(WeightInput, {
			weight: 60,
			unit: 'kg',
			onWeightChange: vi.fn(),
			onUnitChange: vi.fn(),
			onAdjust,
			labels
		});
		await user.click(screen.getByRole('button', { name: /increase weight 2.5/i }));
		expect(onAdjust).toHaveBeenCalledWith(2.5);
	});
});
