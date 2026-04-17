<template>
  <main class="page-shell">
    <!-- ─── Hero ─────────────────────────────────────────── -->
    <section class="hero">
      <p class="eyebrow">MasonryGrid</p>
      <h1>Vue 3 Masonry Layout</h1>
      <p class="hero-copy">
        支持虚拟滚动、DOM 复用池、自定义高度、通栏项、宽高比约束等完整能力的瀑布流组件。
      </p>
    </section>

    <!-- ─── Interactive Playground ────────────────────────── -->
    <section class="playground">
      <div class="section-heading">
        <div>
          <p class="section-kicker">交互演练场</p>
          <h2>实时预览</h2>
        </div>
        <div class="btn-group">
          <button class="ghost-btn" @click="shuffleCards">打乱卡片</button>
          <button class="ghost-btn" @click="scrollToExampleItem">滚动到 #20</button>
        </div>
      </div>

      <div class="control-panel">
        <label>
          <span>columns</span>
          <input v-model.number="columns" type="range" min="2" max="5" />
          <strong>{{ columns }}</strong>
        </label>
        <label>
          <span>gap</span>
          <input v-model.number="colGap" type="range" min="4" max="24" />
          <strong>{{ colGap }}px</strong>
        </label>
        <label>
          <span>rowGap</span>
          <input v-model.number="rowGap" type="range" min="4" max="40" />
          <strong>{{ rowGap }}px</strong>
        </label>
        <label>
          <span>extraHeight</span>
          <input v-model.number="extraHeight" type="range" min="0" max="80" />
          <strong>{{ extraHeight }}px</strong>
        </label>
        <label>
          <span>aspectRatio</span>
          <select v-model="aspectRatio">
            <option v-for="r in ratioOptions" :key="r" :value="r">{{ r }}</option>
          </select>
        </label>
        <label class="toggle">
          <input v-model="virtual" type="checkbox" />
          <span>virtual</span>
        </label>
        <label class="toggle">
          <input v-model="windowScroll" type="checkbox" />
          <span>页面滚动</span>
        </label>
      </div>

      <div class="playground-grid">
        <div class="playground-preview">
          <section :class="['demo-frame', { 'demo-frame--window': windowScroll }]">
            <div v-if="!windowScroll" class="inner-scroll">
              <MasonryGrid
                ref="gridRef"
                :data="cards"
                :columns="columns"
                :gap="colGap"
                :row-gap="rowGap"
                :aspect-ratio="aspectRatio"
                :extra-height="extraHeight"
                item-key="id"
                :virtual="virtual"
                :item-height="useCustomHeight ? customHeight : undefined"
              >
                <template #item="{ item, index }">
                  <article class="demo-card" :style="item.cardStyle">
                    <div class="demo-card__media" :style="item.mediaStyle">
                      <span class="demo-card__badge">#{{ index + 1 }}</span>
                    </div>
                    <div v-if="extraHeight > 0" class="demo-card__footer">
                      {{ item.title }}
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
              :gap="colGap"
              :row-gap="rowGap"
              :aspect-ratio="aspectRatio"
              :extra-height="extraHeight"
              item-key="id"
              :virtual="virtual"
              :item-height="useCustomHeight ? customHeight : undefined"
            >
              <template #item="{ item, index }">
                <article class="demo-card" :style="item.cardStyle">
                  <div class="demo-card__media" :style="item.mediaStyle">
                    <span class="demo-card__badge">#{{ index + 1 }}</span>
                  </div>
                  <div v-if="extraHeight > 0" class="demo-card__footer">
                    {{ item.title }}
                  </div>
                </article>
              </template>
            </MasonryGrid>
          </section>
        </div>

        <div class="playground-code">
          <pre class="code-block"><code>{{ usageExample }}</code></pre>
        </div>
      </div>
    </section>

    <!-- ─── Feature: fullRow ─────────────────────────────── -->
    <section class="feature-section">
      <div class="section-heading">
        <div>
          <p class="section-kicker">通栏项</p>
          <h2>fullRow</h2>
        </div>
        <p class="section-copy">
          通过 <code>fullRow</code> 指定哪些项横跨所有列，适合做广告位、Banner 等场景。
        </p>
      </div>
      <div class="feature-preview">
        <MasonryGrid
          :data="fullRowCards"
          :columns="3"
          :gap="12"
          :row-gap="12"
          aspect-ratio="3/2"
          :extra-height="0"
          item-key="id"
          :full-row="(item: any) => item.isBanner"
          :item-height="(item: any) => item.isBanner ? 100 : undefined"
        >
          <template #item="{ item }">
            <article :class="['demo-card', { 'demo-card--banner': item.isBanner }]">
              <div class="demo-card__media" :style="item.mediaStyle">
                <span v-if="item.isBanner" class="demo-card__banner-label">Banner - fullRow</span>
              </div>
            </article>
          </template>
        </MasonryGrid>
      </div>
    </section>

    <!-- ─── Feature: itemHeight / itemAspectRatio ──────── -->
    <section class="feature-section">
      <div class="section-heading">
        <div>
          <p class="section-kicker">逐项尺寸控制</p>
          <h2>itemHeight / itemAspectRatio</h2>
        </div>
        <p class="section-copy">
          <code>itemHeight</code> 直接指定像素高度；<code>itemAspectRatio</code> 按宽高比自动算高度。两者都支持字段名或函数。
        </p>
      </div>
      <div class="feature-compare">
        <div>
          <p class="feature-label">itemHeight="h" (固定像素)</p>
          <div class="feature-preview feature-preview--compact">
            <MasonryGrid
              :data="customHeightCards"
              :columns="4"
              :gap="10"
              :row-gap="10"
              item-key="id"
              item-height="h"
            >
              <template #item="{ item }">
                <article class="demo-card">
                  <div class="demo-card__media" :style="item.mediaStyle">
                    <span class="demo-card__badge">{{ item.h }}px</span>
                  </div>
                </article>
              </template>
            </MasonryGrid>
          </div>
        </div>
        <div>
          <p class="feature-label">itemAspectRatio="ratio" (逐项比例)</p>
          <div class="feature-preview feature-preview--compact">
            <MasonryGrid
              :data="perRatioCards"
              :columns="4"
              :gap="10"
              :row-gap="10"
              item-key="id"
              item-aspect-ratio="ratio"
            >
              <template #item="{ item }">
                <article class="demo-card">
                  <div class="demo-card__media" :style="item.mediaStyle">
                    <span class="demo-card__badge">{{ item.ratio }}</span>
                  </div>
                </article>
              </template>
            </MasonryGrid>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Feature: aspectRatio clamp ───────────────────── -->
    <section class="feature-section">
      <div class="section-heading">
        <div>
          <p class="section-kicker">宽高比约束</p>
          <h2>minAspectRatio / maxAspectRatio</h2>
        </div>
        <p class="section-copy">
          限制宽高比范围，避免极端比例的图片撑得过高或过矮。
        </p>
      </div>
      <div class="feature-compare">
        <div>
          <p class="feature-label">无约束</p>
          <div class="feature-preview feature-preview--compact">
            <MasonryGrid
              :data="ratioClampCards"
              :columns="3"
              :gap="8"
              :row-gap="8"
              item-key="id"
              item-height="h"
            >
              <template #item="{ item }">
                <article class="demo-card">
                  <div class="demo-card__media" :style="item.mediaStyle">
                    <span class="demo-card__badge">{{ item.ratio }}</span>
                  </div>
                </article>
              </template>
            </MasonryGrid>
          </div>
        </div>
        <div>
          <p class="feature-label">min: 0.6 / max: 1.8</p>
          <div class="feature-preview feature-preview--compact">
            <MasonryGrid
              :data="ratioClampCardsConstrained"
              :columns="3"
              :gap="8"
              :row-gap="8"
              aspect-ratio="1"
              :min-aspect-ratio="0.6"
              :max-aspect-ratio="1.8"
              item-key="id"
              :item-height="(item: any) => item.clampedH"
            >
              <template #item="{ item }">
                <article class="demo-card">
                  <div class="demo-card__media" :style="item.mediaStyle">
                    <span class="demo-card__badge">{{ item.ratio }}</span>
                  </div>
                </article>
              </template>
            </MasonryGrid>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Performance ──────────────────────────────────── -->
    <section class="perf-section">
      <div class="section-heading">
        <div>
          <p class="section-kicker">性能</p>
          <h2>长列表压力测试</h2>
        </div>
        <p class="section-copy">
          切换样本量、虚拟滚动与复用池，观察 DOM 挂载数变化。不等高卡片让可见项数在滚动时波动。
        </p>
      </div>

      <div class="perf-toolbar">
        <button
          v-for="size in perfSizes"
          :key="size"
          :class="['perf-chip', { 'perf-chip--active': perfSize === size }]"
          @click="perfSize = size"
        >
          {{ size }} 项
        </button>
        <button
          :class="['perf-chip', { 'perf-chip--active': perfVirtual }]"
          @click="perfVirtual = !perfVirtual"
        >
          virtual {{ perfVirtual ? "ON" : "OFF" }}
        </button>
        <button
          :class="['perf-chip', { 'perf-chip--active': perfReuse }]"
          @click="perfReuse = !perfReuse"
        >
          reuse {{ perfReuse ? "ON" : "OFF" }}
        </button>
        <label class="perf-chip perf-chip--slider">
          <span>overscan</span>
          <input v-model.number="perfOverscan" type="range" min="0" max="800" step="50" />
          <strong>{{ perfOverscan }}px</strong>
        </label>
      </div>

      <div class="perf-meta">
        <article class="perf-meta__item">
          <strong>{{ perfSize }}</strong>
          <span>总数据量</span>
        </article>
        <article class="perf-meta__item">
          <strong>{{ perfRenderedCount }}</strong>
          <span>当前可见项数</span>
        </article>
        <article class="perf-meta__item">
          <strong>{{ perfMountedCount }}</strong>
          <span>挂载 DOM 数</span>
        </article>
        <article class="perf-meta__item">
          <strong>{{ perfSavedCount }}</strong>
          <span>节省 DOM 数</span>
        </article>
      </div>

      <div class="perf-board">
        <div class="perf-scroll">
          <MasonryGrid
            :data="performanceCards"
            :columns="4"
            :gap="10"
            :row-gap="10"
            item-key="id"
            :virtual="perfVirtual"
            :reuse="perfReuse"
            :overscan="perfOverscan"
            :item-height="(item: any) => item.h"
            @visible-change="handlePerfVisibleChange"
          >
            <template #item="{ item, index }">
              <article class="perf-tile">
                <div class="perf-tile__media" :style="item.mediaStyle">
                  <span class="perf-tile__index">#{{ index + 1 }}</span>
                </div>
              </article>
            </template>
          </MasonryGrid>
        </div>
      </div>
    </section>

    <!-- ─── API Reference ────────────────────────────────── -->
    <section class="api-section">
      <div class="section-heading">
        <div>
          <p class="section-kicker">API</p>
          <h2>Props / Methods / Events</h2>
        </div>
      </div>

      <div class="api-grid">
        <section class="docs-card">
          <h3>Props</h3>
          <div class="api-list">
            <article v-for="item in apiProps" :key="item.name" class="api-item">
              <div class="api-item__head">
                <strong>{{ item.name }}</strong>
                <code>{{ item.type }}</code>
              </div>
              <p>{{ item.desc }}</p>
            </article>
          </div>
        </section>

        <section class="docs-card">
          <h3>Methods</h3>
          <ul class="simple-list">
            <li><code>reflow()</code> — 重新测量容器并计算布局。</li>
            <li><code>reset()</code> — 清空布局缓存并重新计算。</li>
            <li><code>scrollToIndex(index, align?)</code> — 滚动到指定项，align 支持 start / center / end。</li>
          </ul>

          <h3>Events</h3>
          <ul class="simple-list">
            <li>
              <code>visibleChange</code> — 可见项变化时触发，payload 包含
              renderedCount / mountedCount / totalCount / virtual / reuse。
            </li>
          </ul>
        </section>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import MasonryGrid from "./lib/masonry-grid";

