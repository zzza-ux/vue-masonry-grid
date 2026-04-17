<template>
  <div ref="rootRef" class="masonry-grid" :style="rootStyle">
    <div v-for="item in renderedItems" :key="item.key" class="masonry-grid__item" :style="item.style">
      <slot name="item" :item="item.data" :index="item.index"></slot>
      <div v-if="debug" class="masonry-grid__debug">
        <span>key:{{ item.key }}</span>
        <span>idx:{{ item.index }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
  type CSSProperties,
} from "vue";
import type { ItemKey, ItemLike, LayoutSnapshot, MasonryGridProps, RenderItem, ScrollAlign } from "./types";
import { computeMasonryLayout } from "./layout";

const EMPTY_LAYOUT: LayoutSnapshot = {
  styles: [],
  tops: [],
  bottoms: [],
  height: 0,
};

const emit = defineEmits<{
  visibleChange: [
    {
      renderedCount: number;
      mountedCount: number;
      totalCount: number;
      virtual: boolean;
      reuse: boolean;
    }
  ];
}>();

const props = withDefaults(defineProps<MasonryGridProps>(), {
  columns: 2,
  gap: 10,
  extraHeight: 0,
  scaleExtraHeight: false,
  designWidth: 375,
  itemKey: "id",
  virtual: false,
  reuse: false,
  overscan: 200,
});

// ─── DOM refs ───────────────────────────────────────────────
const rootRef = ref<HTMLElement>();

// ─── Layout state (changes only on reflow) ─────────────────
const layoutData = shallowRef<LayoutSnapshot>(EMPTY_LAYOUT);
const containerWidth = ref(0);

// ─── Scroll state (changes on scroll) ──────────────────────
const scrollY = ref(0);
const viewHeight = ref(0);
// Stable offset — only recalculated on layout or container resize,
// never in the scroll hot path (avoids forced reflow from getBoundingClientRect)
const offsetTop = ref(0);

// ─── Internal handles ──────────────────────────────────────
let scrollEl: HTMLElement | Window | null = null;
let rootObserver: ResizeObserver | null = null;
let scrollObserver: ResizeObserver | null = null;
let reflowRaf = 0;
let scrollRaf = 0;

// ─── Reuse pool ────────────────────────────────────────────
const poolItems = shallowRef<RenderItem[]>([]);
const poolMaxSize = ref(0);

const isBrowser = typeof window !== "undefined";

// ─── Derived props ─────────────────────────────────────────
const resolvedRowGap = computed(() => props.rowGap ?? props.gap);
const scaledExtraHeight = computed(() => {
  if (!props.scaleExtraHeight) return props.extraHeight;
  if (!containerWidth.value || !props.designWidth) return props.extraHeight;
  return (props.extraHeight / props.designWidth) * containerWidth.value;
});

const rootStyle = computed(() => ({ height: layoutData.value.height + "px" }));

// ─── Helpers ───────────────────────────────────────────────
const resolveItemKey = (item: ItemLike, index: number): ItemKey => {
  if (typeof props.itemKey === "function") return props.itemKey(item, index);
  return item?.[props.itemKey] ?? index;
};

const readScrollTop = (): number => {
  if (!scrollEl) return 0;
  if (scrollEl === window) return window.scrollY || 0;
  return (scrollEl as HTMLElement).scrollTop;
};

const readViewHeight = (): number => {
  if (!scrollEl) return 0;
  if (scrollEl === window) return window.innerHeight || 0;
  return (scrollEl as HTMLElement).clientHeight;
};

const updateOffsetTop = () => {
  const el = rootRef.value;
  if (!el || !scrollEl) return;
  if (scrollEl === window) {
    offsetTop.value =
      el.getBoundingClientRect().top + (window.scrollY || 0);
  } else {
    const parent = scrollEl as HTMLElement;
    offsetTop.value =
      el.getBoundingClientRect().top +
      parent.scrollTop -
      parent.getBoundingClientRect().top;
  }
};

const syncScrollState = () => {
  scrollY.value = readScrollTop();
  viewHeight.value = readViewHeight();
};

const findScrollParent = (el: HTMLElement): HTMLElement | Window => {
  let parent = el.parentElement;
  while (parent) {
    const { overflowY } = getComputedStyle(parent);
    if (/(auto|scroll|overlay)/.test(overflowY)) return parent;
    parent = parent.parentElement;
  }
  return window;
};

