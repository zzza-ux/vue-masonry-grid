<template>
  <main class="page-shell">
    <section class="hero">
      <p class="eyebrow">组件演示</p>
      <div class="hero-row">
        <div>
          <h1>MasonryGrid 组件演示</h1>
          <p class="hero-copy">
            一个用于展示布局行为、虚拟滚动效果和组件接口设计的小型演示站点。
          </p>
        </div>
        <button class="primary-btn" @click="shuffleCards">打乱卡片</button>
      </div>
      <div class="hero-stats">
        <div class="hero-stat">
          <strong>{{ cards.length }}</strong>
          <span>演示卡片数</span>
        </div>
        <div class="hero-stat">
          <strong>{{ columns }}</strong>
          <span>列数</span>
        </div>
        <div class="hero-stat">
          <strong>{{ virtual ? "开启" : "关闭" }}</strong>
          <span>主示例虚拟滚动</span>
        </div>
        <div class="hero-stat">
          <strong>{{ perfSize }}</strong>
          <span>性能测试样本量</span>
        </div>
      </div>
    </section>

    <section class="control-panel">
      <label>
        <span>列数</span>
        <input v-model.number="columns" type="range" min="2" max="5" />
        <strong>{{ columns }}</strong>
      </label>
      <label>
        <span>间距</span>
        <input v-model.number="gap" type="range" min="8" max="24" />
        <strong>{{ gap }}px</strong>
      </label>
      <label class="toggle">
        <input v-model="virtual" type="checkbox" />
        <span>开启虚拟滚动</span>
      </label>
      <label class="toggle">
        <input v-model="windowScroll" type="checkbox" />
        <span>使用页面滚动</span>
      </label>
      <button class="ghost-btn" @click="scrollToExampleItem">
        滚动到第 20 项
      </button>
    </section>

    <section class="content-grid">
      <div class="demo-column">
        <div class="section-heading">
          <div>
            <p class="section-kicker">实时预览</p>
            <h2>交互示例</h2>
          </div>
          <p class="section-copy">
            可以在“容器滚动”和“页面滚动”之间切换，观察组件在两种接入方式下的表现。
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
            >
              <template #item="{ item, index }">
                <article class="demo-card" :style="item.cardStyle">
                  <div class="demo-card__media" :style="item.mediaStyle">
                    <span class="demo-card__badge">#{{ index + 1 }}</span>
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
          >
            <template #item="{ item, index }">
              <article class="demo-card" :style="item.cardStyle">
                <div class="demo-card__media" :style="item.mediaStyle">
                  <span class="demo-card__badge">#{{ index + 1 }}</span>
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
              <p class="section-kicker">用法</p>
              <h2>基础示例代码</h2>
            </div>
          </div>
          <pre class="code-block"><code>{{ usageExample }}</code></pre>
        </section>

        <section class="docs-card">
          <div class="section-heading section-heading--compact">
            <div>
              <p class="section-kicker">API</p>
              <h2>常用参数</h2>
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
              <p class="section-kicker">实例方法</p>
              <h2>方法说明</h2>
            </div>
          </div>
          <ul class="simple-list">
            <li><code>reflow()</code>：重新测量容器并计算布局。</li>
            <li><code>reset()</code>：清空缓存布局并重新计算。</li>
            <li><code>scrollToIndex(index, align)</code>：滚动到指定项。</li>
          </ul>
        </section>
      </aside>
    </section>

    <section class="compare-section">
      <div class="section-heading">
        <div>
          <p class="section-kicker">迁移对比</p>
          <h2>旧 Waterfall 与 MasonryGrid</h2>
        </div>
        <p class="section-copy">
          下面两个区域渲染的是同一组数据。左边保留旧接口风格，右边展示语义更清晰的新接口。
        </p>
      </div>

      <div class="compare-grid">
        <article class="compare-card">
          <header class="compare-card__head">
            <div>
              <h3>LegacyWaterfall</h3>
              <p>
                旧版参数：<code>col</code>、<code>resolution</code>、
                <code>expand</code>。
              </p>
            </div>
            <span class="compare-badge">旧版</span>
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
                  class="demo-card demo-card--compact"
                  :style="item.cardStyle"
                >
                  <div class="demo-card__media" :style="item.mediaStyle"></div>
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
                新版参数：<code>columns</code>、<code>aspectRatio</code>、
                <code>extraHeight</code>。
              </p>
            </div>
            <span class="compare-badge compare-badge--new">新版</span>
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
            >
              <template #item="{ item }">
                <article
                  class="demo-card demo-card--compact"
                  :style="item.cardStyle"
                >
                  <div class="demo-card__media" :style="item.mediaStyle"></div>
                </article>
              </template>
            </MasonryGrid>
          </div>
        </article>
      </div>

      <div class="delta-list">
        <article class="delta-item">
          <strong>Key 策略</strong>
          <p>
            旧写法往往默认依赖 <code>item.id</code>；MasonryGrid 则通过
            <code>itemKey</code> 把策略显式暴露出来。
          </p>
        </article>
        <article class="delta-item">
          <strong>语义更清晰</strong>
          <p>
            <code>columns</code>, <code>aspectRatio</code> and
            <code>extraHeight</code> 更像对外能力描述，而不是内部布局计算细节。
          </p>
        </article>
        <article class="delta-item">
          <strong>示例更纯粹</strong>
          <p>
            现在这个页面里的不等高卡片都保持为纯瀑布流项，更方便观察布局行为本身。
          </p>
        </article>
      </div>
    </section>

    <section class="perf-section">
      <div class="section-heading">
        <div>
          <p class="section-kicker">性能视图</p>
          <h2>长列表压力测试</h2>
        </div>
        <p class="section-copy">
          可以切换不同样本量，快速观察数据规模变大后组件的表现。
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
          虚拟滚动 {{ perfVirtual ? "开" : "关" }}
        </button>
        <button
          :class="['perf-chip', { 'perf-chip--active': perfReuse }]"
          @click="perfReuse = !perfReuse"
        >
          复用池 {{ perfReuse ? "开" : "关" }}
        </button>
      </div>

      <div class="perf-meta">
        <article class="perf-meta__item">
          <strong>{{ perfSize }}</strong>
          <span>总数据量</span>
        </article>
        <article class="perf-meta__item">
          <strong>{{ perfRenderedCount }}</strong>
          <span>当前可见数据项数</span>
        </article>
        <article class="perf-meta__item">
          <strong>{{ perfMountedCount }}</strong>
          <span>当前挂载的卡片容器数</span>
        </article>
        <article class="perf-meta__item">
          <strong>{{ perfSavedCount }}</strong>
          <span>节省的卡片容器数</span>
        </article>
      </div>

      <p class="perf-note">
        在这个区域里滚动，并切换虚拟滚动与复用池开关。开启虚拟滚动后， 挂载的
        卡片容器数会明显低于总数据量；再开启复用池后，这个数量会更稳定。
      </p>

      <div class="perf-mode-grid">
        <article
          v-for="mode in perfModes"
          :key="mode.key"
          :class="['perf-mode-card', { 'perf-mode-card--active': mode.active }]"
        >
          <div class="perf-mode-card__head">
            <strong>{{ mode.title }}</strong>
            <span>{{ mode.tag }}</span>
          </div>
          <p>{{ mode.desc }}</p>
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
            :virtual="perfVirtual"
            :reuse="perfReuse"
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
const perfVirtual = ref(true);
const perfReuse = ref(false);
const perfRenderedCount = ref(0);
const perfMountedCount = ref(0);
const gridRef = ref<MasonryGridExpose>();

