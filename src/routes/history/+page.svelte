<script lang="ts">
	import { historyStore } from '$lib/features/history/historyStore.svelte.js';
	import { exerciseStore } from '$lib/features/exercises/exerciseStore.svelte.js';
	import { i18nStore } from '$lib/features/i18n/i18nStore.svelte.js';
	import { formatWorkoutDate } from '$lib/shared/utils/formatDate.js';
	import WorkoutCard from '$lib/features/history/components/WorkoutCard.svelte';
	import type { TranslationKey } from '$lib/features/i18n/types.js';
	import type { WeightUnit } from '$lib/shared/types/workout.js';

	let deleteError = $state<string | null>(null);

	$effect(() => {
		historyStore.load();
		exerciseStore.loadCustomExercises();
	});

	const exerciseNames = $derived.by(() => {
		const map: Record<string, string> = {};
		for (const e of exerciseStore.allExercises) {
			map[e.id] = e.isCustom
				? e.name
				: i18nStore.t(`exercise.${e.id}` as TranslationKey);
		}
		return map;
	});

	const locale = $derived(i18nStore.language === 'es' ? 'es-ES' : 'en-US');

	function buildDetailLabels(names: Record<string, string>) {
		return {
			formatDuration: (n: number) => i18nStore.t('history.duration', { n }),
			formatSetLine: (n: number, reps: number, weight: number | null, unit: WeightUnit) =>
				weight === null
					? i18nStore.t('history.setBodyweight', { n, reps })
					: i18nStore.t('history.setSummary', { n, reps, weight, unit }),
			exerciseNames: names
		};
	}

	function buildCardLabels(workout: { date: string; sets: { exerciseId: string }[] }, names: Record<string, string>) {
		const dateLabel = formatWorkoutDate(
			workout.date,
			i18nStore.t('history.today'),
			i18nStore.t('history.yesterday'),
			locale
		);
		return {
			dateLabel,
			deleteActionLabel: i18nStore.t('history.delete'),
			confirmMessage: i18nStore.t('confirm.deleteWorkout', { date: dateLabel }),
			confirmLabel: i18nStore.t('history.delete'),
			cancelLabel: i18nStore.t('confirm.cancel'),
			formatExerciseCount: (n: number) =>
				n === 1
					? i18nStore.t('history.exerciseCountSingle')
					: i18nStore.t('history.exerciseCount', { n }),
			formatSetCount: (n: number) =>
				n === 1
					? i18nStore.t('history.setCountSingle')
					: i18nStore.t('history.setCount', { n }),
			exerciseSummaryAriaLabel: i18nStore.t('history.exerciseSummaryAriaLabel'),
			exerciseNames: names,
			detailLabels: buildDetailLabels(names)
		};
	}

	async function handleDelete(id: string): Promise<void> {
		const result = await historyStore.deleteWorkout(id);
		if (!result.success) {
			deleteError = result.error ?? i18nStore.t('history.deleteFailed');
			setTimeout(() => {
				deleteError = null;
			}, 3000);
		}
	}
</script>

{#if historyStore.workouts.length === 0}
	<div class="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
		<p class="text-4xl" aria-hidden="true">🏋️</p>
		<p class="font-medium text-white">{i18nStore.t('history.empty')}</p>
		<p class="text-sm text-zinc-500">{i18nStore.t('history.emptyHint')}</p>
	</div>
{:else}
	<div class="flex flex-col gap-3 p-4">
		{#each historyStore.workouts as workout (workout.id)}
			{@const cardLabels = buildCardLabels(workout, exerciseNames)}
			<WorkoutCard
				{workout}
				expanded={historyStore.expandedId === workout.id}
				onToggle={() => historyStore.toggleExpand(workout.id)}
				onDelete={() => handleDelete(workout.id)}
				labels={cardLabels}
			/>
		{/each}
	</div>

	{#if deleteError}
		<p role="alert" class="px-4 text-center text-sm text-red-400">{deleteError}</p>
	{/if}
{/if}
