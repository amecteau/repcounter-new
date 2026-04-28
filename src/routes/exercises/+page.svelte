<script lang="ts">
  import { exerciseStore } from "$lib/features/exercises/exerciseStore.svelte.js";
  import { counterStore } from "$lib/features/counter/counterStore.svelte.js";
  import { i18nStore } from "$lib/features/i18n/i18nStore.svelte.js";
  import ExerciseList from "$lib/features/exercises/components/ExerciseList.svelte";
  import AddExerciseForm from "$lib/features/exercises/components/AddExerciseForm.svelte";
  import { goto } from "$app/navigation";
  import type { Exercise, MuscleGroup } from "$lib/shared/types/exercise.js";
  import { DEFAULT_EXERCISES } from "$lib/features/exercises/defaultExercises.js";
  import type { TranslationKey } from "$lib/features/i18n/types.js";

  let showAddForm = $state(false);
  let nameError = $state<string | null>(null);
  let deleteError = $state<string | null>(null);

  $effect(() => {
    exerciseStore.loadCustomExercises();
  });

  const muscleGroupLabels = $derived<Record<MuscleGroup, string>>({
    chest: i18nStore.t("muscleGroup.chest"),
    back: i18nStore.t("muscleGroup.back"),
    shoulders: i18nStore.t("muscleGroup.shoulders"),
    traps: i18nStore.t("muscleGroup.traps"),
    biceps: i18nStore.t("muscleGroup.biceps"),
    triceps: i18nStore.t("muscleGroup.triceps"),
    forearms: i18nStore.t("muscleGroup.forearms"),
    legs: i18nStore.t("muscleGroup.legs"),
    calves: i18nStore.t("muscleGroup.calves"),
    core: i18nStore.t("muscleGroup.core"),
    fullBody: i18nStore.t("muscleGroup.fullBody"),
  });

  const exerciseNames = $derived<Record<string, string>>(
    Object.fromEntries(
      DEFAULT_EXERCISES.map((e) => [
        e.id,
        i18nStore.t(`exercise.${e.id}` as TranslationKey),
      ]),
    ),
  );

  const listLabels = $derived({
    muscleGroups: muscleGroupLabels,
    exerciseNames,
    customSection: i18nStore.t("muscleGroup.custom"),
    customMarker: "(" + i18nStore.t("muscleGroup.custom").toLowerCase() + ")",
    deleteActionLabel: (name: string) =>
      `${i18nStore.t("exercises.delete")} ${name}`,
    confirmMessage: (name: string) =>
      i18nStore.t("confirm.deleteExercise", { name }),
    confirmLabel: i18nStore.t("exercises.delete"),
    cancelLabel: i18nStore.t("exercises.cancel"),
  });

  const formLabels = $derived({
    nameLabel: i18nStore.t("exercises.exerciseName"),
    namePlaceholder: i18nStore.t("exercises.namePlaceholder"),
    muscleGroupLabel: i18nStore.t("exercises.muscleGroup"),
    cancel: i18nStore.t("exercises.cancel"),
    save: i18nStore.t("exercises.save"),
    nameRequired: i18nStore.t("validation.exerciseNameRequired"),
    nameTooLong: i18nStore.t("validation.exerciseNameTooLong"),
    muscleGroups: muscleGroupLabels,
  });

  async function handleSave(name: string, muscleGroup: MuscleGroup) {
    const exists = exerciseStore.allExercises.some(
      (e) => e.name.toLowerCase() === name.toLowerCase(),
    );
    if (exists) {
      nameError = i18nStore.t("validation.exerciseNameDuplicate");
      return;
    }
    nameError = null;
    await exerciseStore.addCustom({
      id: crypto.randomUUID(),
      name,
      muscleGroup,
      isCustom: true,
    });
    showAddForm = false;
  }

  async function handleDeleteCustom(id: string): Promise<void> {
    const result = await exerciseStore.removeCustom(id);
    if (!result.success) {
      deleteError = result.error ?? i18nStore.t("validation.exerciseHasSets");
      setTimeout(() => {
        deleteError = null;
      }, 3000);
    }
  }

  function handleSelect(exercise: Exercise) {
    if (counterStore.workout) {
      counterStore.setExercise(exercise);
    }
    goto("/");
  }
</script>

<div class="flex flex-col gap-4 p-4">
  <!-- Search bar -->
  <input
    type="search"
    placeholder={i18nStore.t("exercises.search")}
    value={exerciseStore.searchQuery}
    oninput={(e) =>
      exerciseStore.setSearchQuery((e.target as HTMLInputElement).value)}
    aria-label={i18nStore.t("exercises.search")}
    class="h-11 w-full rounded-lg bg-zinc-800 px-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />

  <!-- Grouped exercise list -->
  <ExerciseList
    exercises={exerciseStore.exercises}
    onSelect={handleSelect}
    onDeleteCustom={handleDeleteCustom}
    labels={listLabels}
  />

  {#if deleteError}
    <p role="alert" class="text-center text-sm text-red-400">{deleteError}</p>
  {/if}

  <!-- Add custom exercise -->
  {#if showAddForm}
    <AddExerciseForm
      onSave={handleSave}
      onCancel={() => {
        showAddForm = false;
        nameError = null;
      }}
      externalError={nameError}
      labels={formLabels}
    />
  {:else}
    <button
      onclick={() => (showAddForm = true)}
      class="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 text-sm text-zinc-400 active:bg-zinc-800"
    >
      {i18nStore.t("exercises.addCustom")}
    </button>
  {/if}
</div>
