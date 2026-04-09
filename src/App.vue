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
        <div class="hero-stat">
          <strong>{{ perfSize }}</strong>
          <span>perf sample</span>
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
              :extra-height="0"
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
                    <span v-if="item.fullRow" class="demo-card__label">{{
                      item.title
                    }}</span>
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
            :extra-height="0"
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
                  <span v-if="item.fullRow" class="demo-card__label">{{
                    item.title
                  }}</span>
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

    <section class="compare-section">
      <div class="section-heading">
        <div>
          <p class="section-kicker">Migration View</p>
          <h2>Legacy Waterfall vs MasonryGrid</h2>
        </div>
        <p class="section-copy">
          Both blocks below render the same subset. The left side keeps the old
          prop language, and the right side shows the more explicit API.
        </p>
      </div>

      <div class="compare-grid">
        <article class="compare-card">
          <header class="compare-card__head">
            <div>
              <h3>LegacyWaterfall</h3>
              <p>
                Old-style props: <code>col</code>, <code>resolution</code>,
                <code>expand</code>.
              </p>
            </div>
            <span class="compare-badge">legacy</span>
          </header>
          <pre
            class="code-block code-block--small"
          ><code>{{ legacyExample }}</code></pre>
          <div class="compare-preview">
            <LegacyWaterfall
              :data="legacyCards"
              :col="2"
              :gap="12"
              :row-gap="12"
              resolution="3/4"
              :expand="0"
            >
              <template #item="{ item }">
                <article
                  :class="[
                    'demo-card demo-card--compact',
                    { 'demo-card--banner': item.widthFill },
                  ]"
                  :style="item.cardStyle"
                >
                  <div class="demo-card__media" :style="item.mediaStyle">
                    <span v-if="item.widthFill" class="demo-card__label">{{
                      item.title
                    }}</span>
                  </div>
                </article>
              </template>
            </LegacyWaterfall>
          </div>
        </article>

        <article class="compare-card">
          <header class="compare-card__head">
            <div>
              <h3>MasonryGrid</h3>
              <p>
                New-style props: <code>columns</code>, <code>aspectRatio</code>,
                <code>extraHeight</code>.
              </p>
            </div>
            <span class="compare-badge compare-badge--new">new</span>
          </header>
          <pre
            class="code-block code-block--small"
          ><code>{{ modernExample }}</code></pre>
          <div class="compare-preview">
            <MasonryGrid
              :data="modernCards"
              :columns="2"
              :gap="12"
              :row-gap="12"
              aspect-ratio="3/4"
              :extra-height="0"
              item-key="id"
              full-row="fullRow"
            >
              <template #item="{ item }">
                <article
                  :class="[
                    'demo-card demo-card--compact',
                    { 'demo-card--banner': item.fullRow },
                  ]"
                  :style="item.cardStyle"
                >
                  <div class="demo-card__media" :style="item.mediaStyle">
                    <span v-if="item.fullRow" class="demo-card__label">{{
                      item.title
                    }}</span>
                  </div>
                </article>
              </template>
            </MasonryGrid>
          </div>
        </article>
      </div>

      <div class="delta-list">
        <article class="delta-item">
          <strong>Key strategy</strong>
          <p>
            Legacy demos tend to rely on <code>item.id</code>; MasonryGrid makes
            that strategy explicit with <code>itemKey</code>.
          </p>
        </article>
        <article class="delta-item">
          <strong>Semantic props</strong>
          <p>
            <code>columns</code>, <code>aspectRatio</code> and
            <code>extraHeight</code> read more like a public API than internal
            layout math.
          </p>
        </article>
        <article class="delta-item">
          <strong>Banner rows</strong>
          <p>
            The old <code>widthFill</code> flag becomes the more descriptive
            <code>fullRow</code> in the new component.
          </p>
        </article>
      </div>
    </section>

    <section class="perf-section">
      <div class="section-heading">
        <div>
          <p class="section-kicker">Performance View</p>
          <h2>Long List Stress Test</h2>
        </div>
        <p class="section-copy">
          Switch sample size to quickly inspect how the grid behaves when the
          list gets much longer.
        </p>
      </div>

      <div class="perf-toolbar">
        <button
          v-for="size in perfSizes"
          :key="size"
          :class="['perf-chip', { 'perf-chip--active': perfSize === size }]"
          @click="perfSize = size"
        >
          {{ size }} items
        </button>
      </div>

      <div class="perf-meta">
        <article class="perf-meta__item">
          <strong>{{ perfSize }}</strong>
          <span>rendered test items</span>
        </article>
        <article class="perf-meta__item">
          <strong>{{ virtual ? "enabled" : "disabled" }}</strong>
          <span>virtual rendering mode</span>
        </article>
        <article class="perf-meta__item">
          <strong>{{ gap }}px</strong>
          <span>shared spacing configuration</span>
        </article>
      </div>

      <div class="perf-board">
        <div class="perf-scroll">
          <MasonryGrid
            :data="performanceCards"
            :columns="4"
            :gap="12"
            :row-gap="12"
            aspect-ratio="1"
            item-key="id"
            :virtual="virtual"
            full-row="fullRow"
          >
            <template #item="{ item, index }">
              <article class="perf-tile">
                <div class="perf-tile__media" :style="item.mediaStyle">
                  <span class="perf-tile__index">#{{ index + 1 }}</span>
                  <span v-if="item.fullRow" class="demo-card__label"
                    >full row</span
                  >
                </div>
              </article>
            </template>
          </MasonryGrid>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import LegacyWaterfall from "./components/LegacyWaterfall.vue";
