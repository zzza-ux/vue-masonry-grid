<template>
  <div
    ref="rootRef"
    class="masonry-grid"
    :style="{ height: containerHeight + 'px' }"
  >
    <div
      v-for="item in renderedItems"
      :key="item.key"
      class="masonry-grid__item"
      :style="item.style"
    >
      <slot name="item" :item="item.data" :index="item.index"></slot>
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
  shallowReactive,
  watch,
  type CSSProperties,
} from "vue";
import type { ItemKey, ItemLike, MasonryGridProps, ScrollAlign } from "./types";
import { computeMasonryLayout } from "./layout.js";

interface MasonryPosition {
  style: CSSProperties;
  topValue: number;
  bottomValue: number;
}

interface RenderItem {
  key: ItemKey;
  index: number;
  data: ItemLike;
  style: CSSProperties;
  hidden?: boolean;
  poolSlotId?: number;
}

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
  scrollTarget: "parent",
});

const rootRef = ref<HTMLElement>();
const positions = shallowReactive<MasonryPosition[]>([]);
const containerWidth = ref(0);
const containerHeight = ref(0);
const viewportHeight = ref(0);
const scrollTop = ref(0);
const containerOffsetTop = ref(0);

let colHeights: number[] = [];
let scrollContainer: HTMLElement | Window | null = null;
let rootObserver: ResizeObserver | null = null;
let scrollObserver: ResizeObserver | null = null;
let reflowRaf = 0;

const pooledRenderedItems = ref<RenderItem[]>([]);
const poolSize = ref(0);

const isBrowser = typeof window !== "undefined";
const resolvedRowGap = computed(() => props.rowGap ?? props.gap);
const scaledExtraHeight = computed(() => {
  if (!props.scaleExtraHeight) return props.extraHeight;
  if (!containerWidth.value || !props.designWidth) return props.extraHeight;
  return (props.extraHeight / props.designWidth) * containerWidth.value;
});

const resolveItemKey = (item: ItemLike, index: number): ItemKey => {
  if (typeof props.itemKey === "function") return props.itemKey(item, index);
  const key = item?.[props.itemKey];
  return key ?? index;
};

const resetReusePool = () => {
  poolSize.value = 0;
  pooledRenderedItems.value = [];
};

const computeLayout = () => {
  const el = rootRef.value;
  if (!el) return;
  resetReusePool();
  const columns = Math.max(1, props.columns);
  containerWidth.value = el.offsetWidth;
  if (!containerWidth.value) return;

  const layout = computeMasonryLayout({
    items: props.data,
    containerWidth: containerWidth.value,
    columns,
    gap: props.gap,
    rowGap: resolvedRowGap.value,
    aspectRatio: props.aspectRatio,
    minAspectRatio: props.minAspectRatio,
    maxAspectRatio: props.maxAspectRatio,
    extraHeight: scaledExtraHeight.value,
    itemHeight: props.itemHeight,
    fullRow: props.fullRow,
  });

  positions.splice(0, positions.length);
  layout.positions.forEach((position, index) => {
    positions[index] = {
      style: {
        left: position.left + "px",
        top: position.top + "px",
        width: position.width + "px",
        height: position.height + "px",
      },
      topValue: position.topValue,
      bottomValue: position.bottomValue,
    };
  });

  containerHeight.value = layout.containerHeight;
  updateContainerMetrics();
};

const getWindowScrollTop = () => {
  if (!isBrowser) return 0;
  return (
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  );
};

const getWindowHeight = () => {
  if (!isBrowser) return 0;
  return window.innerHeight || document.documentElement.clientHeight || 0;
};

