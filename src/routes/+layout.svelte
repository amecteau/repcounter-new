<script lang="ts">
  import { page } from "$app/state";
  import { fade } from "svelte/transition";
  import "$lib/app.css";
  import BottomNav from "$lib/shared/components/BottomNav.svelte";
  import FontScaleControl from "$lib/features/settings/components/FontScaleControl.svelte";
  import { settingsStore } from "$lib/features/settings/settingsStore.svelte.js";
  import { exerciseStore } from "$lib/features/exercises/exerciseStore.svelte.js";
  import { i18nStore } from "$lib/features/i18n/i18nStore.svelte.js";
  import favicon from "$lib/assets/favicon.svg";

  // Respect prefers-reduced-motion — skip transition if user has opted out
  const fadeDuration =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : 120;

  let { children } = $props();

  // Auto-hide nav on counter screen only
  let navVisible = $state(true);
  let lastScrollY = $state(0);

  function handleScroll(e: Event) {
    if (page.url.pathname !== '/') return;
    const el = e.currentTarget as HTMLElement;
    const currentY = Math.max(0, el.scrollTop);
    const atTop = currentY <= 0;
    const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 1;
    const delta = currentY - lastScrollY;

    if (atTop || atBottom) {
      navVisible = true;
    } else if (Math.abs(delta) >= 4) {
      navVisible = delta < 0; // scroll up → show, scroll down → hide
    }
    lastScrollY = currentY;
  }

  // Reset nav visibility on every route change
  $effect(() => {
    // Reading page.url.pathname registers it as a dependency
    void page.url.pathname;
    navVisible = true;
    lastScrollY = 0;
  });

  // Load persisted settings and custom exercises on startup
  $effect(() => {
    settingsStore
      .load()
      .then(() => i18nStore.setPreference(settingsStore.language))
      .catch(() => {
        // First launch or backend unavailable — defaults are fine
      });
    exerciseStore.loadCustomExercises().catch(() => {});
  });

  // Persist settings whenever font scale, weight unit, exercise, or language changes
  $effect(() => {
    const { fontScale, weightUnit, lastExerciseId, language } = settingsStore;
    // Accessing reactive values registers them as dependencies
    void fontScale;
    void weightUnit;
    void lastExerciseId;
    void language;
    settingsStore.persist().catch(() => {});
  });

  // Keep i18nStore in sync when the persisted language preference changes
  $effect(() => {
    i18nStore.setPreference(settingsStore.language);
  });

  // Reflect the active language on <html lang> for accessibility
  $effect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = i18nStore.language;
    }
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="flex h-screen flex-col overflow-hidden bg-[#0a0a0a] text-white">
  <!-- Top bar -->
  <header
    class="flex shrink-0 items-center justify-between border-b border-zinc-800 px-4 py-2"
    style="padding-top: max(0.5rem, env(safe-area-inset-top))"
  >
    <span class="text-sm font-medium text-zinc-400">SetForge</span>
    <div class="flex items-center gap-1">
      <FontScaleControl
        fontScale={settingsStore.fontScale}
        onDecrease={() => settingsStore.decrease()}
        onIncrease={() => settingsStore.increase()}
        labels={{
          decrease: i18nStore.t("topBar.fontScale.decrease"),
          increase: i18nStore.t("topBar.fontScale.increase")
        }}
      />
      <a
        href="/settings"
        aria-label={i18nStore.t("topBar.settings")}
        class="flex h-11 w-11 items-center justify-center rounded text-lg text-zinc-400 hover:text-white"
      >
        ⚙
      </a>
    </div>
  </header>

  <!-- Scrollable content area — keyed by route so fade runs on navigation -->
  <main class="flex-1 overflow-y-auto" onscroll={handleScroll}>
    {#key page.url.pathname}
      <div in:fade={{ duration: fadeDuration }} class="h-full">
        {@render children()}
      </div>
    {/key}
  </main>

  <!-- Bottom navigation — max-height collapses layout space when hidden -->
  <div
    class="overflow-hidden transition-[max-height] duration-200 ease-in-out motion-reduce:transition-none"
    style="max-height: {navVisible ? '6rem' : '0'}"
  >
    <div style="padding-bottom: env(safe-area-inset-bottom)">
      <BottomNav
        currentPath={page.url.pathname}
        labels={{
          counter: i18nStore.t("nav.counter"),
          history: i18nStore.t("nav.history"),
          exercises: i18nStore.t("nav.exercises"),
        }}
        navAriaLabel={i18nStore.t("nav.ariaLabel")}
      />
    </div>
  </div>
</div>