// ─── Layout computation ────────────────────────────────────
const doLayout = () => {
  if (reflowRaf) {
    cancelAnimationFrame(reflowRaf);
    reflowRaf = 0;
  }

  const el = rootRef.value;
  if (!el) return;

  containerWidth.value = el.offsetWidth;
  if (!containerWidth.value) return;

  const result = computeMasonryLayout({
    items: props.data,
    containerWidth: containerWidth.value,
    columns: Math.max(1, props.columns),
    gap: props.gap,
    rowGap: resolvedRowGap.value,
    aspectRatio: props.aspectRatio,
    minAspectRatio: props.minAspectRatio,
    maxAspectRatio: props.maxAspectRatio,
    extraHeight: scaledExtraHeight.value,
    itemHeight: props.itemHeight,
    itemAspectRatio: props.itemAspectRatio,
    fullRow: props.fullRow,
  });

  const n = result.positions.length;
  const styles: CSSProperties[] = new Array(n);
  const tops: number[] = new Array(n);
  const bottoms: number[] = new Array(n);

  for (let i = 0; i < n; i++) {
    const p = result.positions[i];
    styles[i] = {
      left: p.left + "px",
      top: p.top + "px",
      width: p.width + "px",
      height: p.height + "px",
    };
    tops[i] = p.top;
    bottoms[i] = p.top + p.height;
  }

  // Single reactive trigger — replaces shallowReactive splice
  layoutData.value = { styles, tops, bottoms, height: result.containerHeight };

  // DOM reads for offset (safe here — not in scroll hot path)
  updateOffsetTop();
  syncScrollState();
};

const scheduleReflow = () => {
  if (!isBrowser) return;
  if (reflowRaf) cancelAnimationFrame(reflowRaf);
  reflowRaf = requestAnimationFrame(() => {
    reflowRaf = 0;
    doLayout();
  });
};

// ─── Scroll handling (RAF-batched) ─────────────────────────
const onScroll = () => {
  if (scrollRaf) return;
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = 0;
    scrollY.value = readScrollTop();
    viewHeight.value = readViewHeight();
  });
};

const bindScrollContainer = () => {
  if (!rootRef.value || !isBrowser) return;
  unbindScrollContainer();

  scrollEl = findScrollParent(rootRef.value);

  scrollEl.addEventListener("scroll", onScroll, { passive: true });

  if (scrollEl !== window) {
    const parent = scrollEl as HTMLElement;
    scrollObserver = new ResizeObserver(() => {
      updateOffsetTop();
      syncScrollState();
    });
    scrollObserver.observe(parent);
  }

  syncScrollState();
};

const unbindScrollContainer = () => {
  if (scrollRaf) {
    cancelAnimationFrame(scrollRaf);
    scrollRaf = 0;
  }
  if (!scrollEl) return;
  scrollEl.removeEventListener("scroll", onScroll as EventListener);
  scrollEl = null;
  scrollObserver?.disconnect();
  scrollObserver = null;
};

// ─── Virtual scroll: visible items ─────────────────────────
const rawRenderedItems = computed<RenderItem[]>(() => {
  const { styles, tops, bottoms } = layoutData.value;
  // Guard: data may shrink before layoutData catches up (RAF-deferred reflow)
  const n = Math.min(styles.length, props.data.length);
  if (!n) return [];

  const data = props.data;

  // Non-virtual fast path — skip visibility checks entirely
  if (!props.virtual) {
    const list: RenderItem[] = new Array(n);
    for (let i = 0; i < n; i++) {
      list[i] = {
        key: resolveItemKey(data[i], i),
        index: i,
        data: data[i],
        style: styles[i],
      };
    }
    return list;
  }

  // Virtual mode — only items overlapping viewport + overscan
  const os = props.overscan;
  const off = offsetTop.value;
  const minTop = scrollY.value - os - off;
  const maxBottom = scrollY.value + viewHeight.value + os - off;

  const list: RenderItem[] = [];
  for (let i = 0; i < n; i++) {
    if (bottoms[i] > minTop && tops[i] < maxBottom) {
      list.push({
        key: resolveItemKey(data[i], i),
        index: i,
        data: data[i],
        style: styles[i],
      });
    }
  }
  return list;
});