type MasonryGridExpose = {
  reflow: () => Promise<void>;
  reset: () => Promise<void>;
  scrollToIndex: (index: number, align?: "start" | "center" | "end") => void;
};

const palette = [
  ["#ffb36b", "#ff7a59"],
  ["#5ec2b7", "#2f7b8d"],
  ["#8ca4ff", "#5564d8"],
  ["#ffd76a", "#d77b34"],
  ["#ff95b2", "#a5447d"],
];

const gradientOf = (i: number) => {
  const [s, e] = palette[i % palette.length];
  return `linear-gradient(135deg, ${s} 0%, ${e} 100%)`;
};

// ─── Playground state ────────────────────────────────────
const columns = ref(3);
const colGap = ref(12);
const rowGap = ref(12);
const extraHeight = ref(0);
const aspectRatio = ref("3/4");
const virtual = ref(true);
const windowScroll = ref(false);
const useCustomHeight = ref(false);
const ratioOptions = ["1/1", "3/4", "4/5", "16/9", "5/7", "3/2"];
const gridRef = ref<MasonryGridExpose>();

const heightPool = [120, 160, 200, 140, 180, 100, 220, 150];
const customHeight = (_item: any, index: number) => heightPool[index % heightPool.length];

const cards = ref(
  Array.from({ length: 36 }, (_, i) => ({
    id: `card-${i + 1}`,
    title: `Card ${i + 1}`,
    cardStyle: { background: "#fffdf8", color: "#2d241a" },
    mediaStyle: { background: gradientOf(i) },
  }))
);

