<script lang="ts">
	let {
		repCount,
		setNumber = 1,
		onIncrement,
		onDecrement
	}: {
		repCount: number;
		setNumber?: number;
		onIncrement: () => void;
		onDecrement: () => void;
	} = $props();

	let pulsing = $state(false);

	function handleIncrement() {
		onIncrement();
		// Restart animation so rapid taps re-trigger it each time
		pulsing = false;
		requestAnimationFrame(() => {
			pulsing = true;
			setTimeout(() => {
				pulsing = false;
			}, 200);
		});
	}
</script>

<!-- Visually hidden live region announces rep count changes to screen readers -->
<div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
	{repCount} reps
</div>

<div class="flex flex-col gap-3 rounded-2xl bg-zinc-900 p-4">
	<div class="flex items-center justify-between">
		<span class="text-xs font-semibold uppercase tracking-widest text-zinc-500">Reps</span>
		<span class="text-xs text-zinc-500">Set {setNumber}</span>
	</div>

	<!-- Giant tap area — the primary counting input -->
	<button
		onclick={handleIncrement}
		aria-label="Tap to count"
		class="flex min-h-[8rem] w-full items-center justify-center rounded-xl active:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
	>
		<span
			aria-hidden="true"
			class="text-[5.5rem] font-bold leading-none text-blue-400 {pulsing ? 'rep-pulse' : ''}"
		>
			{repCount}
		</span>
	</button>

	<!-- +/− buttons inside the card -->
	<div class="flex items-center justify-between px-4">
		<button
			onclick={onDecrement}
			aria-label="Decrement"
			class="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800 text-2xl font-light text-white active:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
		>
			−
		</button>
		<button
			onclick={handleIncrement}
			aria-label="Increment"
			class="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-2xl font-light text-white active:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
		>
			+
		</button>
	</div>
</div>
