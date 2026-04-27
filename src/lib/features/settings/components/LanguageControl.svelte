<script lang="ts">
	import type { Language, LanguagePreference } from '$lib/shared/types/settings.js';

	let {
		preference,
		resolvedLanguage,
		labels,
		onChange
	}: {
		preference: LanguagePreference;
		resolvedLanguage: Language;
		labels: {
			heading: string;
			matchSystem: string;
			english: string;
			spanish: string;
		};
		onChange: (next: LanguagePreference) => void;
	} = $props();

	const resolvedLabel = $derived(
		resolvedLanguage === 'es' ? labels.spanish : labels.english
	);
</script>

<style>
	@reference "tailwindcss";
	.option {
		@apply flex min-h-[3rem] cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-base text-zinc-200 hover:bg-zinc-800;
	}
	.option input[type='radio'] {
		@apply h-5 w-5 accent-blue-500;
	}
	.heading {
		@apply mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500;
	}
</style>

<fieldset>
	<legend class="heading">{labels.heading}</legend>
	<div class="flex flex-col gap-1" role="radiogroup">
		<label class="option">
			<input
				type="radio"
				name="language-preference"
				value="system"
				checked={preference === 'system'}
				onchange={() => onChange('system')}
			/>
			<span>{labels.matchSystem} ({resolvedLabel})</span>
		</label>
		<label class="option">
			<input
				type="radio"
				name="language-preference"
				value="en"
				checked={preference === 'en'}
				onchange={() => onChange('en')}
			/>
			<span>{labels.english}</span>
		</label>
		<label class="option">
			<input
				type="radio"
				name="language-preference"
				value="es"
				checked={preference === 'es'}
				onchange={() => onChange('es')}
			/>
			<span>{labels.spanish}</span>
		</label>
	</div>
</fieldset>
