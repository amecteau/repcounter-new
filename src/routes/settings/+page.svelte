<script lang="ts">
	import { goto } from '$app/navigation';
	import { settingsStore } from '$lib/features/settings/settingsStore.svelte.js';
	import { i18nStore } from '$lib/features/i18n/i18nStore.svelte.js';
	import LanguageControl from '$lib/features/settings/components/LanguageControl.svelte';
	import type { LanguagePreference } from '$lib/shared/types/settings.js';

	function handleLanguageChange(next: LanguagePreference) {
		settingsStore.setLanguage(next);
	}

	function handleBack() {
		history.length > 1 ? history.back() : goto('/');
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
</div>
