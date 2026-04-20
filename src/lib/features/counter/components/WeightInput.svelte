<script lang="ts">
	import type { WeightUnit } from '$lib/shared/types/workout.js';

	let {
		weight,
		unit,
		onWeightChange,
		onUnitChange,
		onAdjust
	}: {
		weight: number | null;
		unit: WeightUnit;
		onWeightChange: (w: number | null) => void;
		onUnitChange: (u: WeightUnit) => void;
		onAdjust: (delta: number) => void;
	} = $props();

	const step = $derived(unit === 'lb' ? 5 : 2.5);

	function handleInput(e: Event) {
		const val = (e.target as HTMLInputElement).value;
		onWeightChange(val ? parseFloat(val) : null);
	}
</script>

<div class="flex flex-col gap-3 rounded-2xl bg-zinc-900 p-4">
	<span class="text-xs font-semibold uppercase tracking-widest text-zinc-500">Weight</span>

	<div class="flex items-center gap-3">
		<button
			onclick={() => onAdjust(-step)}
			aria-label={`-${step}`}
			class="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-lg font-medium text-white active:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
		>
			−{step}
		</button>

		<div class="flex flex-1 flex-col items-center gap-1">
			<input
				type="text"
				inputmode="decimal"
				value={weight ?? ''}
				oninput={handleInput}
				aria-label="Weight"
				placeholder="—"
				class="w-full bg-transparent text-center text-[5rem] font-bold leading-none text-blue-400 placeholder-zinc-700 focus:outline-none"
			/>
			<button
				onclick={() => onUnitChange(unit === 'lb' ? 'kg' : 'lb')}
				aria-label={`Unit: ${unit}, tap to toggle`}
				class="rounded px-3 py-1 text-sm font-semibold text-zinc-400 active:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
			>
				{unit}
			</button>
		</div>

		<button
			onclick={() => onAdjust(step)}
			aria-label={`+${step}`}
			class="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-lg font-medium text-white active:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
		>
			+{step}
		</button>
	</div>
</div>
