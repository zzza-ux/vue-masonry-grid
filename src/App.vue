<template>
  <main class="page-shell">
    <section class="hero">
      <p class="eyebrow">Component Demo</p>
      <div class="hero-row">
        <div>
          <h1>MasonryGrid playground</h1>
          <p class="hero-copy">
            A small component site for exploring layout behavior, virtual
            rendering, and the public API shape of the new MasonryGrid.
          </p>
        </div>
        <button class="primary-btn" @click="shuffleCards">Shuffle Cards</button>
      </div>
      <div class="hero-stats">
        <div class="hero-stat">
          <strong>{{ cards.length }}</strong>
          <span>demo items</span>
        </div>
        <div class="hero-stat">
          <strong>{{ columns }}</strong>
          <span>columns</span>
        </div>
        <div class="hero-stat">
          <strong>{{ virtual ? "on" : "off" }}</strong>
          <span>virtual mode</span>
        </div>
      </div>
    </section>

    <section class="control-panel">
      <label>
        <span>Columns</span>
        <input v-model="columns" type="range" min="2" max="5" />
        <strong>{{ columns }}</strong>
      </label>
      <label>
        <span>Gap</span>
        <input v-model="gap" type="range" min="8" max="24" />
        <strong>{{ gap }}px</strong>
      </label>
      <label class="toggle">
        <input v-model="virtual" type="checkbox" />
        <span>Virtual rendering</span>
      </label>
      <label class="toggle">
        <input v-model="windowScroll" type="checkbox" />
        <span>Use window scroll</span>
      </label>
      <button class="ghost-btn" @click="scrollToBanner">
        Scroll To Banner
      </button>
    </section>

    <section class="content-grid">
      <div class="demo-column">
        <div class="section-heading">
          <div>
            <p class="section-kicker">Live Preview</p>
            <h2>Interactive Example</h2>
          </div>
          <p class="section-copy">
            Toggle between parent-container and window scrolling to verify the
            component behavior in both integration modes.
          </p>
        </div>

        <section
          :class="['demo-frame', { 'demo-frame--window': windowScroll }]"
        >
          <div v-if="!windowScroll" class="inner-scroll">
            <MasonryGrid
              ref="gridRef"
              :data="cards"
              :columns="columns"
              :gap="gap"
              :row-gap="gap"
              item-key="id"
              :extra-height="68"
              :virtual="virtual"
              :scroll-target="windowScroll ? 'window' : 'parent'"
              full-row="fullRow"
            >
              <template #item="{ item, index }">
                <article
                  :class="['demo-card', { 'demo-card--banner': item.fullRow }]"
                  :style="item.cardStyle"
                >
                  <div class="demo-card__media" :style="item.mediaStyle">
                    <span class="demo-card__badge">#{{ index + 1 }}</span>
                  </div>
                  <div class="demo-card__body">
                    <h3>{{ item.title }}</h3>
                    <p>{{ item.description }}</p>
                  </div>
                </article>
              </template>
            </MasonryGrid>
          </div>

          <MasonryGrid
            v-else
            ref="gridRef"
            :data="cards"
            :columns="columns"
            :gap="gap"
            :row-gap="gap"
            item-key="id"
            :extra-height="68"
            :virtual="virtual"
            :scroll-target="windowScroll ? 'window' : 'parent'"
            full-row="fullRow"
          >
            <template #item="{ item, index }">
              <article
                :class="['demo-card', { 'demo-card--banner': item.fullRow }]"
                :style="item.cardStyle"
              >
                <div class="demo-card__media" :style="item.mediaStyle">
                  <span class="demo-card__badge">#{{ index + 1 }}</span>
                </div>
                <div class="demo-card__body">
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.description }}</p>
                </div>
              </article>
            </template>
          </MasonryGrid>
        </section>
      </div>

      <aside class="docs-column">
        <section class="docs-card">
          <div class="section-heading section-heading--compact">
            <div>
              <p class="section-kicker">Usage</p>
              <h2>Starter Snippet</h2>
            </div>
          </div>
          <pre class="code-block"><code>{{ usageExample }}</code></pre>
        </section>

        <section class="docs-card">
          <div class="section-heading section-heading--compact">
            <div>
              <p class="section-kicker">API</p>
              <h2>Important Props</h2>
            </div>
          </div>
          <div class="api-list">
            <article v-for="item in apiItems" :key="item.name" class="api-item">
              <div class="api-item__head">
                <strong>{{ item.name }}</strong>
                <code>{{ item.type }}</code>
              </div>
              <p>{{ item.desc }}</p>
            </article>
          </div>
        </section>

        <section class="docs-card">
          <div class="section-heading section-heading--compact">
            <div>
              <p class="section-kicker">Expose</p>
              <h2>Methods</h2>
            </div>
          </div>
          <ul class="simple-list">
            <li>
              <code>reflow()</code> reruns container measurement and layout.
            </li>
            <li>
              <code>reset()</code> clears the cached layout and recalculates.
            </li>
            <li>
              <code>scrollToIndex(index, align)</code> jumps to a target item.
            </li>
          </ul>
        </section>
      </aside>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import MasonryGrid from "./components/MasonryGrid.vue";

