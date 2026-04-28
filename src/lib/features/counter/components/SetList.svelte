<script lang="ts">
	import type { WorkoutSet, WeightUnit } from '$lib/shared/types/workout.js';
	import type { Exercise } from '$lib/shared/types/exercise.js';

	let {
		sets,
		exercises,
		onUndo,
		labels
	}: {
		sets: WorkoutSet[];
		exercises: Exercise[];
		onUndo: (setId: string) => Promise<void>;
		labels: {
			previousSetsHeading: string;
			previousSetsRegion: string;
			unknownExercise: string;
			exerciseNames: Record<string, string>;
			formatSetLine: (
				n: number,
				reps: number,
				weight: number | null,
				unit: WeightUnit
			) => string;
			undoAriaLabel: (n: number) => string;
			undoLabel: string;
		};
	} = $props();

	function getExerciseName(exerciseId: string): string {
		const exercise = exercises.find((e) => e.id === exerciseId);
		if (!exercise) return labels.unknownExercise;
		return exercise.isCustom
			? exercise.name
			: (labels.exerciseNames[exercise.id] ?? exercise.name);
	}

	const grouped = $derived.by(() => {
		const order: string[] = [];
		const map = new Map<string, WorkoutSet[]>();
		for (const s of sets) {
			if (!map.has(s.exerciseId)) {
				order.push(s.exerciseId);
				map.set(s.exerciseId, []);
			}
			map.get(s.exerciseId)!.push(s);
		}
		return order.map((id) => ({ exerciseId: id, items: map.get(id)! }));
	});
</script>

<style>
	@reference "tailwindcss";
	.set-row {
		@apply flex items-center justify-between rounded-lg bg-zinc-900 px-4 py-3 text-sm text-zinc-300;
	}
	.undo-btn {
		@apply ml-3 flex min-h-[2.75rem] min-w-[3rem] items-center justify-center rounded px-3 text-xs text-zinc-500 hover:bg-zinc-800 hover:text-white active:bg-zinc-700;
	}
	.group-heading {
		@apply text-xs font-semibold uppercase tracking-wider text-zinc-500;
	}
</style>

{#if sets.length > 0}
	<section aria-label={labels.previousSetsRegion} class="flex flex-col gap-3">
		<h2 class="text-xs font-medium uppercase tracking-wider text-zinc-500">{labels.previousSetsHeading}</h2>
		{#each grouped as group (group.exerciseId)}
			<div class="flex flex-col gap-1">
				<h3 class="group-heading px-1">{getExerciseName(group.exerciseId)}</h3>
				<ol class="flex flex-col gap-1">
					{#each group.items as set, i (set.id)}
						<li class="set-row">
							<span>{labels.formatSetLine(i + 1, set.reps, set.weight, set.unit)}</span>
							<button
								onclick={() => void onUndo(set.id)}
								aria-label={labels.undoAriaLabel(i + 1)}
								class="undo-btn"
							>
								{labels.undoLabel}
							</button>
						</li>
					{/each}
				</ol>
			</div>
		{/each}
	</section>
{/if}