import MasonryGrid from "./lib/masonry-grid";

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
const perfSizes = [120, 300, 600, 1000];
const perfSize = ref(300);
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
  :extra-height="0"
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

const legacyExample = `<LegacyWaterfall
  :data="list"
  :col="2"
  :gap="12"
  resolution="3/4"
  :expand="0"
/>`;

const modernExample = `<MasonryGrid
  :data="list"
  :columns="2"
  :gap="12"
  aspect-ratio="3/4"
  :extra-height="0"
  item-key="id"
  full-row="fullRow"
/>`;

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

const legacyCards = computed(() => {
  return cards.value.slice(0, 8).map((item, index) => ({
    ...item,
    widthFill: index === 2,
  }));
});

const modernCards = computed(() => {
  return cards.value.slice(0, 8).map((item, index) => ({
    ...item,
    fullRow: index === 2,
  }));
});

const performanceCards = computed(() => {
  return Array.from({ length: perfSize.value }, (_, index) => {
    const [start, end] = palette[index % palette.length];
    return {
      id: `perf-${index + 1}`,
      fullRow: index > 0 && index % 40 === 0,
      mediaStyle: {
        background: `linear-gradient(135deg, ${start} 0%, ${end} 100%)`,
      },
    };
  });
});

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
  height: 100%;
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
  min-height: 0;
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

.demo-card__label {
  position: absolute;
  left: 12px;
  bottom: 12px;
  max-width: calc(100% - 24px);
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 248, 237, 0.88);
  color: #2d241a;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.compare-section {
  margin-top: 40px;
}

.compare-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  margin-top: 20px;
}

.compare-card,
.delta-item {
  padding: 22px;
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 14px 44px rgba(95, 69, 31, 0.08);
}

.compare-card__head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.compare-card__head h3 {
  margin: 0 0 6px;
}

.compare-card__head p {
  margin: 0;
  line-height: 1.55;
  color: #6d5b45;
}

.compare-badge {
  padding: 6px 10px;
  border-radius: 999px;
  background: #f2e4cd;
  color: #6c4b1e;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.compare-badge--new {
  background: #ddeee3;
  color: #24553d;
}

.compare-preview {
  padding: 12px;
  border-radius: 24px;
  background: #fffaf2;
}

.code-block--small {
  margin-bottom: 16px;
  font-size: 13px;
}

.demo-card--compact .demo-card__media {
  min-height: 0;
}

.delta-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-top: 18px;
}

.delta-item strong {
  display: block;
  margin-bottom: 8px;
}

.delta-item p {
  margin: 0;
  line-height: 1.55;
  color: #6d5b45;
}

.perf-section {
  margin-top: 40px;
}

.perf-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 18px;
}

.perf-chip {
  border: 1px solid rgba(45, 36, 26, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  color: #2d241a;
  padding: 10px 14px;
  cursor: pointer;
}

.perf-chip--active {
  background: #2d241a;
  color: #fff8ed;
}

.perf-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-top: 18px;
}

.perf-meta__item {
  padding: 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 14px 44px rgba(95, 69, 31, 0.08);
}

.perf-meta__item strong {
  display: block;
  font-size: 26px;
}

.perf-meta__item span {
  color: #6d5b45;
}

.perf-board {
  margin-top: 18px;
  padding: 14px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 14px 44px rgba(95, 69, 31, 0.08);
}

.perf-scroll {
  height: 72vh;
  overflow: auto;
  padding: 10px;
  border-radius: 22px;
  background: #fffaf2;
}

.perf-tile {
  height: 100%;
  overflow: hidden;
  border-radius: 18px;
  box-shadow: 0 8px 22px rgba(100, 73, 35, 0.1);
}

.perf-tile__media {
  position: relative;
  height: 100%;
  min-height: 84px;
}

.perf-tile__index {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.24);
  color: white;
  font-size: 11px;
}

@media (max-width: 980px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .section-heading {
    align-items: start;
    flex-direction: column;
  }

  .compare-grid,
  .delta-list,
  .perf-meta {
    grid-template-columns: 1fr;
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