type DemoCard = {
  id: string;
  title: string;
  description: string;
  resolution: string;
  fullRow?: boolean;
  cardStyle: Record<string, string>;
  mediaStyle: Record<string, string>;
};

type MasonryGridExpose = {
  reflow: () => Promise<void>;
  scrollToIndex: (index: number, align?: "start" | "center" | "end") => void;
};

type ApiItem = {
  name: string;
  type: string;
  desc: string;
};

const palette = [
  ["#ffb36b", "#ff7a59"],
  ["#5ec2b7", "#2f7b8d"],
  ["#8ca4ff", "#5564d8"],
  ["#ffd76a", "#d77b34"],
  ["#ff95b2", "#a5447d"],
];
const ratioPool = ["1/1", "3/4", "4/5", "16/9", "5/7"];

const columns = ref(3);
const gap = ref(16);
const virtual = ref(true);
const windowScroll = ref(false);
const gridRef = ref<MasonryGridExpose>();

const apiItems: ApiItem[] = [
  {
    name: "data",
    type: "any[]",
    desc: "The source list used for layout and slot rendering.",
  },
  {
    name: "columns",
    type: "number",
    desc: "Controls how many columns participate in the masonry layout.",
  },
  {
    name: "gap / rowGap",
    type: "number",
    desc: "Horizontal and vertical spacing between rendered items.",
  },
  {
    name: "aspectRatio",
    type: "string | number",
    desc: "Global ratio fallback. Items can still override it with their own fields.",
  },
  {
    name: "itemKey",
    type: "string | function",
    desc: "Stable key resolver for safer reuse in real list updates.",
  },
  {
    name: "fullRow",
    type: "string | function",
    desc: "Marks banner-like items that should span the whole row.",
  },
  {
    name: "virtual / overscan",
    type: "boolean / number",
    desc: "Enables visible-range rendering and configures the buffer area.",
  },
  {
    name: "scrollTarget",
    type: "'parent' | 'window'",
    desc: "Switches between inner-container scrolling and full-page scrolling.",
  },
];

const usageExample = computed(() => {
  return `<MasonryGrid
  :data="list"
  :columns="${columns.value}"
  :gap="${gap.value}"
  :row-gap="${gap.value}"
  item-key="id"
  :virtual="${virtual.value}"
  scroll-target="${windowScroll.value ? "window" : "parent"}"
  full-row="fullRow"
>
  <template #item="{ item }">
    <Card :item="item" />
  </template>
</MasonryGrid>`;
});

const createCard = (index: number): DemoCard => {
  const [start, end] = palette[index % palette.length];
  const ratio = ratioPool[index % ratioPool.length];
  const fullRow = index > 0 && index % 9 === 0;

  return {
    id: `card-${index}`,
    title: fullRow ? `Banner Break ${index}` : `Card ${index}`,
    description: fullRow
      ? "This item uses the full-row mode to demonstrate section-like content in the flow."
      : "Mixed aspect ratios simulate real cards with artwork, text and variable content heights.",
    resolution: ratio,
    fullRow,
    cardStyle: {
      background: fullRow ? "#2d241a" : "#fffdf8",
      color: fullRow ? "#fff8ed" : "#2d241a",
    },
    mediaStyle: {
      background: `linear-gradient(135deg, ${start} 0%, ${end} 100%)`,
    },
  };
};

const cards = ref(
  Array.from({ length: 36 }, (_, index) => createCard(index + 1))
);

