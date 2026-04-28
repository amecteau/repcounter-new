import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import BottomNav from './BottomNav.svelte';

const labels = {
	counter: 'Counter',
	history: 'History',
	exercises: 'Exercises'
};
const navAriaLabel = 'Main navigation';

describe('BottomNav', () => {
	it('renders Counter, History, and Exercises tabs', () => {
		render(BottomNav, { currentPath: '/', labels, navAriaLabel });
		expect(screen.getByRole('link', { name: /counter/i })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: /history/i })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: /exercises/i })).toBeInTheDocument();
	});

	it('marks Counter tab as current on /', () => {
		render(BottomNav, { currentPath: '/', labels, navAriaLabel });
		expect(screen.getByRole('link', { name: /counter/i })).toHaveAttribute('aria-current', 'page');
		expect(screen.getByRole('link', { name: /history/i })).not.toHaveAttribute('aria-current');
		expect(screen.getByRole('link', { name: /exercises/i })).not.toHaveAttribute('aria-current');
	});

	it('marks History tab as current on /history', () => {
		render(BottomNav, { currentPath: '/history', labels, navAriaLabel });
		expect(screen.getByRole('link', { name: /history/i })).toHaveAttribute('aria-current', 'page');
		expect(screen.getByRole('link', { name: /counter/i })).not.toHaveAttribute('aria-current');
	});

	it('marks Exercises tab as current on /exercises', () => {
		render(BottomNav, { currentPath: '/exercises', labels, navAriaLabel });
		expect(screen.getByRole('link', { name: /exercises/i })).toHaveAttribute(
			'aria-current',
			'page'
		);
	});

	it('renders provided label values for each tab', () => {
		const spanishLabels = {
			counter: 'Contador',
			history: 'Historial',
			exercises: 'Ejercicios'
		};
		render(BottomNav, {
			currentPath: '/',
			labels: spanishLabels,
			navAriaLabel: 'Navegación principal'
		});
		expect(screen.getByRole('link', { name: /contador/i })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: /historial/i })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: /ejercicios/i })).toBeInTheDocument();
		expect(screen.getByRole('navigation', { name: /navegación principal/i })).toBeInTheDocument();
	});

	it('uses the provided navAriaLabel on the navigation landmark', () => {
		render(BottomNav, { currentPath: '/', labels, navAriaLabel });
		expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
	});
});
