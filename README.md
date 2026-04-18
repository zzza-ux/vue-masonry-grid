# MasonryGrid

`MasonryGrid` 是一个面向 Vue 3 的瀑布流组件，支持虚拟滚动、DOM 复用池、逐项高度控制、通栏项和滚动定位。本仓库采用方案 A：同一个仓库里同时包含可复用组件库和演示 demo。

## 仓库结构

- `src/lib/masonry-grid`: 组件源码与对外导出入口
- `src/App.vue`: 演示页面
- `tests`: 核心布局逻辑单元测试
- `dist/lib`: 组件库构建产物
- `dist/demo`: demo 站点构建产物

## 组件能力

- 多列瀑布流布局
- `virtual` 虚拟滚动
- `reuse` DOM 复用池
- `itemHeight` / `itemAspectRatio` 逐项尺寸控制
- `fullRow` 通栏项
- `scrollToIndex()`、`reflow()`、`reset()` 实例方法
- 独立导出的 `computeMasonryLayout()` 布局函数，方便测试或自定义封装

## 安装

```bash
npm install vue-masonry-grid
```

如果你只是想本地体验 demo：

```bash
npm install
npm run dev
```

## 基础使用

```vue
<script setup lang="ts">
import { ref } from "vue";
import { MasonryGrid } from "vue-masonry-grid";
import "vue-masonry-grid/style.css";

const items = ref([
  { id: 1, height: 180 },
  { id: 2, height: 240 },
  { id: 3, height: 160 },
]);
</script>

<template>
  <MasonryGrid
    :data="items"
    :columns="2"
    :gap="12"
    item-key="id"
    item-height="height"
  >
    <template #item="{ item }">
      <div class="card">{{ item.id }}</div>
    </template>
  </MasonryGrid>
</template>
```

## 对外导出

```ts
import { MasonryGrid, computeMasonryLayout } from "vue-masonry-grid";
import type {
  MasonryGridProps,
  ScrollAlign,
  LayoutOptions,
  LayoutResult,
} from "vue-masonry-grid";
```

## Props

| Prop | 说明 | 默认值 |
| --- | --- | --- |
| `data` | 数据数组 | 必填 |
| `columns` | 列数 | `2` |
| `gap` | 列间距 | `10` |
| `rowGap` | 行间距，默认继承 `gap` | `gap` |
| `aspectRatio` | 默认宽高比，支持数字或 `"4/3"` | `1` |
| `minAspectRatio` / `maxAspectRatio` | 宽高比约束 | - |
| `extraHeight` | 附加高度 | `0` |
| `scaleExtraHeight` | 是否按 `designWidth` 缩放附加高度 | `false` |
| `designWidth` | 设计稿宽度 | `375` |
| `itemKey` | 唯一 key 字段或函数 | `"id"` |
| `itemHeight` | 逐项高度字段或函数 | - |
| `itemAspectRatio` | 逐项宽高比字段或函数 | - |
| `fullRow` | 是否通栏，支持字段或函数 | - |
| `virtual` | 是否开启虚拟滚动 | `false` |
| `reuse` | 虚拟滚动下是否启用 DOM 复用池 | `false` |
| `overscan` | 视口额外渲染范围 | `200` |
| `debug` | 显示调试信息 | `false` |

## Events

- `visibleChange`: 返回当前渲染数量、挂载数量、总数，以及 `virtual` / `reuse` 状态

## Expose

- `reflow()`: 重新测量容器并布局
- `reset()`: 清空内部缓存后重新布局
- `scrollToIndex(index, align?)`: 平滑滚动到指定项，`align` 支持 `start`、`center`、`end`

## 开发

```bash
npm install
npm run dev
npm run test
npm run build
```

其中：

- `npm run build:demo` 构建演示站
- `npm run build:lib` 构建组件库与类型声明

## License

MIT
