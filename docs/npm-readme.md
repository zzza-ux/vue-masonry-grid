# vue-masonry-grid

`vue-masonry-grid` 是一个面向 Vue 3 的瀑布流组件，支持多列布局、逐项高度控制、宽高比驱动布局、通栏项、虚拟滚动和 DOM 复用池。

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
```

## Features

- Vue 3 组件，开箱即用
- 支持任意列数的瀑布流布局
- 支持 `itemHeight` 和 `itemAspectRatio` 两种逐项尺寸策略
- 支持 `fullRow` 通栏项
- 支持 `virtual` 虚拟滚动
- 支持 `reuse` DOM 复用池
- 暴露 `reflow()`、`reset()`、`scrollToIndex()` 方法
- 导出 `computeMasonryLayout()` 布局函数

## Common Usage

### Fixed item heights

```vue
<MasonryGrid
  :data="items"
  item-key="id"
  item-height="height"
/>
```

### Aspect-ratio driven heights

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
| `scaleExtraHeight` | `boolean` | `false` | 是否基于 `designWidth` 按比例缩放 `extraHeight` |
| `designWidth` | `number` | `375` | 设计稿宽度 |
| `itemKey` | `string \| (item, index) => ItemKey` | `"id"` | 唯一标识字段或函数 |
| `itemHeight` | `string \| (item, index) => number` | - | 逐项高度字段或函数 |
| `itemAspectRatio` | `string \| (item, index) => string \| number` | - | 逐项宽高比字段或函数 |
| `fullRow` | `string \| (item, index) => boolean` | - | 是否通栏 |
| `virtual` | `boolean` | `false` | 是否启用虚拟滚动 |
| `reuse` | `boolean` | `false` | 虚拟滚动下是否启用 DOM 复用池 |
| `overscan` | `number` | `200` | 视口外额外渲染范围，单位 `px` |
| `debug` | `boolean` | `false` | 显示调试信息 |

### Slots

| Slot | Scope |
| --- | --- |
| `item` | `{ item, index }` |

### Event

`visibleChange`

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

```ts
reflow(): Promise<void>
reset(): Promise<void>
scrollToIndex(index: number, align?: "start" | "center" | "end"): void
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

## License

[MIT](./LICENSE)
