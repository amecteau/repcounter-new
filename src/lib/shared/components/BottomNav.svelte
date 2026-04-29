<script lang="ts">
	import type { Component } from 'svelte';
	import CounterIcon from './icons/CounterIcon.svelte';
	import HistoryIcon from './icons/HistoryIcon.svelte';
	import ExercisesIcon from './icons/ExercisesIcon.svelte';

	let {
		currentPath,
		labels,
		navAriaLabel
	}: {
		currentPath: string;
		labels: { counter: string; history: string; exercises: string };
		navAriaLabel: string;
	} = $props();

	type Tab = { path: string; label: string; Icon: Component };

	const tabs: Tab[] = $derived([
		{ path: '/', label: labels.counter, Icon: CounterIcon },
		{ path: '/history', label: labels.history, Icon: HistoryIcon },
		{ path: '/exercises', label: labels.exercises, Icon: ExercisesIcon }
	]);
</script>

<style>
	@reference "tailwindcss";
	.nav-link {
		@apply flex min-h-[3rem] flex-col items-center justify-center gap-0.5 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400;
	}
	.nav-link.active {
		@apply text-blue-400;
	}
	.nav-link.inactive {
		@apply text-zinc-500 hover:text-zinc-300;
	}
</style>

<nav aria-label={navAriaLabel} class="border-t border-zinc-800 bg-zinc-950">
	<ul class="flex">
		{#each tabs as tab (tab.path)}
			{@const Icon = tab.Icon}
			<li class="flex-1">
				<a
					href={tab.path}
					aria-current={currentPath === tab.path ? 'page' : undefined}
					class="nav-link {currentPath === tab.path ? 'active' : 'inactive'}"
				>
					<span aria-hidden="true"><Icon /></span>
					<span>{tab.label}</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>
