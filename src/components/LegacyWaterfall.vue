<template>
  <div
    ref="rootRef"
    class="legacy-waterfall"
    :style="{ height: containerHeight + 'px' }"
  >
    <div
      v-for="item in visibleItems"
      :key="item.data.id ?? item.index"
      class="legacy-waterfall__item"
      :style="item.style"
    >
      <slot name="item" :item="item.data" :index="item.index"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowReactive,
  watch,
  type CSSProperties,
} from "vue";

type LegacyItem = {
  id?: string | number;
  resolution?: string | number;
  widthFill?: boolean;
  _height?: number;
  [key: string]: any;
};

type PositionItem = CSSProperties & {
  topValue: number;
  bottomValue: number;
};

const props = withDefaults(
  defineProps<{
    data: LegacyItem[];
    col?: number;
    gap?: number;
    rowGap?: number;
    resolution?: string | number;
    expand?: number;
  }>(),
  {
    col: 2,
    gap: 10,
    expand: 0,
  }
);

const rootRef = ref<HTMLElement>();
const positions = shallowReactive<PositionItem[]>([]);
const containerHeight = ref(0);
let observer: ResizeObserver | null = null;
let containerWidth = 0;
let itemWidth = 0;
let colHeights: number[] = [];

const findColumnIndex = (mode: "min" | "max") => {
  if (colHeights.length < 2) return 0;
  let chosenIndex = 0;
  let chosenValue = colHeights[0];

  for (let index = 1; index < colHeights.length; index++) {
    const current = colHeights[index];
    const shouldReplace =
      mode === "min" ? current < chosenValue : current > chosenValue;
    if (shouldReplace) {
      chosenValue = current;
      chosenIndex = index;
    }
  }

  return chosenIndex;
};

const normalizeRatio = (value?: string | number) => {
  if (!value) return 1.55;
  if (typeof value === "number") return value;

  let parts = value.split("*").map((part) => parseFloat(part) || 0);
  if (parts.length < 2) {
    parts = value.split("/").map((part) => parseFloat(part) || 0);
  }

  if (parts.length < 2 || !parts[0] || !parts[1]) return 1.55;
  return parts[0] / parts[1];
};

const updateLayout = () => {
  const el = rootRef.value;
  if (!el) return;

  containerWidth = el.offsetWidth;
  if (!containerWidth) return;

  itemWidth = (containerWidth - (props.col - 1) * props.gap) / props.col;
  colHeights = Array.from({ length: props.col }, () => 0);
  positions.splice(0, positions.length);

  props.data.forEach((item, index) => {
    const ratio = normalizeRatio(props.resolution ?? item.resolution);
    const isFullWidth = Boolean(item.widthFill);
    const width = isFullWidth ? containerWidth : itemWidth;
    const height = item._height ?? width / ratio + props.expand;
    const minColumnIndex = findColumnIndex("min");
    const maxColumnIndex = findColumnIndex("max");
    const top = isFullWidth
      ? colHeights[maxColumnIndex]
      : colHeights[minColumnIndex];
    const left = isFullWidth ? 0 : minColumnIndex * (itemWidth + props.gap);
    const nextHeight = top + height + (props.rowGap ?? props.gap);

    if (isFullWidth) {
      colHeights = colHeights.map(() => nextHeight);
    } else {
      colHeights[minColumnIndex] = nextHeight;
    }

    positions[index] = {
      left: left + "px",
      top: top + "px",
      width: width + "px",
      height: height + "px",
      topValue: top,
      bottomValue: top + height,
    };
  });

  const maxHeight = Math.max(0, ...colHeights);
  containerHeight.value = positions.length > 0 ? maxHeight - (props.rowGap ?? props.gap) : 0;
};

const visibleItems = computed(() => {
  return positions.map((style, index) => ({
    style,
    index,
    data: props.data[index],
  }));
});

watch(
  () => [
    props.data,
    props.col,
    props.gap,
    props.rowGap,
    props.resolution,
    props.expand,
  ],
  () => {
    updateLayout();
  },
  { deep: true }
);

onMounted(() => {
  updateLayout();
  if (!rootRef.value) return;
  observer = new ResizeObserver(() => updateLayout());
  observer.observe(rootRef.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
});
</script>

<style scoped>
.legacy-waterfall {
  position: relative;
  width: 100%;
}

.legacy-waterfall__item {
  position: absolute;
}
</style>
