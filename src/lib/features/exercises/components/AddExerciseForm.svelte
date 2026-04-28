<script lang="ts">
	import type { MuscleGroup } from '$lib/shared/types/exercise.js';

	let {
		onSave,
		onCancel,
		externalError = null,
		labels
	}: {
		onSave: (name: string, muscleGroup: MuscleGroup) => void;
		onCancel: () => void;
		externalError?: string | null;
		labels: {
			nameLabel: string;
			namePlaceholder: string;
			muscleGroupLabel: string;
			cancel: string;
			save: string;
			nameRequired: string;
			nameTooLong: string;
			muscleGroups: Record<MuscleGroup, string>;
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

	let name = $state('');
	let muscleGroup = $state<MuscleGroup>('chest');
	let internalError = $state<string | null>(null);

	const displayError = $derived(internalError ?? externalError);

	function handleSave() {
		const trimmed = name.trim();
		if (!trimmed) {
			internalError = labels.nameRequired;
			return;
		}
		if (trimmed.length > 50) {
			internalError = labels.nameTooLong;
			return;
		}
		internalError = null;
		onSave(trimmed, muscleGroup);
	}
</script>

<style>
	@reference "tailwindcss";
	.form-input {
		@apply h-11 w-full rounded-lg bg-zinc-900 px-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500;
	}
	.btn-cancel {
		@apply flex-1 rounded-xl border border-zinc-700 py-3 text-sm text-zinc-300;
	}
	.btn-save {
		@apply flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white;
	}
</style>

<div class="rounded-xl bg-zinc-800 p-4">
	<div class="flex flex-col gap-3">
		<div>
			<label for="exercise-name" class="mb-1 block text-xs font-medium text-zinc-400">
				{labels.nameLabel}
			</label>
			<input
				id="exercise-name"
				type="text"
				bind:value={name}
				placeholder={labels.namePlaceholder}
				maxlength={50}
				class="form-input"
			/>
		</div>
		<div>
			<label for="muscle-group" class="mb-1 block text-xs font-medium text-zinc-400">
				{labels.muscleGroupLabel}
			</label>
			<select id="muscle-group" bind:value={muscleGroup} class="form-input">
				{#each MUSCLE_GROUP_ORDER as g (g)}
					<option value={g}>{labels.muscleGroups[g]}</option>
				{/each}
			</select>
		</div>
		{#if displayError}
			<p role="alert" class="text-xs text-red-400">{displayError}</p>
		{/if}
		<div class="flex gap-3">
			<button onclick={onCancel} class="btn-cancel">{labels.cancel}</button>
			<button onclick={handleSave} class="btn-save">{labels.save}</button>
		</div>
	</div>
</div>
