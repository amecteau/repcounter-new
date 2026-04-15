import { describe, it, expect, vi } from 'vitest';
import { createKeyboardHandler } from './keyboardShortcuts.js';

function makeEvent(
	code: string,
	overrides: Partial<{ key: string; ctrlKey: boolean; metaKey: boolean; target: EventTarget }>= {}
): KeyboardEvent & { preventDefault: ReturnType<typeof vi.fn> } {
	const e = {
		code,
		key: overrides.key ?? code,
		ctrlKey: overrides.ctrlKey ?? false,
		metaKey: overrides.metaKey ?? false,
		target: overrides.target ?? document.body,
		preventDefault: vi.fn()
	} as unknown as KeyboardEvent & { preventDefault: ReturnType<typeof vi.fn> };
	return e;
}

function makeHandler(overrides: {
	increment?: () => void;
	decrement?: () => void;
	saveSet?: () => void;
	isPickerOpen?: () => boolean;
	isDialogOpen?: () => boolean;
} = {}) {
	return createKeyboardHandler({
		increment: overrides.increment ?? vi.fn(),
		decrement: overrides.decrement ?? vi.fn(),
		saveSet: overrides.saveSet ?? vi.fn(),
		isPickerOpen: overrides.isPickerOpen ?? (() => false),
		isDialogOpen: overrides.isDialogOpen ?? (() => false)
	});
}

describe('createKeyboardHandler', () => {
	it('calls increment and preventDefault on Space', () => {
		const increment = vi.fn();
		const handler = makeHandler({ increment });
		const e = makeEvent('Space');
		handler(e);
		expect(increment).toHaveBeenCalledOnce();
		expect(e.preventDefault).toHaveBeenCalled();
	});

	it('calls increment and preventDefault on Enter', () => {
		const increment = vi.fn();
		const handler = makeHandler({ increment });
		const e = makeEvent('Enter');
		handler(e);
		expect(increment).toHaveBeenCalledOnce();
		expect(e.preventDefault).toHaveBeenCalled();
	});

	it('calls decrement and preventDefault on Backspace', () => {
		const decrement = vi.fn();
		const handler = makeHandler({ decrement });
		const e = makeEvent('Backspace');
		handler(e);
		expect(decrement).toHaveBeenCalledOnce();
		expect(e.preventDefault).toHaveBeenCalled();
	});

	it('calls saveSet and preventDefault on Ctrl+S', () => {
		const saveSet = vi.fn();
		const handler = makeHandler({ saveSet });
		const e = makeEvent('KeyS', { key: 's', ctrlKey: true });
		handler(e);
		expect(saveSet).toHaveBeenCalledOnce();
		expect(e.preventDefault).toHaveBeenCalled();
	});

	it('calls saveSet and preventDefault on Meta+S (Mac)', () => {
		const saveSet = vi.fn();
		const handler = makeHandler({ saveSet });
		const e = makeEvent('KeyS', { key: 's', metaKey: true });
		handler(e);
		expect(saveSet).toHaveBeenCalledOnce();
		expect(e.preventDefault).toHaveBeenCalled();
	});

	it('does nothing for unrelated keys', () => {
		const increment = vi.fn();
		const decrement = vi.fn();
		const saveSet = vi.fn();
		const handler = makeHandler({ increment, decrement, saveSet });
		handler(makeEvent('KeyA'));
		expect(increment).not.toHaveBeenCalled();
		expect(decrement).not.toHaveBeenCalled();
		expect(saveSet).not.toHaveBeenCalled();
	});

	it('does nothing when picker is open', () => {
		const increment = vi.fn();
		const handler = makeHandler({ increment, isPickerOpen: () => true });
		handler(makeEvent('Space'));
		expect(increment).not.toHaveBeenCalled();
	});

	it('does nothing when dialog is open', () => {
		const increment = vi.fn();
		const handler = makeHandler({ increment, isDialogOpen: () => true });
		handler(makeEvent('Space'));
		expect(increment).not.toHaveBeenCalled();
	});

	it('does nothing when target is an input element', () => {
		const increment = vi.fn();
		const handler = makeHandler({ increment });
		const input = document.createElement('input');
		const e = makeEvent('Space', { target: input });
		handler(e);
		expect(increment).not.toHaveBeenCalled();
	});

	it('does nothing when target is a select element', () => {
		const decrement = vi.fn();
		const handler = makeHandler({ decrement });
		const select = document.createElement('select');
		const e = makeEvent('Backspace', { target: select });
		handler(e);
		expect(decrement).not.toHaveBeenCalled();
	});
});