const shuffleCards = () => {
  cards.value = [...cards.value]
    .map((item) => ({ sort: Math.random(), item }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
};

const scrollToExampleItem = () => {
  gridRef.value?.scrollToIndex(19, "center");
};

const usageExample = computed(() => `<MasonryGrid
  :data="list"
  :columns="${columns.value}"
  :gap="${colGap.value}"
  :row-gap="${rowGap.value}"
  aspect-ratio="${aspectRatio.value}"
  :extra-height="${extraHeight.value}"
  item-key="id"
  :virtual="${virtual.value}"
>
  <template #item="{ item }">
    <Card :item="item" />
  </template>
</MasonryGrid>`);

// ─── fullRow demo ────────────────────────────────────────
const fullRowCards = computed(() =>
  Array.from({ length: 9 }, (_, i) => ({
    id: `fr-${i}`,
    isBanner: i === 3 || i === 7,
    mediaStyle: { background: gradientOf(i) },
  }))
);

// ─── itemHeight demo ────────────────────────────────────
const customHeightCards = computed(() =>
  Array.from({ length: 12 }, (_, i) => {
    const h = 80 + ((i * 37) % 120);
    return {
      id: `ch-${i}`,
      h,
      mediaStyle: { background: gradientOf(i) },
    };
  })
);

const perRatioCards = computed(() => {
  const ratios = ["1/1", "3/4", "16/9", "4/5", "3/2", "5/7", "1/1", "4/3", "9/16", "3/4", "2/1", "5/7"];
  return ratios.map((ratio, i) => ({
    id: `pr-${i}`,
    ratio,
    mediaStyle: { background: gradientOf(i) },
  }));
});

// ─── aspectRatio clamp demo ─────────────────────────────
const clampDemoWidth = 300;
const clampColWidth = (clampDemoWidth - 8 * 2) / 3;

const ratioClampCards = computed(() => {
  const ratios = [0.3, 0.6, 1, 1.5, 2.5, 0.4];
  return ratios.map((r, i) => ({
    id: `rc-${i}`,
    ratio: `${r}:1`,
    h: Math.round(clampColWidth / r),
    mediaStyle: { background: gradientOf(i) },
  }));
});

const ratioClampCardsConstrained = computed(() => {
  const ratios = [0.3, 0.6, 1, 1.5, 2.5, 0.4];
  return ratios.map((r, i) => {
    const clamped = Math.max(0.6, Math.min(1.8, r));
    return {
      id: `rcc-${i}`,
      ratio: `${r}:1`,
      clampedH: Math.round(clampColWidth / clamped),
      mediaStyle: { background: gradientOf(i) },
    };
  });
});

// ─── Performance section ────────────────────────────────
const perfSizes = [200, 500, 1000, 3000];
const perfSize = ref(500);
const perfVirtual = ref(true);
const perfReuse = ref(false);
const perfOverscan = ref(200);
const perfRenderedCount = ref(0);
const perfMountedCount = ref(0);

const performanceCards = computed(() =>
  Array.from({ length: perfSize.value }, (_, i) => ({
    id: `perf-${i + 1}`,
    h: 80 + ((i * 47) % 140),
    mediaStyle: { background: gradientOf(i) },
  }))
);

const perfSavedCount = computed(() =>
  Math.max(0, perfSize.value - perfMountedCount.value)
);

const handlePerfVisibleChange = (payload: {
  renderedCount: number;
  mountedCount: number;
}) => {
  perfRenderedCount.value = payload.renderedCount;
  perfMountedCount.value = payload.mountedCount;
};

// ─── API reference ──────────────────────────────────────
const apiProps = [
  { name: "data", type: "any[]", desc: "数据源数组。" },
  { name: "columns", type: "number", desc: "列数，默认 2。" },
  { name: "gap / rowGap", type: "number", desc: "列间距和行间距，rowGap 默认等于 gap。" },
  { name: "aspectRatio", type: "string | number", desc: "全局宽高比，如 '3/4' 或 0.75。" },
  { name: "minAspectRatio", type: "number", desc: "宽高比下限，防止卡片过高。" },
  { name: "maxAspectRatio", type: "number", desc: "宽高比上限，防止卡片过矮。" },
  { name: "extraHeight", type: "number", desc: "每项额外高度（如底部文字区域），默认 0。" },
  { name: "scaleExtraHeight", type: "boolean", desc: "extraHeight 是否按容器宽度与 designWidth 等比缩放。" },
  { name: "itemKey", type: "string | function", desc: "列表项 key 解析策略。" },
  { name: "itemHeight", type: "string | function", desc: "自定义高度：字段名或 (item, index) => number。" },
  { name: "fullRow", type: "string | function", desc: "通栏判断：字段名或 (item, index) => boolean。" },
  { name: "virtual", type: "boolean", desc: "开启虚拟滚动，只渲染可视区附近的项。" },
  { name: "reuse", type: "boolean", desc: "开启 DOM 复用池，减少挂载/卸载开销。需配合 virtual。" },
  { name: "overscan", type: "number", desc: "虚拟滚动的上下缓冲区域，默认 200px。" },
];
</script>

<style scoped>
.page-shell {
  max-width: 1320px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

/* ─── Hero ─────────────────────────────── */
.hero {
  padding: 32px 36px;
  border-radius: 28px;
  background: linear-gradient(135deg, rgba(255,255,255,.94), rgba(255,248,232,.82));
  box-shadow: 0 18px 60px rgba(95,69,31,.12);
}

.eyebrow {
  margin: 0 0 10px;
  text-transform: uppercase;
  letter-spacing: .18em;
  font-size: 12px;
  color: #9f7a49;
}

h1, h2, h3 { margin: 0; }

h1 {
  font-size: clamp(34px, 7vw, 56px);
  line-height: .95;
}

h2 { font-size: 24px; }

h3 {
  font-size: 18px;
  margin-bottom: 14px;
}

.hero-copy {
  max-width: 620px;
  margin: 14px 0 0;
  font-size: 16px;
  line-height: 1.65;
  color: #5d4d3a;
}

/* ─── Shared ───────────────────────────── */
.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.section-kicker {
  margin: 0 0 6px;
  font-size: 12px;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: #9f7a49;
}

.section-copy {
  max-width: 400px;
  margin: 0;
  line-height: 1.55;
  color: #6d5b45;
}

.btn-group {
  display: flex;
  gap: 10px;
}

.primary-btn, .ghost-btn {
  border: 0;
  border-radius: 999px;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: transform .18s ease;
}

.primary-btn {
  background: #2d241a;
  color: #fff8ed;
  box-shadow: 0 12px 28px rgba(45,36,26,.18);
}

.ghost-btn {
  background: #fff;
  color: #2d241a;
  border: 1px solid rgba(45,36,26,.12);
}

.primary-btn:hover, .ghost-btn:hover {
  transform: translateY(-1px);
}

/* ─── Control Panel ────────────────────── */
.control-panel {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px 20px;
  padding: 16px 20px;
  border: 1px solid rgba(80,57,23,.08);
  border-radius: 22px;
  background: rgba(255,255,255,.72);
  backdrop-filter: blur(10px);
  margin-bottom: 18px;
}

.control-panel label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.control-panel select {
  padding: 6px 10px;
  border: 1px solid rgba(45,36,26,.12);
  border-radius: 10px;
  background: #fff;
  font-size: 14px;
}

.toggle {
  padding: 8px 14px;
  border-radius: 999px;
  background: #f6eee0;
}

/* ─── Playground ───────────────────────── */
.playground {
  margin-top: 28px;
}

.playground-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 18px;
  align-items: start;
}

.playground-preview { min-width: 0; }

.demo-frame { margin: 0; }

.inner-scroll {
  height: 72vh;
  overflow: auto;
  padding: 14px;
  border-radius: 24px;
  background: rgba(255,255,255,.7);
  box-shadow: inset 0 0 0 1px rgba(90,64,28,.08);
}

.demo-frame--window { padding-top: 12px; }

.demo-card {
  height: 100%;
  overflow: hidden;
  border-radius: 18px;
  box-shadow: 0 10px 26px rgba(100,73,35,.12);
}

.demo-card__media {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.demo-card__badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 5px 9px;
  border-radius: 999px;
  background: rgba(255,255,255,.22);
  color: white;
  font-size: 12px;
  backdrop-filter: blur(6px);
}

.demo-card__footer {
  padding: 10px 14px;
  font-size: 13px;
  color: #6d5b45;
  background: #fffdf8;
}

.demo-card--banner {
  border-radius: 18px;
  box-shadow: 0 10px 26px rgba(100,73,35,.18);
}

.demo-card__banner-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 8px 18px;
  border-radius: 999px;
  background: rgba(255,255,255,.3);
  color: white;
  font-size: 14px;
  font-weight: 600;
  backdrop-filter: blur(6px);
  white-space: nowrap;
}

.playground-code {
  position: sticky;
  top: 20px;
}

.code-block {
  overflow: auto;
  margin: 0;
  padding: 18px;
  border-radius: 20px;
  background: #241c14;
  color: #fff8ed;
  line-height: 1.6;
  font-size: 13px;
}

/* ─── Feature sections ─────────────────── */
.feature-section {
  margin-top: 40px;
}

.feature-preview {
  padding: 16px;
  border-radius: 24px;
  background: rgba(255,255,255,.76);
  box-shadow: 0 14px 44px rgba(95,69,31,.08);
}

.feature-preview--compact {
  padding: 12px;
}

.feature-compare {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.feature-label {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: #5d4d3a;
}

/* ─── Perf ─────────────────────────────── */
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
  border: 1px solid rgba(45,36,26,.14);
  border-radius: 999px;
  background: rgba(255,255,255,.78);
  color: #2d241a;
  padding: 8px 14px;
  cursor: pointer;
  font-size: 14px;
}

.perf-chip--active {
  background: #2d241a;
  color: #fff8ed;
}

.perf-chip--slider {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: default;
}

.perf-chip--slider input[type="range"] {
  width: 80px;
}

.perf-meta {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 18px;
}

.perf-meta__item {
  padding: 16px;
  border-radius: 20px;
  background: rgba(255,255,255,.76);
  box-shadow: 0 12px 36px rgba(95,69,31,.08);
}

.perf-meta__item strong {
  display: block;
  font-size: 24px;
}

.perf-meta__item span {
  color: #6d5b45;
  font-size: 13px;
}

.perf-board {
  margin-top: 18px;
  padding: 14px;
  border-radius: 28px;
  background: rgba(255,255,255,.76);
  box-shadow: 0 14px 44px rgba(95,69,31,.08);
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
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(100,73,35,.1);
}

.perf-tile__media {
  position: relative;
  height: 100%;
  min-height: 60px;
}

.perf-tile__index {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 3px 7px;
  border-radius: 999px;
  background: rgba(255,255,255,.24);
  color: white;
  font-size: 11px;
}

/* ─── API ──────────────────────────────── */
.api-section {
  margin-top: 40px;
}

.api-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 20px;
  align-items: start;
}

