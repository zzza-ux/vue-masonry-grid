# MasonryGrid 中文演示项目

独立示例项目，放在 `/Users/mac/Desktop/thrid/masonry-grid-demo`，用于演示 `MasonryGrid` 的核心能力：

- 多列瀑布流
- 不同宽高比卡片
- 虚拟滚动开关
- 容器滚动 / `window` 滚动切换
- `scrollToIndex()` 调用示例
- API 说明卡片
- 可复制的基础接入代码片段
- `LegacyWaterfall` 与 `MasonryGrid` 的迁移对比区
- 长列表压力测试与虚拟滚动收益展示

## 运行

如果当前机器上已经有 `/Users/mac/Desktop/work/one/one-h5-client/node_modules`，这个 demo 可以通过软链接直接复用依赖。

```bash
cd /Users/mac/Desktop/thrid/masonry-grid-demo
npm run dev
```

## 文件

- `src/lib/masonry-grid/MasonryGrid.vue`: 组件实现
- `src/lib/masonry-grid/types.ts`: 对外类型定义
- `src/lib/masonry-grid/index.ts`: 组件导出入口
- `src/lib/masonry-grid/layout.js`: 可单测的核心布局逻辑
- `src/components/LegacyWaterfall.vue`: 保留旧接口语义的对照组件
- `src/App.vue`: 中文交互演示页 + API/用法说明区
- `tests/masonry-layout.test.mjs`: 布局单元测试
- `src/style.css`: 全局样式
