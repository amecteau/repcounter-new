/**
 * Creates a keydown handler for the counter screen keyboard shortcuts.
 * Extracted as a pure function so it can be unit-tested independently of the page.
 */
export function createKeyboardHandler({
	increment,
	decrement,
	saveSet,
	isPickerOpen,
	isDialogOpen
}: {
	increment: () => void;
	decrement: () => void;
	saveSet: () => void;
	isPickerOpen: () => boolean;
	isDialogOpen: () => boolean;
}) {
	return function handleKeydown(e: KeyboardEvent) {
		// Don't intercept when a modal or picker overlay is open
		if (isPickerOpen() || isDialogOpen()) return;

		const target = e.target as HTMLElement;
		if (
			target.tagName === 'INPUT' ||
			target.tagName === 'TEXTAREA' ||
			target.tagName === 'SELECT'
		)
			return;

		if (e.code === 'Space' || e.code === 'Enter') {
			e.preventDefault();
			increment();
		} else if (e.code === 'Backspace') {
			e.preventDefault();
			decrement();
		} else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
			e.preventDefault();
			saveSet();
		}
	};
}
