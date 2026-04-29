<script lang="ts">
	import type { Workout, WorkoutSet, WeightUnit } from '$lib/shared/types/workout.js';

	let {
		workout,
		labels
	}: {
		workout: Workout;
		labels: {
			formatDuration: (n: number) => string;
			formatSetLine: (n: number, reps: number, weight: number | null, unit: WeightUnit) => string;
			exerciseNames: Record<string, string>;
		};
	} = $props();

	// Group sets by exercise, preserving order of first appearance
	const groupedSets = $derived.by(() => {
		const order: string[] = [];
		const map = new Map<string, WorkoutSet[]>();
		for (const set of workout.sets) {
			if (!map.has(set.exerciseId)) {
				order.push(set.exerciseId);
				map.set(set.exerciseId, []);
			}
			map.get(set.exerciseId)!.push(set);
		}
		return order.map((id) => ({ exerciseId: id, sets: map.get(id)! }));
	});
</script>

<div class="flex flex-col gap-4 pt-2">
	{#if workout.durationMinutes}
		<p class="text-xs text-zinc-500">{labels.formatDuration(workout.durationMinutes)}</p>
	{/if}

	{#each groupedSets as group (group.exerciseId)}
		<section>
			<h3 class="mb-1 text-sm font-semibold text-white">
				{labels.exerciseNames[group.exerciseId] ?? group.exerciseId}
			</h3>
			<ol class="flex flex-col gap-1">
				{#each group.sets as set, i (set.id)}
					<li class="text-sm text-zinc-400">
						{labels.formatSetLine(i + 1, set.reps, set.weight, set.unit)}
					</li>
				{/each}
			</ol>
		</section>
	{/each}
</div>
