# vue-masonry-grid

`vue-masonry-grid` 是一个面向 Vue 3 的瀑布流组件，提供稳定的多列布局能力，并支持虚拟滚动、DOM 复用池、逐项高度控制、通栏项和滚动定位。

这个仓库同时包含两部分内容：

- 可发布的组件源码：`src/lib/masonry-grid`
- 本地演示页面：`src/App.vue`

## Features

- Vue 3 组件，开箱即用
- 支持任意列数的瀑布流布局
- 支持 `itemHeight` 和 `itemAspectRatio` 两种逐项尺寸策略
- 支持 `fullRow` 通栏项，适合 Banner / 广告位 / 分组标题
- 支持 `virtual` 虚拟滚动，减少长列表渲染开销
- 支持 `reuse` DOM 复用池，进一步降低滚动中的节点创建成本
- 暴露 `reflow()`、`reset()`、`scrollToIndex()` 方法
- 独立导出 `computeMasonryLayout()`，方便在组件外复用布局计算逻辑

## Installation

```bash
npm install vue-masonry-grid
```

## Quick Start

```vue
<script setup lang="ts">
import { ref } from "vue";
import { MasonryGrid } from "vue-masonry-grid";
import "vue-masonry-grid/style.css";

const items = ref([
  { id: 1, height: 180, title: "Card 1" },
  { id: 2, height: 240, title: "Card 2" },
  { id: 3, height: 160, title: "Card 3" },
  { id: 4, height: 220, title: "Card 4" },
]);
</script>

<template>
  <MasonryGrid
    :data="items"
    :columns="2"
    :gap="12"
    :row-gap="12"
    item-key="id"
    item-height="height"
  >
    <template #item="{ item }">
      <div class="card">
        {{ item.title }}
      </div>
    </template>
  </MasonryGrid>
</template>

<style scoped>
.card {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  border-radius: 12px;
  background: #f3f4f6;
}
</style>
```

## Usage Patterns

### Fixed item heights

适合后端直接返回卡片高度，或者你已经提前完成图片尺寸计算的场景。

```vue
<MasonryGrid
  :data="items"
  item-key="id"
  item-height="height"
/>
```

### Aspect-ratio driven heights

适合已知图片比例、但最终宽度依赖容器宽度的场景。

```vue
<MasonryGrid
  :data="items"
  item-key="id"
  item-aspect-ratio="ratio"
  :columns="3"
  :gap="12"
/>
```

`ratio` 支持数字，例如 `1.5`，也支持字符串，例如 `"4/3"` 或 `"4*3"`。

### Full-row items

```vue
<MasonryGrid
  :data="items"
  item-key="id"
  item-aspect-ratio="ratio"
  :full-row="(item) => item.isBanner"
/>
```

### Virtual scrolling

```vue
<MasonryGrid
  :data="items"
  item-key="id"
  item-height="height"
  :virtual="true"
  :reuse="true"
  :overscan="300"
/>
```

## API

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `ItemLike[]` | required | 渲染数据源 |
| `columns` | `number` | `2` | 列数，最小为 `1` |
| `gap` | `number` | `10` | 列间距 |
| `rowGap` | `number` | `gap` | 行间距，未传时继承 `gap` |
| `aspectRatio` | `string \| number` | `1` | 默认宽高比 |
| `minAspectRatio` | `number` | - | 最小宽高比限制 |
| `maxAspectRatio` | `number` | - | 最大宽高比限制 |
| `extraHeight` | `number` | `0` | 在计算高度后额外增加的高度 |
| `scaleExtraHeight` | `boolean` | `false` | 是否基于 `designWidth` 对 `extraHeight` 按比例缩放 |
| `designWidth` | `number` | `375` | 设计稿宽度，用于缩放 `extraHeight` |
| `itemKey` | `string \| (item, index) => ItemKey` | `"id"` | 唯一标识字段或函数 |
| `itemHeight` | `string \| (item, index) => number` | - | 逐项高度字段或函数 |
| `itemAspectRatio` | `string \| (item, index) => string \| number` | - | 逐项宽高比字段或函数 |
| `fullRow` | `string \| (item, index) => boolean` | - | 是否通栏 |
| `virtual` | `boolean` | `false` | 是否启用虚拟滚动 |
| `reuse` | `boolean` | `false` | 虚拟滚动下是否启用 DOM 复用池 |
| `overscan` | `number` | `200` | 视口外额外渲染范围，单位 `px` |
| `debug` | `boolean` | `false` | 显示调试信息 |

### Slots

| Slot | Scope | Description |
| --- | --- | --- |
| `item` | `{ item, index }` | 自定义单个卡片内容 |

### Events

#### `visibleChange`

当渲染项数量变化时触发，返回：

```ts
{
  renderedCount: number;
  mountedCount: number;
  totalCount: number;
  virtual: boolean;
  reuse: boolean;
}
```

### Exposed Methods

组件实例通过 `ref` 可调用以下方法：

```ts
reflow(): Promise<void>
reset(): Promise<void>
scrollToIndex(index: number, align?: "start" | "center" | "end"): void
```

示例：

```vue
<script setup lang="ts">
import { ref } from "vue";
import { MasonryGrid } from "vue-masonry-grid";

const gridRef = ref<InstanceType<typeof MasonryGrid>>();

const jumpTo20 = () => {
  gridRef.value?.scrollToIndex(19, "center");
};
</script>
```

## Package Exports

```ts
import { MasonryGrid, computeMasonryLayout } from "vue-masonry-grid";
import type {
  MasonryGridProps,
  ScrollAlign,
  LayoutOptions,
  LayoutResult,
} from "vue-masonry-grid";
```

## Local Development

安装依赖并启动演示页面：

```bash
npm install
npm run dev
```

常用命令：

```bash
npm run test
npm run build
npm run build:demo
npm run build:lib
```

目录说明：

- `src/lib/masonry-grid`: 组件源码、类型定义与导出入口
- `src/App.vue`: 演示页面
- `tests/masonry-layout.test.mjs`: 布局算法单元测试

## Publish Checklist

首次发布前建议确认：

- `npm test` 通过
- `npm run build` 通过
- `npm pack --dry-run` 检查发布内容
- 已完成 `npm login`
- 包名和版本号符合预期

发布命令：

```bash
npm publish
```

## License

[MIT](./LICENSE)
