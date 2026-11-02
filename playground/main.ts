import { createApp } from 'vue'
import App from './App.vue'

async function start() {
  if (
    import.meta.env.DEV &&
    new URLSearchParams(window.location.search).get('fixture') === 'interaction'
  ) {
    const { default: Fixture } =
      await import('./fixtures/InteractionFixture.vue')
    createApp(Fixture).mount('#app')
  } else createApp(App).mount('#app')
}
void start()
