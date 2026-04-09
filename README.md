# MasonryGrid Demo

独立示例项目，放在 `/Users/mac/Desktop/thrid/masonry-grid-demo`，用于演示 `MasonryGrid` 的基础能力：

- 多列瀑布流
- 不同宽高比卡片
- `fullRow` 整行卡片
- 虚拟渲染开关
- 父容器滚动 / `window` 滚动切换
- `scrollToIndex()` 调用示例
- API 说明卡片
- 可复制的基础接入代码片段
- `LegacyWaterfall` 与 `MasonryGrid` 的迁移对比区

## 运行

如果当前机器上已经有 `/Users/mac/Desktop/work/one/one-h5-client/node_modules`，这个 demo 可以通过软链接直接复用依赖。

```bash
cd /Users/mac/Desktop/thrid/masonry-grid-demo
npm run dev
```

## 文件

- `src/components/MasonryGrid.vue`: 独立可演示的组件副本
- `src/components/LegacyWaterfall.vue`: 保留旧接口语义的对照组件
- `src/App.vue`: 交互演示页 + API/Usage 说明区
- `src/style.css`: 全局样式
