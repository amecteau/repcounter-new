<script lang="ts">
	import ConfirmDialog from '$lib/shared/components/ConfirmDialog.svelte';

	let {
		labels,
		onClear
	}: {
		labels: {
			sectionHeading: string;
			buttonLabel: string;
			confirmTitle: string;
			confirmLabel: string;
			cancelLabel: string;
		};
		onClear: () => Promise<void>;
	} = $props();

	let showConfirm = $state(false);
</script>

<style>
	@reference "tailwindcss";
	.section-heading {
		@apply mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500;
	}
	.danger-btn {
		@apply flex min-h-[3rem] w-full items-center rounded-lg bg-zinc-900 px-4 text-left text-base text-red-400 hover:bg-zinc-800 active:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400;
	}
</style>

<div>
	<p class="section-heading">{labels.sectionHeading}</p>
	<button class="danger-btn" onclick={() => (showConfirm = true)}>
		{labels.buttonLabel}
	</button>
</div>

{#if showConfirm}
	<ConfirmDialog
		message={labels.confirmTitle}
		confirmLabel={labels.confirmLabel}
		cancelLabel={labels.cancelLabel}
		onConfirm={async () => {
			showConfirm = false;
			await onClear();
		}}
		onCancel={() => (showConfirm = false)}
	/>
{/if}
