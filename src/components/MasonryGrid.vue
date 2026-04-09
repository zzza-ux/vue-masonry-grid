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

type AspectRatio = string | number;
type ItemKey = string | number;
type ItemLike = Record<string, any>;
type KeyResolver = string | ((item: ItemLike, index: number) => ItemKey);
type BooleanResolver = string | ((item: ItemLike, index: number) => boolean);
type HeightResolver =
  | string
  | ((item: ItemLike, index: number) => number | undefined);
type ScrollTarget = "parent" | "window";
type ScrollAlign = "start" | "center" | "end";

interface MasonryPosition {
  style: CSSProperties;
  topValue: number;
  bottomValue: number;
}

interface MasonryGridProps {
  data: ItemLike[];
  columns?: number;
  gap?: number;
  rowGap?: number;
  aspectRatio?: AspectRatio;
  minAspectRatio?: number;
  maxAspectRatio?: number;
  extraHeight?: number;
  scaleExtraHeight?: boolean;
  designWidth?: number;
  itemKey?: KeyResolver;
  itemHeight?: HeightResolver;
  fullRow?: BooleanResolver;
  virtual?: boolean;
  overscan?: number;
  scrollTarget?: ScrollTarget;
}

interface RenderItem {
  key: ItemKey;
  index: number;
  data: ItemLike;
  style: CSSProperties;
}

const props = withDefaults(defineProps<MasonryGridProps>(), {
  columns: 2,
  gap: 10,
  extraHeight: 0,
  scaleExtraHeight: false,
  designWidth: 375,
  itemKey: "id",
  virtual: false,
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

const isBrowser = typeof window !== "undefined";
const resolvedRowGap = computed(() => props.rowGap ?? props.gap);
const scaledExtraHeight = computed(() => {
  if (!props.scaleExtraHeight) return props.extraHeight;
  if (!containerWidth.value || !props.designWidth) return props.extraHeight;
  return (props.extraHeight / props.designWidth) * containerWidth.value;
});

const findColumnIndex = (mode: "min" | "max") => {
  if (colHeights.length < 2) return 0;
  let selectedIndex = 0;
  let selectedValue = colHeights[0];
  for (let index = 1; index < colHeights.length; index++) {
    const current = colHeights[index];
    const shouldReplace =
      mode === "min" ? current < selectedValue : current > selectedValue;
    if (shouldReplace) {
      selectedValue = current;
      selectedIndex = index;
    }
  }
  return selectedIndex;
};

const normalizeAspectRatio = (value?: AspectRatio) => {
  if (!value) return 1.55;
  if (typeof value === "number") return value > 0 ? value : 1.55;

  let parts = value.split("*").map((part) => parseFloat(part) || 0);
  if (parts.length < 2) {
    parts = value.split("/").map((part) => parseFloat(part) || 0);
  }
  if (parts.length < 2 || !parts[0] || !parts[1]) return 1.55;

  let ratio = parts[0] / parts[1];
  if (props.minAspectRatio) ratio = Math.max(props.minAspectRatio, ratio);
  if (props.maxAspectRatio) ratio = Math.min(props.maxAspectRatio, ratio);
  return ratio;
};

const resolveItemKey = (item: ItemLike, index: number): ItemKey => {
  if (typeof props.itemKey === "function") return props.itemKey(item, index);
  const key = item?.[props.itemKey];
  return key ?? index;
};

const resolveFullRow = (item: ItemLike, index: number) => {
  if (typeof props.fullRow === "function") return props.fullRow(item, index);
  if (typeof props.fullRow === "string") return Boolean(item?.[props.fullRow]);
  return Boolean(item?.fullRow ?? item?.widthFill);
};

const resolveItemHeight = (item: ItemLike, index: number, width: number) => {
  if (typeof props.itemHeight === "function") {
    const height = props.itemHeight(item, index);
    if (typeof height === "number" && Number.isFinite(height)) return height;
  } else if (typeof props.itemHeight === "string") {
    const height = item?.[props.itemHeight];
    if (typeof height === "number" && Number.isFinite(height)) return height;
  }

  const directHeight = item?.height ?? item?._height;
  if (typeof directHeight === "number" && Number.isFinite(directHeight))
    return directHeight;

  const rawRatio = props.aspectRatio ?? item?.aspectRatio ?? item?.resolution;
  const ratio = normalizeAspectRatio(rawRatio);
  return width / ratio + scaledExtraHeight.value;
};

const computeLayout = () => {
  const el = rootRef.value;
  if (!el) return;
  const columns = Math.max(1, props.columns);
  containerWidth.value = el.offsetWidth;
  if (!containerWidth.value) return;

  const baseItemWidth =
    (containerWidth.value - (columns - 1) * props.gap) / columns;
  colHeights = Array.from({ length: columns }, () => 0);
  positions.splice(0, positions.length);

  props.data.forEach((item, index) => {
    const isFullRow = resolveFullRow(item, index);
    const width = isFullRow ? containerWidth.value : baseItemWidth;
    const height = resolveItemHeight(item, index, width);
    const minColumnIndex = findColumnIndex("min");
    const maxColumnIndex = findColumnIndex("max");
    const top = isFullRow
      ? colHeights[maxColumnIndex]
      : colHeights[minColumnIndex];
    const left = isFullRow ? 0 : minColumnIndex * (baseItemWidth + props.gap);
    const nextHeight = top + height + resolvedRowGap.value;

    if (isFullRow) {
      colHeights = colHeights.map(() => nextHeight);
    } else {
      colHeights[minColumnIndex] = nextHeight;
    }

    positions[index] = {
      style: {
        left: left + "px",
        top: top + "px",
        width: width + "px",
        height: height + "px",
      },
      topValue: top,
      bottomValue: top + height,
    };
  });

  containerHeight.value = Math.max(0, ...colHeights);
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
    const canScroll = /(auto|scroll|overlay)/.test(overflowY);
    if (canScroll && parent.scrollHeight > parent.clientHeight) {
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

const renderedItems = computed<RenderItem[]>(() => {
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

const reflow = async () => {
  await nextTick();
  bindScrollContainer();
  computeLayout();
};

const reset = async () => {
  positions.splice(0, positions.length);
  containerHeight.value = 0;
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