const getScrollParent = (el: HTMLElement) => {
  let parent = el.parentElement;
  while (parent) {
    const style = window.getComputedStyle(parent);
    const overflowY = style.overflowY;
    if (/(auto|scroll|overlay)/.test(overflowY)) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return window;
};

const updateContainerMetrics = () => {
  const el = rootRef.value;
  if (!el || !scrollContainer) return;

  if (scrollContainer === window) {
    viewportHeight.value = getWindowHeight();
    scrollTop.value = getWindowScrollTop();
    containerOffsetTop.value =
      el.getBoundingClientRect().top + getWindowScrollTop();
    return;
  }

  const parent = scrollContainer as HTMLElement;
  viewportHeight.value = parent.clientHeight;
  scrollTop.value = parent.scrollTop;
  containerOffsetTop.value =
    el.getBoundingClientRect().top +
    parent.scrollTop -
    parent.getBoundingClientRect().top;
};

const onScroll = () => {
  updateContainerMetrics();
};

const bindScrollContainer = () => {
  if (!rootRef.value || !isBrowser) return;
  unbindScrollContainer();

  scrollContainer =
    props.scrollTarget === "window" ? window : getScrollParent(rootRef.value);
  scrollContainer.addEventListener("scroll", onScroll, { passive: true });

  if (scrollContainer === window) {
    viewportHeight.value = getWindowHeight();
  } else {
    const parent = scrollContainer as HTMLElement;
    viewportHeight.value = parent.clientHeight;
    scrollObserver = new ResizeObserver(() => updateContainerMetrics());
    scrollObserver.observe(parent);
  }

  updateContainerMetrics();
};

const unbindScrollContainer = () => {
  if (!scrollContainer) return;
  scrollContainer.removeEventListener("scroll", onScroll as EventListener);
  scrollContainer = null;
  scrollObserver?.disconnect();
  scrollObserver = null;
};

const scheduleReflow = () => {
  if (!isBrowser) return;
  if (reflowRaf) cancelAnimationFrame(reflowRaf);
  reflowRaf = requestAnimationFrame(() => {
    reflowRaf = 0;
    computeLayout();
  });
};

const rawRenderedItems = computed<RenderItem[]>(() => {
  const list: RenderItem[] = [];
  const minVisibleTop = scrollTop.value - props.overscan;
  const maxVisibleBottom =
    scrollTop.value + viewportHeight.value + props.overscan;

  positions.forEach((position, index) => {
    if (!position) return;
    const top = position.topValue + containerOffsetTop.value;
    const bottom = position.bottomValue + containerOffsetTop.value;
    const isVisible =
      !props.virtual || (bottom > minVisibleTop && top < maxVisibleBottom);
    if (!isVisible) return;

    list.push({
      key: resolveItemKey(props.data[index], index),
      index,
      data: props.data[index],
      style: position.style,
    });
  });

  return list;
});

watch(
  rawRenderedItems,
  (items) => {
    if (!props.virtual || !props.reuse) {
      pooledRenderedItems.value = items;
      return;
    }

    poolSize.value = Math.max(poolSize.value, items.length);

    const previousItems = pooledRenderedItems.value;
    const previousByIndex = new Map(
      previousItems
        .filter((item) => !item.hidden)
        .map((item) => [item.index, item] as const)
    );
    const previousBySlot = new Map(
      previousItems.map((item) => [item.poolSlotId ?? -1, item] as const)
    );

    const nextItems: RenderItem[] = [];
    const usedSlotIds = new Set<number>();

    items.forEach((item) => {
      const matched = previousByIndex.get(item.index);
      if (matched?.poolSlotId === undefined) return;

      nextItems.push({
        ...item,
        key: `reuse-${matched.poolSlotId}`,
        poolSlotId: matched.poolSlotId,
      });
      usedSlotIds.add(matched.poolSlotId);
    });

    items.forEach((item) => {
      if (nextItems.some((existing) => existing.index === item.index)) return;

      let slotId;
      for (let index = 0; index < poolSize.value; index++) {
        if (!usedSlotIds.has(index)) {
          slotId = index;
          break;
        }
      }

      if (slotId === undefined) return;

      nextItems.push({
        ...item,
        key: `reuse-${slotId}`,
        poolSlotId: slotId,
      });
      usedSlotIds.add(slotId);
    });

    for (let slotId = 0; slotId < poolSize.value; slotId++) {
      if (usedSlotIds.has(slotId)) continue;

      const previous = previousBySlot.get(slotId);
      if (!previous) continue;

      nextItems.push({
        ...previous,
        key: `reuse-${slotId}`,
        poolSlotId: slotId,
        hidden: true,
        style: {
          ...previous.style,
          display: "none",
        },
      });
    }

    pooledRenderedItems.value = nextItems.sort((a, b) => {
      return (a.poolSlotId ?? 0) - (b.poolSlotId ?? 0);
    });
  },
  { immediate: true }
);

const renderedItems = computed<RenderItem[]>(() => {
  if (!props.virtual || !props.reuse) return rawRenderedItems.value;
  return pooledRenderedItems.value;
});

watch(
  renderedItems,
  (items) => {
    emit("visibleChange", {
      renderedCount: rawRenderedItems.value.length,
      mountedCount: items.length,
      totalCount: props.data.length,
      virtual: props.virtual,
      reuse: props.reuse,
    });
  },
  { immediate: true }
);

const reflow = async () => {
  await nextTick();
  bindScrollContainer();
  computeLayout();
};

const reset = async () => {
  positions.splice(0, positions.length);
  containerHeight.value = 0;
  resetReusePool();
  await reflow();
};

const scrollToIndex = (index: number, align: ScrollAlign = "start") => {
  const target = positions[index];
  if (!target || !scrollContainer) return;

  let nextTop = target.topValue + containerOffsetTop.value;
  if (align === "center") {
    nextTop -=
      viewportHeight.value / 2 - (target.bottomValue - target.topValue) / 2;
  }
  if (align === "end") {
    nextTop -= viewportHeight.value - (target.bottomValue - target.topValue);
  }

  if (scrollContainer === window) {
    window.scrollTo({ top: Math.max(0, nextTop), behavior: "smooth" });
    return;
  }

  const parent = scrollContainer as HTMLElement;
  parent.scrollTo({ top: Math.max(0, nextTop), behavior: "smooth" });
};

defineExpose({
  reflow,
  reset,
  scrollToIndex,
});

watch(() => props.data, scheduleReflow);
watch(() => props.data.length, scheduleReflow);
watch(
  () => [
    props.columns,
    props.gap,
    props.rowGap,
    props.aspectRatio,
    props.minAspectRatio,
    props.maxAspectRatio,
    props.extraHeight,
    props.scaleExtraHeight,
    props.designWidth,
    props.virtual,
    props.reuse,
    props.overscan,
    props.scrollTarget,
    props.itemKey,
    props.itemHeight,
    props.fullRow,
  ],
  scheduleReflow
);

onMounted(() => {
  if (!rootRef.value || !isBrowser) return;
  bindScrollContainer();
  rootObserver = new ResizeObserver(scheduleReflow);
  rootObserver.observe(rootRef.value);
  computeLayout();
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
</style>
