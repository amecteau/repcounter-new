<script lang="ts">
	import type { Workout, WeightUnit } from '$lib/shared/types/workout.js';
	import WorkoutDetail from './WorkoutDetail.svelte';
	import ConfirmDialog from '$lib/shared/components/ConfirmDialog.svelte';
	import SwipeToReveal from '$lib/shared/components/SwipeToReveal.svelte';

	let {
		workout,
		expanded,
		onToggle,
		onDelete,
		labels
	}: {
		workout: Workout;
		expanded: boolean;
		onToggle: () => void;
		onDelete: () => void | Promise<void>;
		labels: {
			dateLabel: string;
			deleteActionLabel: string;
			confirmMessage: string;
			confirmLabel: string;
			cancelLabel: string;
			formatExerciseCount: (n: number) => string;
			formatSetCount: (n: number) => string;
			exerciseSummaryAriaLabel: string;
			exerciseNames: Record<string, string>;
			detailLabels: {
				formatDuration: (n: number) => string;
				formatSetLine: (
					n: number,
					reps: number,
					weight: number | null,
					unit: WeightUnit
				) => string;
				exerciseNames: Record<string, string>;
			};
		};
	} = $props();

	let showConfirm = $state(false);

	// Compute per-exercise set counts, preserving order of first appearance
	const summaries = $derived.by(() => {
		const order: string[] = [];
		const map = new Map<string, number>();
		for (const set of workout.sets) {
			if (!map.has(set.exerciseId)) {
				order.push(set.exerciseId);
				map.set(set.exerciseId, 0);
			}
			map.set(set.exerciseId, (map.get(set.exerciseId) ?? 0) + 1);
		}
		return order.map((id) => ({
			name: labels.exerciseNames[id] ?? id,
			setCount: map.get(id)!
		}));
	});

	const exerciseCount = $derived(summaries.length);
	const setCount = $derived(workout.sets.length);
</script>

<SwipeToReveal actionLabel={labels.deleteActionLabel} onAction={() => (showConfirm = true)}>
	<article class="rounded-xl bg-zinc-900 p-4">
		<button onclick={onToggle} aria-expanded={expanded} class="w-full text-left">
			<div class="flex items-start justify-between gap-2">
				<div class="min-w-0 flex-1">
					<p class="font-semibold text-white">{labels.dateLabel}</p>
					<p class="mt-0.5 text-xs text-zinc-500">
						{labels.formatExerciseCount(exerciseCount)} · {labels.formatSetCount(setCount)}
					</p>
					{#if !expanded}
						<ul class="mt-2 flex flex-col gap-0.5" aria-label={labels.exerciseSummaryAriaLabel}>
							{#each summaries as s (s.name)}
								<li class="text-sm text-zinc-400">{s.name}: {s.setCount}×</li>
							{/each}
						</ul>
					{/if}
				</div>
				<span aria-hidden="true" class="mt-0.5 text-zinc-500">{expanded ? '▲' : '▼'}</span>
			</div>
		</button>

		{#if expanded}
			<WorkoutDetail {workout} labels={labels.detailLabels} />
		{/if}
	</article>
</SwipeToReveal>

{#if showConfirm}
	<ConfirmDialog
		message={labels.confirmMessage}
		confirmLabel={labels.confirmLabel}
		cancelLabel={labels.cancelLabel}
		onConfirm={async () => {
			showConfirm = false;
			await onDelete();
		}}
		onCancel={() => (showConfirm = false)}
	/>
{/if}
