export type LayoutItem = Record<string, any>;

export interface LayoutPosition {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface LayoutResult {
  itemWidth: number;
  positions: LayoutPosition[];
  containerHeight: number;
}

export interface LayoutOptions {
  items: LayoutItem[];
  containerWidth: number;
  columns: number;
  gap: number;
  rowGap: number;
  aspectRatio?: string | number;
  minAspectRatio?: number;
  maxAspectRatio?: number;
  extraHeight: number;
  itemHeight?: string | ((item: LayoutItem, index: number) => number | undefined);
  itemAspectRatio?: string | ((item: LayoutItem, index: number) => string | number | undefined);
  fullRow?: string | ((item: LayoutItem, index: number) => boolean);
}

const DEFAULT_ASPECT_RATIO = 1;

const parseAspectRatio = (
  value: string | number | undefined,
  min?: number,
  max?: number,
): number => {
  if (!value) return DEFAULT_ASPECT_RATIO;
  if (typeof value === "number") return value > 0 ? value : DEFAULT_ASPECT_RATIO;

  const separator = value.includes("*") ? "*" : "/";
  const parts = value.split(separator).map((s) => parseFloat(s) || 0);
  if (parts.length < 2 || !parts[0] || !parts[1]) return DEFAULT_ASPECT_RATIO;

  let ratio = parts[0] / parts[1];
  if (min) ratio = Math.max(min, ratio);
  if (max) ratio = Math.min(max, ratio);
  return ratio;
};

const findColumnIndex = (heights: number[], mode: "min" | "max"): number => {
  if (heights.length < 2) return 0;

  let bestIndex = 0;
  let bestValue = heights[0];
  for (let i = 1; i < heights.length; i++) {
    const current = heights[i];
    const isBetter =
      mode === "min" ? current < bestValue : current > bestValue;
    if (isBetter) {
      bestValue = current;
      bestIndex = i;
    }
  }
  return bestIndex;
};

export const computeMasonryLayout = ({
  items,
  containerWidth,
  columns,
  gap,
  rowGap,
  aspectRatio,
  minAspectRatio,
  maxAspectRatio,
  extraHeight,
  itemHeight,
  itemAspectRatio,
  fullRow,
}: LayoutOptions): LayoutResult => {
  const safeColumns = Math.max(1, columns);
  const baseItemWidth =
    (containerWidth - (safeColumns - 1) * gap) / safeColumns;
  let heights = new Array<number>(safeColumns).fill(0);

  const positions = items.map((item, index) => {
    const isFullRow =
      typeof fullRow === "function"
        ? fullRow(item, index)
        : typeof fullRow === "string"
          ? Boolean(item?.[fullRow])
          : false;

    const width = isFullRow ? containerWidth : baseItemWidth;
    let resolvedHeight: number | undefined;

    if (typeof itemHeight === "function") {
      resolvedHeight = itemHeight(item, index);
    } else if (typeof itemHeight === "string") {
      resolvedHeight = item?.[itemHeight];
    }

    if (!Number.isFinite(resolvedHeight)) {
      let perItemRatio: string | number | undefined;
      if (typeof itemAspectRatio === "function") {
        perItemRatio = itemAspectRatio(item, index);
      } else if (typeof itemAspectRatio === "string") {
        perItemRatio = item?.[itemAspectRatio];
      }
      const ratio = parseAspectRatio(
        perItemRatio ?? aspectRatio,
        minAspectRatio,
        maxAspectRatio,
      );
      resolvedHeight = width / ratio + extraHeight;
    }

    const minColIdx = findColumnIndex(heights, "min");
    const maxColIdx = findColumnIndex(heights, "max");
    const top = isFullRow ? heights[maxColIdx] : heights[minColIdx];
    const left = isFullRow ? 0 : minColIdx * (baseItemWidth + gap);
    const nextHeight = top + resolvedHeight! + rowGap;

    if (isFullRow) {
      heights = heights.map(() => nextHeight);
    } else {
      heights[minColIdx] = nextHeight;
    }

    return { left, top, width, height: resolvedHeight! } as LayoutPosition;
  });

  const maxHeight = Math.max(0, ...heights);
  return {
    itemWidth: baseItemWidth,
    positions,
    containerHeight: positions.length > 0 ? maxHeight - rowGap : 0,
  };
};