const shuffleCards = () => {
  cards.value = [...cards.value]
    .map((item) => ({ sort: Math.random(), item }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
};

const scrollToBanner = () => {
  const bannerIndex = cards.value.findIndex((item) => item.fullRow);
  if (bannerIndex >= 0) {
    gridRef.value?.scrollToIndex(bannerIndex, "center");
  }
};

watch(
  () => [columns.value, gap.value, virtual.value, windowScroll.value],
  async () => {
    await nextTick();
    await gridRef.value?.reflow();
  }
);
</script>

<style scoped>
.page-shell {
  max-width: 1320px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.hero {
  padding: 28px 32px;
  border-radius: 28px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.94),
    rgba(255, 248, 232, 0.82)
  );
  box-shadow: 0 18px 60px rgba(95, 69, 31, 0.12);
}

.eyebrow {
  margin: 0 0 10px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 12px;
  color: #9f7a49;
}

.hero-row {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
}

h1,
h2 {
  margin: 0;
}

h1 {
  font-size: clamp(34px, 7vw, 62px);
  line-height: 0.95;
}

h2 {
  font-size: 24px;
}

.hero-copy {
  max-width: 620px;
  margin: 14px 0 0;
  font-size: 16px;
  line-height: 1.65;
  color: #5d4d3a;
}

.hero-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

.hero-stat {
  min-width: 120px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.75);
}

.hero-stat strong {
  display: block;
  font-size: 24px;
}

.hero-stat span,
.section-copy,
.api-item p {
  color: #6d5b45;
}

.control-panel {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px 22px;
  margin-top: 22px;
  padding: 18px 22px;
  border: 1px solid rgba(80, 57, 23, 0.08);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(10px);
}

.control-panel label {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.toggle {
  padding: 10px 14px;
  border-radius: 999px;
  background: #f6eee0;
}

.primary-btn,
.ghost-btn {
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.primary-btn {
  background: #2d241a;
  color: #fff8ed;
  box-shadow: 0 12px 28px rgba(45, 36, 26, 0.18);
}

.ghost-btn {
  background: #fff;
  color: #2d241a;
  border: 1px solid rgba(45, 36, 26, 0.12);
}

.primary-btn:hover,
.ghost-btn:hover {
  transform: translateY(-1px);
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.85fr);
  gap: 24px;
  margin-top: 24px;
  align-items: start;
}

.demo-column,
.docs-column {
  min-width: 0;
}

.docs-column {
  display: grid;
  gap: 18px;
}

.docs-card {
  padding: 22px;
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 14px 44px rgba(95, 69, 31, 0.08);
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.section-heading--compact {
  margin-bottom: 16px;
}

.section-kicker {
  margin: 0 0 6px;
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #9f7a49;
}

.section-copy {
  max-width: 360px;
  margin: 0;
  line-height: 1.55;
}

.demo-frame {
  margin-top: 24px;
}

.inner-scroll {
  height: 72vh;
  overflow: auto;
  padding: 14px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: inset 0 0 0 1px rgba(90, 64, 28, 0.08);
}

.demo-frame--window {
  padding-top: 12px;
}

.demo-card {
  overflow: hidden;
  border-radius: 22px;
  box-shadow: 0 12px 30px rgba(100, 73, 35, 0.12);
}

.demo-card--banner {
  display: grid;
  grid-template-columns: minmax(180px, 30%) 1fr;
}

.demo-card__media {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 140px;
}

.demo-card__badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.22);
  color: white;
  font-size: 12px;
  backdrop-filter: blur(6px);
}

.demo-card__body {
  padding: 18px;
}

.demo-card__body h3 {
  margin: 0 0 8px;
  font-size: 18px;
}

.demo-card__body p {
  margin: 0;
  line-height: 1.55;
  color: inherit;
  opacity: 0.82;
}

.api-list {
  display: grid;
  gap: 12px;
}

.api-item {
  padding: 14px 16px;
  border-radius: 18px;
  background: #fffaf2;
}

.api-item__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.api-item code,
.code-block code,
.simple-list code {
  font-family: "SFMono-Regular", "Menlo", monospace;
}

.api-item p {
  margin: 8px 0 0;
  line-height: 1.55;
}

.code-block {
  overflow: auto;
  margin: 0;
  padding: 16px;
  border-radius: 20px;
  background: #241c14;
  color: #fff8ed;
  line-height: 1.6;
}

.simple-list {
  display: grid;
  gap: 10px;
  padding-left: 20px;
  margin: 0;
  line-height: 1.55;
}

@media (max-width: 980px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .section-heading {
    align-items: start;
    flex-direction: column;
  }
}

@media (max-width: 760px) {
  .page-shell {
    padding: 22px 14px 52px;
  }

  .hero {
    padding: 22px 18px;
  }

  .hero-row {
    align-items: start;
    flex-direction: column;
  }

  .control-panel {
    padding: 16px;
  }

  .demo-card--banner {
    grid-template-columns: 1fr;
  }

  .inner-scroll {
    height: 68vh;
    padding: 10px;
  }

  .docs-card {
    padding: 18px;
  }
}
</style>
