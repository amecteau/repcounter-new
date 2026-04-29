<script lang="ts">
	import type { FontScale } from '$lib/shared/types/settings.js';

	let {
		fontScale,
		onDecrease,
		onIncrease,
		labels
	}: {
		fontScale: FontScale;
		onDecrease: () => void;
		onIncrease: () => void;
		labels: {
			decrease: string;
			increase: string;
		};
	} = $props();

	const atMin = $derived(fontScale === 'small');
	const atMax = $derived(fontScale === 'extraLarge');
</script>

<style>
	@reference "tailwindcss";
	.scale-btn {
		@apply flex h-11 w-11 items-center justify-center rounded text-sm text-zinc-400 hover:text-white disabled:opacity-30;
	}
</style>

<div class="flex items-center gap-1">
	<button onclick={onDecrease} disabled={atMin} aria-label={labels.decrease} class="scale-btn">
		A−
	</button>
	<button onclick={onIncrease} disabled={atMax} aria-label={labels.increase} class="scale-btn">
		A+
	</button>
</div>
