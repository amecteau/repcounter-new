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

<div class="flex flex-col gap-2">
	<div class="flex items-center gap-2">
		<button
			onclick={() => onAdjust(-step)}
			aria-label={`-${step}`}
			class="flex h-[3.75rem] w-20 items-center justify-center rounded-lg bg-zinc-800 text-base font-medium text-white active:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
		>
			−{step}
		</button>

		<input
			type="text"
			inputmode="decimal"
			value={weight ?? ''}
			oninput={handleInput}
			aria-label="Weight"
			placeholder="—"
			class="h-[3.75rem] min-w-0 flex-1 rounded-lg bg-zinc-800 px-2 text-center text-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
		/>

		<button
			onclick={() => onUnitChange(unit === 'lb' ? 'kg' : 'lb')}
			aria-label={`Unit: ${unit}, tap to toggle`}
			class="flex h-[3.75rem] w-14 items-center justify-center rounded-lg bg-zinc-700 text-base font-medium text-zinc-200 active:bg-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
		>
			{unit}
		</button>

		<button
			onclick={() => onAdjust(step)}
			aria-label={`+${step}`}
			class="flex h-[3.75rem] w-20 items-center justify-center rounded-lg bg-zinc-800 text-base font-medium text-white active:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
		>
			+{step}
		</button>
	</div>
</div>
