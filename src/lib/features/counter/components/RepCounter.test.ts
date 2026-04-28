import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import RepCounter from './RepCounter.svelte';

const labels = {
	reps: 'Reps',
	setNumber: 'Set 1',
	tapToCount: 'Tap to count',
	increment: 'Increment',
	decrement: 'Decrement',
	repsAriaLive: (n: number) => `${n} reps`
};

describe('RepCounter', () => {
	it('renders the current rep count', () => {
		render(RepCounter, { repCount: 7, onIncrement: vi.fn(), onDecrement: vi.fn(), labels });
		expect(screen.getByRole('button', { name: /tap to count/i })).toBeInTheDocument();
		expect(screen.getByRole('status')).toHaveTextContent('7');
	});

	it('calls onIncrement when the tap area is clicked', async () => {
		const user = userEvent.setup();
		const onIncrement = vi.fn();
		render(RepCounter, { repCount: 0, onIncrement, onDecrement: vi.fn(), labels });
		await user.click(screen.getByRole('button', { name: /tap to count/i }));
		expect(onIncrement).toHaveBeenCalledOnce();
	});

	it('calls onIncrement when the + button is clicked', async () => {
		const user = userEvent.setup();
		const onIncrement = vi.fn();
		render(RepCounter, { repCount: 0, onIncrement, onDecrement: vi.fn(), labels });
		await user.click(screen.getByRole('button', { name: /increment/i }));
		expect(onIncrement).toHaveBeenCalledOnce();
	});

	it('calls onDecrement when the − button is clicked', async () => {
		const user = userEvent.setup();
		const onDecrement = vi.fn();
		render(RepCounter, { repCount: 5, onIncrement: vi.fn(), onDecrement, labels });
		await user.click(screen.getByRole('button', { name: /decrement/i }));
		expect(onDecrement).toHaveBeenCalledOnce();
	});

	it('has an aria-live status region for screen readers', () => {
		render(RepCounter, { repCount: 3, onIncrement: vi.fn(), onDecrement: vi.fn(), labels });
		const status = screen.getByRole('status');
		expect(status).toHaveAttribute('aria-live', 'polite');
		expect(status).toHaveTextContent('3');
	});

	it('renders rep count 0', () => {
		render(RepCounter, { repCount: 0, onIncrement: vi.fn(), onDecrement: vi.fn(), labels });
		expect(screen.getByRole('status')).toHaveTextContent('0');
	});

	it('tap area and + button both trigger increment', async () => {
		const user = userEvent.setup();
		const onIncrement = vi.fn();
		render(RepCounter, { repCount: 0, onIncrement, onDecrement: vi.fn(), labels });
		await user.click(screen.getByRole('button', { name: /tap to count/i }));
		await user.click(screen.getByRole('button', { name: /increment/i }));
		expect(onIncrement).toHaveBeenCalledTimes(2);
	});

	it('displays the set number from labels', () => {
		const set3Labels = { ...labels, setNumber: 'Set 3' };
		render(RepCounter, { repCount: 0, onIncrement: vi.fn(), onDecrement: vi.fn(), labels: set3Labels });
		expect(screen.getByText(/set 3/i)).toBeInTheDocument();
	});

	it('defaults to set 1 label when set number is 1', () => {
		render(RepCounter, { repCount: 0, onIncrement: vi.fn(), onDecrement: vi.fn(), labels });
		expect(screen.getByText(/set 1/i)).toBeInTheDocument();
	});
});
