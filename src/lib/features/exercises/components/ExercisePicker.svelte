<script lang="ts">
	import type { Exercise, MuscleGroup } from '$lib/shared/types/exercise.js';
	import { focusTrap } from '$lib/shared/utils/focusTrap.js';

	let {
		exercises,
		searchQuery,
		onSelect,
		onSearch,
		onCancel,
		labels
	}: {
		exercises: Exercise[];
		searchQuery: string;
		onSelect: (exercise: Exercise) => void;
		onSearch: (query: string) => void;
		onCancel: () => void;
		labels: {
			dialogLabel: string;
			searchPlaceholder: string;
			searchAriaLabel: string;
			cancelLabel: string;
			muscleGroups: Record<MuscleGroup, string>;
			exerciseNames: Record<string, string>;
			customMarker: string;
		};
	} = $props();

	const MUSCLE_GROUP_ORDER: MuscleGroup[] = [
		'chest',
		'back',
		'shoulders',
		'traps',
		'biceps',
		'triceps',
		'forearms',
		'legs',
		'calves',
		'core',
		'fullBody'
	];

	function displayName(exercise: Exercise): string {
		return exercise.isCustom ? exercise.name : (labels.exerciseNames[exercise.id] ?? exercise.name);
	}

	const grouped = $derived.by(() => {
		const groups = new Map<MuscleGroup, Exercise[]>(MUSCLE_GROUP_ORDER.map((g) => [g, []]));
		for (const exercise of exercises) {
			groups.get(exercise.muscleGroup)?.push(exercise);
		}
		return groups;
	});
</script>

<div
	role="dialog"
	aria-label={labels.dialogLabel}
	aria-modal="true"
	use:focusTrap={{ onEscape: onCancel }}
	class="fixed inset-0 z-50 flex flex-col bg-zinc-950"
>
	<!-- Search bar -->
	<div class="flex items-center gap-3 border-b border-zinc-800 p-4">
		<input
			type="search"
			placeholder={labels.searchPlaceholder}
			value={searchQuery}
			oninput={(e) => onSearch((e.target as HTMLInputElement).value)}
			aria-label={labels.searchAriaLabel}
			class="search-input"
		/>
		<button onclick={onCancel} aria-label={labels.cancelLabel} class="cancel-btn">
			{labels.cancelLabel}
		</button>
	</div>

	<!-- Exercise list -->
	<div class="flex-1 overflow-y-auto p-4">
		{#each [...grouped.entries()].filter(([, exs]) => exs.length > 0) as [group, groupExercises] (group)}
			<section class="mb-4">
				<h3 class="section-heading mb-1">{labels.muscleGroups[group]}</h3>
				<ul class="flex flex-col gap-1">
					{#each groupExercises as exercise (exercise.id)}
						<li>
							<button onclick={() => onSelect(exercise)} class="exercise-btn">
								{displayName(exercise)}
								{#if exercise.isCustom}
									<span aria-hidden="true" class="custom-icon">✎</span>
									<span class="sr-only">{labels.customMarker}</span>
								{/if}
							</button>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	</div>
</div>

<style>
	@reference "tailwindcss";
	.search-input {
		@apply h-11 flex-1 rounded-lg bg-zinc-800 px-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500;
	}
	.cancel-btn {
		@apply rounded-lg px-4 py-2 text-sm text-zinc-400 hover:text-white;
	}
	.section-heading {
		@apply text-xs font-semibold uppercase tracking-wider text-zinc-500;
	}
	.exercise-btn {
		@apply flex h-12 w-full items-center rounded-lg bg-zinc-900 px-4 text-left text-sm text-white hover:bg-zinc-800 active:bg-zinc-700;
	}
	.custom-icon {
		@apply ml-auto text-zinc-500;
	}
</style>
