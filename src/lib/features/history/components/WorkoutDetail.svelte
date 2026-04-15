<script lang="ts">
	import type { Workout, WorkoutSet } from '$lib/shared/types/workout.js';
	import type { Exercise } from '$lib/shared/types/exercise.js';

	let {
		workout,
		exercises
	}: {
		workout: Workout;
		exercises: Exercise[];
	} = $props();

	function getExerciseName(id: string): string {
		return exercises.find((e) => e.id === id)?.name ?? id;
	}

	function formatWeight(set: WorkoutSet): string {
		if (set.weight === null) return 'bodyweight';
		return `${set.weight} ${set.unit}`;
	}

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
		<p class="text-xs text-zinc-500">Duration: {workout.durationMinutes} min</p>
	{/if}

	{#each groupedSets as group (group.exerciseId)}
		<section>
			<h3 class="mb-1 text-sm font-semibold text-white">{getExerciseName(group.exerciseId)}</h3>
			<ol class="flex flex-col gap-1">
				{#each group.sets as set, i (set.id)}
					<li class="text-sm text-zinc-400">
						Set {i + 1}: {set.reps} × {formatWeight(set)}
					</li>
				{/each}
			</ol>
		</section>
	{/each}
</div>
