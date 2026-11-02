<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import LocalExample from '../docs/examples/LocalExample.vue'
import AsyncExample from '../docs/examples/AsyncExample.vue'
import SlotsExample from '../docs/examples/SlotsExample.vue'
import RtlExample from '../docs/examples/RtlExample.vue'
const examples = [
  {
    key: 'local',
    label: 'Local data',
    component: LocalExample,
    file: 'LocalExample.vue',
  },
  {
    key: 'async',
    label: 'Async provider',
    component: AsyncExample,
    file: 'AsyncExample.vue',
  },
  {
    key: 'slots',
    label: 'Cells & actions',
    component: SlotsExample,
    file: 'SlotsExample.vue',
  },
  {
    key: 'rtl',
    label: 'فارسی / RTL',
    component: RtlExample,
    file: 'RtlExample.vue',
  },
] as const
const active = ref<string>('local')
const current = computed(
  () => examples.find((example) => example.key === active.value) ?? examples[0],
)
const sources = import.meta.glob('../docs/examples/*.{vue,ts}', {
  query: '?raw',
  import: 'default',
  eager: true,
})
const source = computed(() =>
  String(sources[`../docs/examples/${current.value.file}`]),
)
const dataSource = String(sources['../docs/examples/data.ts'])
function readHash() {
  const value = window.location.hash.slice(1)
  active.value = examples.some((example) => example.key === value)
    ? value
    : 'local'
}
function choose(key: string) {
  window.location.hash = key
  active.value = key
}
onMounted(() => {
  readHash()
  window.addEventListener('hashchange', readHash)
})
onBeforeUnmount(() => window.removeEventListener('hashchange', readHash))
</script>
<template>
  <main class="showcase">
    <header class="showcase-header">
      <p class="showcase-kicker">VUE 3 SMART DATATABLE</p>
      <h1>A data table for Vue 3</h1>
      <p>
        Local data, async providers and typed custom cells. No required UI
        framework.
      </p>
      <div class="showcase-links">
        <a href="https://github.com/reydi-dev/vue3-smart-datatable">GitHub</a
        ><a
          href="https://github.com/reydi-dev/vue3-smart-datatable/blob/main/docs/api.md"
          >API reference</a
        ><span>npm: not published</span>
      </div>
    </header>
    <nav class="showcase-nav" aria-label="Examples">
      <button
        v-for="example in examples"
        :key="example.key"
        type="button"
        :aria-pressed="active === example.key"
        @click="choose(example.key)"
      >
        {{ example.label }}
      </button>
    </nav>
    <component :is="current.component" :key="current.key" />
    <details class="showcase-source">
      <summary>View example source</summary>
      <p>
        Import the package stylesheet in your client entry. Examples use
        synthetic records.
      </p>
      <pre><code>{{source}}</code></pre>
      <details>
        <summary>Shared example data (data.ts)</summary>
        <pre><code>{{dataSource}}</code></pre>
      </details>
    </details>
    <footer class="showcase-footer">
      Synthetic data only. Resize to try the mobile layout. npm publication and
      public hosting are pending release approval.
    </footer>
  </main>
</template>
<style>
body {
  margin: 0;
  background: #f5f7f6;
  color: #24312e;
  font-family: system-ui, sans-serif;
}
.showcase {
  max-width: 1320px;
  margin: 40px auto;
  padding: 0 28px;
}
.showcase-kicker {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.13em;
  color: #087c63;
}
.showcase-header h1 {
  font-size: 32px;
  letter-spacing: -0.035em;
  margin: 10px 0;
}
.showcase-header > p,
.showcase section > p,
.showcase-source > p,
.showcase-footer {
  color: #687672;
  font-size: 14px;
  line-height: 1.7;
}
.showcase-links {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
  font-size: 13px;
}
.showcase-links a {
  color: #087c63;
}
.showcase-links span {
  color: #687672;
}
.showcase-nav {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 28px 0;
}
.showcase-nav button {
  padding: 9px 14px;
  border: 1px solid #d5dfda;
  border-radius: 6px;
  font: inherit;
  font-size: 13px;
  background: #fff;
  color: #24312e;
  cursor: pointer;
}
.showcase-nav button[aria-pressed='true'] {
  background: #edf7f2;
  border-color: #087c63;
  color: #087c63;
}
.showcase :where(button, a, summary):focus-visible {
  outline: 2px solid #087c63;
  outline-offset: 3px;
}
.showcase h2 {
  font-size: 21px;
  margin: 0 0 8px;
}
.showcase section > .sdt-control {
  margin-bottom: 12px;
}
.showcase-source {
  margin: 24px 0;
  padding: 16px;
  border: 1px solid #d5dfda;
  border-radius: 8px;
  background: white;
}
.showcase-source summary {
  cursor: pointer;
  font-size: 14px;
}
.showcase-source pre {
  overflow: auto;
  max-height: 440px;
  background: #f5f7f6;
  padding: 16px;
  font-size: 12px;
  line-height: 1.7;
}
.showcase-footer {
  margin: 28px 0;
}
@media (max-width: 600px) {
  .showcase {
    margin: 24px auto;
    padding: 0 12px;
  }
  .showcase-header h1 {
    font-size: 26px;
  }
  .showcase-nav button {
    flex: 1 1 40%;
  }
}
</style>