// ─── Reuse pool ────────────────────────────────────────────
watch(
  rawRenderedItems,
  (items) => {
    if (!props.virtual || !props.reuse) {
      poolItems.value = items;
      return;
    }

    poolMaxSize.value = Math.max(poolMaxSize.value, items.length);
    const maxSlots = poolMaxSize.value;

    const prev = poolItems.value;
    const prevByIndex = new Map<number, RenderItem>();
    const prevBySlot = new Map<number, RenderItem>();
    for (const item of prev) {
      if (item.poolSlotId !== undefined) {
        prevBySlot.set(item.poolSlotId, item);
        if (!item.hidden) prevByIndex.set(item.index, item);
      }
    }

    // Fast path: visible set AND style refs unchanged — skip entirely.
    // Style-ref check is critical: on reflow (gap/columns/etc.) the same
    // indices stay visible but get new style objects — we must update.
    if (items.length === prevByIndex.size) {
      let same = true;
      for (const item of items) {
        const matched = prevByIndex.get(item.index);
        if (!matched || matched.style !== item.style) { same = false; break; }
      }
      if (same) return;
    }

    const next: RenderItem[] = [];
    const usedSlots = new Set<number>();
    const assignedIndices = new Set<number>();

    // Phase 1: retain existing slot assignments for still-visible items
    // Reuse exact object reference when style/data unchanged (scroll-only);
    // create new object with updated style on layout reflow, keeping same slot
    for (const item of items) {
      const matched = prevByIndex.get(item.index);
      if (matched?.poolSlotId !== undefined) {
        const reusable = item.style === matched.style && item.data === matched.data;
        next.push(reusable ? matched : {
          ...item,
          key: `reuse-${matched.poolSlotId}`,
          poolSlotId: matched.poolSlotId,
        });
        usedSlots.add(matched.poolSlotId);
        assignedIndices.add(item.index);
      }
    }

    // Phase 2: assign free slots to newly visible items (cursor avoids O(n²))
    let cursor = 0;
    for (const item of items) {
      if (assignedIndices.has(item.index)) continue;
      while (cursor < maxSlots && usedSlots.has(cursor)) cursor++;
      if (cursor >= maxSlots) break;
      next.push({
        ...item,
        key: `reuse-${cursor}`,
        poolSlotId: cursor,
      });
      usedSlots.add(cursor);
      cursor++;
    }

    // Phase 3: hide unused slots to keep DOM alive
    for (let slotId = 0; slotId < maxSlots; slotId++) {
      if (usedSlots.has(slotId)) continue;
      const old = prevBySlot.get(slotId);
      if (!old) continue;
      // Already hidden — reuse exact reference
      if (old.hidden) {
        next.push(old);
      } else {
        next.push({
          ...old,
          key: `reuse-${slotId}`,
          poolSlotId: slotId,
          hidden: true,
          style: { ...old.style, display: "none" },
        });
      }
    }

    // Stable DOM order
    next.sort((a, b) => (a.poolSlotId ?? 0) - (b.poolSlotId ?? 0));
    poolItems.value = next;
  },
  { immediate: true }
);

// ─── Final render list ─────────────────────────────────────
const renderedItems = computed<RenderItem[]>(() => {
  return props.virtual && props.reuse
    ? poolItems.value
    : rawRenderedItems.value;
});

// ─── Emit visibility stats ─────────────────────────────────
watch(
  renderedItems,
  (items) => {
    emit("visibleChange", {
      renderedCount: rawRenderedItems.value.length,
      mountedCount:
        props.virtual && props.reuse ? poolMaxSize.value : items.length,
      totalCount: props.data.length,
      virtual: props.virtual,
      reuse: props.reuse,
    });
  },
  { immediate: true }
);

// ─── Public API ────────────────────────────────────────────
const reflow = async () => {
  await nextTick();
  bindScrollContainer();
  doLayout();
};

const reset = async () => {
  layoutData.value = EMPTY_LAYOUT;
  poolMaxSize.value = 0;
  poolItems.value = [];
  await reflow();
};

const scrollToIndex = (index: number, align: ScrollAlign = "start") => {
  const { tops, bottoms } = layoutData.value;
  if (index < 0 || index >= tops.length || !scrollEl) return;

  const itemTop = tops[index] + offsetTop.value;
  const itemH = bottoms[index] - tops[index];
  let target = itemTop;
  if (align === "center") target -= viewHeight.value / 2 - itemH / 2;
  if (align === "end") target -= viewHeight.value - itemH;

  const opts: ScrollToOptions = {
    top: Math.max(0, target),
    behavior: "smooth",
  };

  if (scrollEl === window) {
    window.scrollTo(opts);
  } else {
    (scrollEl as HTMLElement).scrollTo(opts);
  }
};

defineExpose({ reflow, reset, scrollToIndex });

// ─── Watchers ──────────────────────────────────────────────
// Layout-affecting props only — virtual/reuse/overscan/itemKey don't need reflow
watch(
  () => [
    props.data,
    props.data.length,
    props.columns,
    props.gap,
    props.rowGap,
    props.aspectRatio,
    props.minAspectRatio,
    props.maxAspectRatio,
    props.extraHeight,
    props.scaleExtraHeight,
    props.designWidth,
    props.itemHeight,
    props.itemAspectRatio,
    props.fullRow,
  ],
  scheduleReflow
);

// ─── Lifecycle ─────────────────────────────────────────────
onMounted(() => {
  if (!rootRef.value || !isBrowser) return;
  bindScrollContainer();
  rootObserver = new ResizeObserver(scheduleReflow);
  rootObserver.observe(rootRef.value);
  doLayout();
});

onBeforeUnmount(() => {
  if (reflowRaf) cancelAnimationFrame(reflowRaf);
  rootObserver?.disconnect();
  unbindScrollContainer();
});
</script>

<style scoped>
.masonry-grid {
  position: relative;
  width: 100%;
}

.masonry-grid__item {
  position: absolute;
}

.masonry-grid__debug {
  position: absolute;
  right: 4px;
  bottom: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font: 11px/1 monospace;
  color: #fff;
  pointer-events: none;
}

.masonry-grid__debug span {
  padding: 2px 5px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.45);
}
</style>
