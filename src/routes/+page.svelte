<script lang="ts">
	import { counterStore } from '$lib/features/counter/counterStore.svelte.js';
	import { exerciseStore } from '$lib/features/exercises/exerciseStore.svelte.js';
	import { settingsStore } from '$lib/features/settings/settingsStore.svelte.js';
	import { i18nStore } from '$lib/features/i18n/i18nStore.svelte.js';
	import { getIncompleteWorkout } from '$lib/features/counter/counter.service.js';
	import RepCounter from '$lib/features/counter/components/RepCounter.svelte';
	import WeightInput from '$lib/features/counter/components/WeightInput.svelte';
	import SetList from '$lib/features/counter/components/SetList.svelte';
	import ExercisePicker from '$lib/features/exercises/components/ExercisePicker.svelte';
	import { DEFAULT_EXERCISES } from '$lib/features/exercises/defaultExercises.js';
	import type { TranslationKey } from '$lib/features/i18n/types.js';
	import type { Workout, WeightUnit } from '$lib/shared/types/workout.js';
	import type { MuscleGroup, Exercise } from '$lib/shared/types/exercise.js';
	import { createKeyboardHandler } from '$lib/features/counter/keyboardShortcuts.js';
	import { focusTrap } from '$lib/shared/utils/focusTrap.js';

	let showPicker = $state(false);
	let saveError = $state<string | null>(null);
	let showDiscardDialog = $state(false);
	let resumeWorkout = $state<Workout | null>(null);
	let savedFlash = $state(false);

	$effect(() => {
		getIncompleteWorkout()
			.then((w) => {
				if (w && !counterStore.workout) {
					resumeWorkout = w;
				}
			})
			.catch(() => {});
	});

	$effect(() => {
		if (!counterStore.workout) return;

		const handleKeydown = createKeyboardHandler({
			increment: () => counterStore.increment(),
			decrement: () => counterStore.decrement(),
			saveSet: handleSaveSet,
			isPickerOpen: () => showPicker,
			isDialogOpen: () => showDiscardDialog
		});

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});

	async function handleSaveSet() {
		const result = await counterStore.saveSet();
		if (!result.success) {
			saveError = result.error ?? i18nStore.t('validation.addRepsFirst');
			setTimeout(() => {
				saveError = null;
			}, 2000);
		} else {
			savedFlash = true;
			setTimeout(() => {
				savedFlash = false;
			}, 500);
			if (counterStore.currentExercise) {
				settingsStore.setLastExerciseId(counterStore.currentExercise.id);
			}
		}
	}

	async function handleFinishWorkout() {
		const result = await counterStore.finishWorkout();
		if (!result.success) {
			showDiscardDialog = true;
		}
	}

	function handleSelectExercise(exercise: Exercise) {
		counterStore.setExercise(exercise);
		exerciseStore.setSearchQuery('');
		showPicker = false;
	}

	function handlePickerCancel() {
		exerciseStore.setSearchQuery('');
		showPicker = false;
	}

	const muscleGroupLabels = $derived<Record<MuscleGroup, string>>({
		chest: i18nStore.t('muscleGroup.chest'),
		back: i18nStore.t('muscleGroup.back'),
		shoulders: i18nStore.t('muscleGroup.shoulders'),
		traps: i18nStore.t('muscleGroup.traps'),
		biceps: i18nStore.t('muscleGroup.biceps'),
		triceps: i18nStore.t('muscleGroup.triceps'),
		forearms: i18nStore.t('muscleGroup.forearms'),
		legs: i18nStore.t('muscleGroup.legs'),
		calves: i18nStore.t('muscleGroup.calves'),
		core: i18nStore.t('muscleGroup.core'),
		fullBody: i18nStore.t('muscleGroup.fullBody')
	});

	const exerciseNames = $derived<Record<string, string>>(
		Object.fromEntries(
			DEFAULT_EXERCISES.map((e) => [e.id, i18nStore.t(`exercise.${e.id}` as TranslationKey)])
		)
	);

	function exerciseDisplayName(exercise: Exercise | null): string {
		if (!exercise) return i18nStore.t('counter.selectExercise');
		return exercise.isCustom ? exercise.name : (exerciseNames[exercise.id] ?? exercise.name);
	}

	const repCounterLabels = $derived({
		reps: i18nStore.t('counter.repsLabel'),
		setNumber: i18nStore.t('counter.setNumber', { n: counterStore.setNumber }),
		tapToCount: i18nStore.t('counter.tapToCount'),
		increment: i18nStore.t('counter.increment'),
		decrement: i18nStore.t('counter.decrement'),
		repsAriaLive: (n: number) => `${n} ${i18nStore.t('counter.repsLabel').toLowerCase()}`
	});

	const weightInputLabels = $derived({
		heading: i18nStore.t('counter.weightLabel'),
		weightAriaLabel: i18nStore.t('counter.weightLabel'),
		unitToggleAriaLabel: (unit: WeightUnit) =>
			`${i18nStore.t('counter.unitToggle')}: ${unit}`,
		decreaseAriaLabel: (delta: number) => `${i18nStore.t('counter.weightDecrease')} ${delta}`,
		increaseAriaLabel: (delta: number) => `${i18nStore.t('counter.weightIncrease')} ${delta}`
	});

	const setListLabels = $derived({
		previousSetsHeading: i18nStore.t('counter.previousSets'),
		previousSetsRegion: i18nStore.t('counter.previousSets'),
		unknownExercise: i18nStore.t('counter.unknownExercise'),
		exerciseNames,
		formatSetLine: (n: number, reps: number, weight: number | null, unit: WeightUnit): string =>
			weight === null
				? i18nStore.t('history.setBodyweight', { n, reps })
				: i18nStore.t('history.setSummary', { n, reps, weight, unit }),
		undoAriaLabel: (n: number) => `${i18nStore.t('counter.undo')} ${i18nStore.t('counter.setNumber', { n })}`,
		undoLabel: i18nStore.t('counter.undo')
	});

	const pickerLabels = $derived({
		dialogLabel: i18nStore.t('counter.selectExercise'),
		searchPlaceholder: i18nStore.t('exercises.search'),
		searchAriaLabel: i18nStore.t('exercises.search'),
		cancelLabel: i18nStore.t('exercises.cancel'),
		muscleGroups: muscleGroupLabels,
		exerciseNames,
		customMarker: '(' + i18nStore.t('muscleGroup.custom').toLowerCase() + ')'
	});