const apiItems: ApiItem[] = [
  {
    name: "data",
    type: "any[]",
    desc: "组件用于布局和插槽渲染的数据源。",
  },
  {
    name: "columns",
    type: "number",
    desc: "控制瀑布流参与布局的列数。",
  },
  {
    name: "gap / rowGap",
    type: "number",
    desc: "控制卡片之间的横向和纵向间距。",
  },
  {
    name: "aspectRatio",
    type: "string | number",
    desc: "全局宽高比兜底，单项仍然可以通过自己的字段覆盖。",
  },
  {
    name: "itemKey",
    type: "string | function",
    desc: "稳定的 key 解析策略，适合真实列表更新场景。",
  },
  {
    name: "virtual / overscan",
    type: "boolean / number",
    desc: "开启可视区渲染，并配置上下缓冲区域。",
  },
  {
    name: "scrollTarget",
    type: "'parent' | 'window'",
    desc: "控制组件监听容器滚动还是页面滚动。",
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
/>`;

const createCard = (index: number): DemoCard => {
  const [start, end] = palette[index % palette.length];
  const ratio = ratioPool[index % ratioPool.length];

  return {
    id: `card-${index}`,
    title: `卡片 ${index}`,
    description: "使用不同宽高比来模拟真实内容场景。",
    resolution: ratio,
    cardStyle: {
      background: "#fffdf8",
      color: "#2d241a",
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
  return cards.value.slice(0, 8);
});

const modernCards = computed(() => {
  return cards.value.slice(0, 8);
});

const performanceCards = computed(() => {
  return Array.from({ length: perfSize.value }, (_, index) => {
    const [start, end] = palette[index % palette.length];
    return {
      id: `perf-${index + 1}`,
      mediaStyle: {
        background: `linear-gradient(135deg, ${start} 0%, ${end} 100%)`,
      },
    };
  });
});

const perfSavedCount = computed(() => {
  return Math.max(0, perfSize.value - perfMountedCount.value);
});

const perfModes = computed(() => {
  return [
    {
      key: "plain",
      title: "关闭虚拟滚动",
      tag: "模式 1",
      active: !perfVirtual.value,
      desc: "会直接渲染整份数据。最直观，但长列表下 DOM 数最高，性能压力也最大。",
    },
    {
      key: "virtual",
      title: "仅开虚拟滚动",
      tag: "模式 2",
      active: perfVirtual.value && !perfReuse.value,
      desc: "只渲染可视区域附近的内容。DOM 数显著下降，但滚动时挂载数量会有波动。",
    },
    {
      key: "virtual-reuse",
      title: "虚拟滚动 + 复用池",
      tag: "模式 3",
      active: perfVirtual.value && perfReuse.value,
      desc: "在可视区渲染基础上尽量复用已有槽位。挂载 DOM 数更稳定，适合展示更强的优化思路。",
    },
  ];
});

const shuffleCards = () => {
  cards.value = [...cards.value]
    .map((item) => ({ sort: Math.random(), item }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
};

const scrollToExampleItem = () => {
  gridRef.value?.scrollToIndex(19, "center");
};

const handlePerfVisibleChange = (payload: {
  renderedCount: number;
  mountedCount: number;
  totalCount: number;
  virtual: boolean;
  reuse: boolean;
}) => {
  perfRenderedCount.value = payload.renderedCount;
  perfMountedCount.value = payload.mountedCount;
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
  grid-template-columns: repeat(4, minmax(0, 1fr));
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

.perf-note {
  margin: 16px 0 0;
  color: #6d5b45;
  line-height: 1.6;
}

.perf-mode-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 18px;
}

.perf-mode-card {
  padding: 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 14px 44px rgba(95, 69, 31, 0.08);
  border: 1px solid transparent;
}

.perf-mode-card--active {
  border-color: rgba(45, 36, 26, 0.18);
  box-shadow: 0 18px 48px rgba(95, 69, 31, 0.14);
}

.perf-mode-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.perf-mode-card__head span {
  padding: 4px 8px;
  border-radius: 999px;
  background: #f5ead8;
  color: #6c4b1e;
  font-size: 12px;
}

.perf-mode-card p {
  margin: 0;
  line-height: 1.6;
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
  .perf-meta,
  .perf-mode-grid {
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

  .inner-scroll {
    height: 68vh;
    padding: 10px;
  }

  .docs-card {
    padding: 18px;
  }
}
</style>
