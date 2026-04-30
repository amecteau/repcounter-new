<script lang="ts">
	import { goto } from '$app/navigation';
	import { settingsStore } from '$lib/features/settings/settingsStore.svelte.js';
	import { historyStore } from '$lib/features/history/historyStore.svelte.js';
	import { i18nStore } from '$lib/features/i18n/i18nStore.svelte.js';
	import LanguageControl from '$lib/features/settings/components/LanguageControl.svelte';
	import ClearHistoryControl from '$lib/features/settings/components/ClearHistoryControl.svelte';
	import type { LanguagePreference } from '$lib/shared/types/settings.js';

	function handleLanguageChange(next: LanguagePreference) {
		settingsStore.setLanguage(next);
	}

	function handleBack() {
		history.length > 1 ? history.back() : goto('/');
	}

	let clearMessage = $state<string | null>(null);
	let clearMessageTimer: ReturnType<typeof setTimeout> | null = null;

	async function handleClearHistory() {
		const result = await historyStore.clearAll();
		if (clearMessageTimer) clearTimeout(clearMessageTimer);
		if (result.success) {
			clearMessage = result.data === 0
				? i18nStore.t('settings.clearHistoryNone')
				: i18nStore.t('settings.clearHistoryDeleted', { n: result.data });
		} else {
			clearMessage = result.error ?? i18nStore.t('settings.clearHistoryNone');
		}
		clearMessageTimer = setTimeout(() => {
			clearMessage = null;
		}, 3000);
	}
</script>

<div class="flex flex-col gap-6 p-4">
	<header class="flex items-center gap-3">
		<button
			type="button"
			onclick={handleBack}
			aria-label={i18nStore.t('settings.back')}
			class="flex h-10 min-w-10 items-center justify-center rounded text-zinc-400 hover:text-white"
		>
			←
		</button>
		<h1 class="text-lg font-semibold text-white">{i18nStore.t('settings.title')}</h1>
	</header>

	<section>
		<LanguageControl
			preference={settingsStore.language}
			resolvedLanguage={i18nStore.language}
			labels={{
				heading: i18nStore.t('settings.language.heading'),
				matchSystem: i18nStore.t('settings.language.matchSystem'),
				english: i18nStore.t('settings.language.english'),
				spanish: i18nStore.t('settings.language.spanish')
			}}
			onChange={handleLanguageChange}
		/>
	</section>

	<section>
		<ClearHistoryControl
			labels={{
				sectionHeading: i18nStore.t('settings.clearDataSection'),
				buttonLabel: i18nStore.t('settings.clearHistoryButton'),
				confirmTitle: i18nStore.t('settings.clearHistoryConfirmTitle'),
				confirmLabel: i18nStore.t('confirm.confirm'),
				cancelLabel: i18nStore.t('confirm.cancel')
			}}
			onClear={handleClearHistory}
		/>
		{#if clearMessage}
			<p role="status" class="mt-2 text-sm text-zinc-400">{clearMessage}</p>
		{/if}
	</section>
</div>