</script>

<!-- Resume prompt -->
{#if resumeWorkout && !counterStore.workout}
	<div
		role="alertdialog"
		aria-label={i18nStore.t('counter.resumePrompt')}
		aria-modal="true"
		use:focusTrap
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
	>
		<div class="w-full max-w-sm rounded-2xl bg-zinc-900 p-6 text-center">
			<p class="mb-2 font-semibold text-white">{i18nStore.t('counter.resumePrompt')}</p>
			<p class="mb-6 text-sm text-zinc-400">
				{i18nStore.t('counter.resumeSavedSets', { n: resumeWorkout.sets.length })}
			</p>
			<div class="flex gap-3">
				<button
					onclick={() => {
						counterStore.discardWorkout();
						resumeWorkout = null;
					}}
					class="flex-1 rounded-xl border border-zinc-700 py-3 text-sm text-zinc-300 active:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
				>
					{i18nStore.t('counter.startFresh')}
				</button>
				<button
					onclick={() => {
						if (resumeWorkout) {
							counterStore.resumeWorkout({
								id: resumeWorkout.id,
								startedAt: resumeWorkout.date,
								sets: resumeWorkout.sets
							});
						}
						resumeWorkout = null;
					}}
					class="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white active:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
				>
					{i18nStore.t('counter.resume')}
				</button>
			</div>
		</div>
	</div>
{:else if !counterStore.workout}
	<!-- No active workout state -->
	<div class="flex h-full flex-col items-center justify-center gap-4 p-8">
		<p class="text-zinc-500">{i18nStore.t('counter.readyToTrain')}</p>
		<button
			onclick={() => counterStore.startWorkout()}
			class="w-full max-w-xs rounded-2xl bg-blue-600 py-4 text-lg font-semibold text-white active:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
		>
			{i18nStore.t('counter.startWorkout')}
		</button>
	</div>
{:else}
	<!-- Active workout -->
	<div class="flex flex-col gap-4 p-4">
		<!-- Exercise selector -->
		<button
			onclick={() => (showPicker = true)}
			aria-label={i18nStore.t('counter.selectExercise')}
			aria-haspopup="dialog"
			class="flex h-14 w-full items-center justify-between rounded-xl bg-zinc-900 px-4 text-left active:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
		>
			<span class="truncate font-medium text-white">
				{exerciseDisplayName(counterStore.currentExercise)}
			</span>
			<span aria-hidden="true" class="ml-2 text-zinc-500">▼</span>
		</button>

		<!-- Weight input -->
		<WeightInput
			weight={counterStore.weight}
			unit={counterStore.weightUnit}
			onWeightChange={(w) => counterStore.setWeight(w)}
			onUnitChange={(u) => counterStore.setUnit(u)}
			onAdjust={(d) => counterStore.adjustWeight(d)}
			labels={weightInputLabels}
		/>

		<!-- Rep counter (main interaction) -->
		<RepCounter
			repCount={counterStore.repCount}
			onIncrement={() => counterStore.increment()}
			onDecrement={() => counterStore.decrement()}
			labels={repCounterLabels}
		/>

		<!-- Inline error message -->
		{#if saveError}
			<p role="alert" class="text-center text-sm text-red-400">{saveError}</p>
		{/if}

		<!-- Save set button — flashes green for 500ms on success -->
		<button
			onclick={handleSaveSet}
			class="w-full rounded-2xl py-4 text-lg font-semibold text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 {savedFlash
				? 'bg-green-600'
				: 'bg-blue-600 active:bg-blue-700'}"
		>
			{savedFlash ? i18nStore.t('counter.saveSetFlash') : i18nStore.t('counter.saveSet')}
		</button>

		<!-- Previous sets list -->
		<SetList
			sets={counterStore.sets}
			exercises={exerciseStore.allExercises}
			onUndo={async (setId) => {
				const result = await counterStore.removeSet(setId);
				if (!result.success) {
					saveError = result.error ?? i18nStore.t('counter.undoFailed');
					setTimeout(() => {
						saveError = null;
					}, 2000);
				}
			}}
			labels={setListLabels}
		/>

		<!-- Finish workout button -->
		<button
			onclick={handleFinishWorkout}
			class="w-full rounded-2xl border border-zinc-700 py-3 text-sm font-medium text-zinc-400 active:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
		>
			{i18nStore.t('counter.finishWorkout')}
		</button>
	</div>

	<!-- Discard confirmation dialog -->
	{#if showDiscardDialog}
		<div
			role="dialog"
			aria-label={i18nStore.t('confirm.discardWorkout')}
			aria-modal="true"
			use:focusTrap={{
				onEscape: () => {
					showDiscardDialog = false;
				}
			}}
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
		>
			<div class="w-full max-w-sm rounded-2xl bg-zinc-900 p-6 text-center">
				<p class="mb-6 text-zinc-300">{i18nStore.t('confirm.discardWorkout')}</p>
				<div class="flex gap-3">
					<button
						onclick={() => (showDiscardDialog = false)}
						class="flex-1 rounded-xl border border-zinc-700 py-3 text-sm text-zinc-300 active:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
					>
						{i18nStore.t('counter.keepGoing')}
					</button>
					<button
						onclick={async () => {
							await counterStore.discardWorkout();
							showDiscardDialog = false;
						}}
						class="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white active:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
					>
						{i18nStore.t('counter.discard')}
					</button>
				</div>
			</div>
		</div>
	{/if}
{/if}

<!-- Exercise picker overlay -->
{#if showPicker}
	<ExercisePicker
		exercises={exerciseStore.exercises}
		searchQuery={exerciseStore.searchQuery}
		onSelect={handleSelectExercise}
		onSearch={(q) => exerciseStore.setSearchQuery(q)}
		onCancel={handlePickerCancel}
		labels={pickerLabels}
	/>
{/if}