.docs-card {
  padding: 22px;
  border-radius: 24px;
  background: rgba(255,255,255,.76);
  box-shadow: 0 14px 44px rgba(95,69,31,.08);
}

.api-list {
  display: grid;
  gap: 10px;
}

.api-item {
  padding: 12px 14px;
  border-radius: 16px;
  background: #fffaf2;
}

.api-item__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.api-item code, .code-block code, .simple-list code {
  font-family: "SFMono-Regular", "Menlo", monospace;
}

.api-item p {
  margin: 6px 0 0;
  line-height: 1.5;
  color: #6d5b45;
  font-size: 13px;
}

.simple-list {
  display: grid;
  gap: 10px;
  padding-left: 20px;
  margin: 0 0 20px;
  line-height: 1.55;
}

.simple-list:last-child {
  margin-bottom: 0;
}

/* ─── Responsive ───────────────────────── */
@media (max-width: 980px) {
  .playground-grid, .api-grid {
    grid-template-columns: 1fr;
  }

  .section-heading {
    align-items: start;
    flex-direction: column;
  }

  .perf-meta {
    grid-template-columns: repeat(2, 1fr);
  }

  .feature-compare {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .page-shell { padding: 22px 14px 52px; }
  .hero { padding: 22px 18px; }
  .control-panel { padding: 14px; }
  .inner-scroll { height: 68vh; padding: 10px; }
  .docs-card { padding: 18px; }
  .perf-meta { grid-template-columns: 1fr; }
}
</style>
