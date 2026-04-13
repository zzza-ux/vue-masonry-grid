/**
 * @typedef {Record<string, any>} LayoutItem
 */

/**
 * @param {string | number | undefined} value
 * @param {number | undefined} minAspectRatio
 * @param {number | undefined} maxAspectRatio
 */
export const normalizeAspectRatio = (value, minAspectRatio, maxAspectRatio) => {
  if (!value) return 1.55;
  if (typeof value === "number") {
    return value > 0 ? value : 1.55;
  }

  let parts = value.split("*").map((part) => parseFloat(part) || 0);
  if (parts.length < 2) {
    parts = value.split("/").map((part) => parseFloat(part) || 0);
  }
  if (parts.length < 2 || !parts[0] || !parts[1]) return 1.55;

  let ratio = parts[0] / parts[1];
  if (minAspectRatio) ratio = Math.max(minAspectRatio, ratio);
  if (maxAspectRatio) ratio = Math.min(maxAspectRatio, ratio);
  return ratio;
};

/**
 * @param {number[]} heights
 * @param {"min" | "max"} mode
 */
export const findColumnIndex = (heights, mode) => {
  if (heights.length < 2) return 0;

  let selectedIndex = 0;
  let selectedValue = heights[0];
  for (let index = 1; index < heights.length; index++) {
    const current = heights[index];
    const shouldReplace =
      mode === "min" ? current < selectedValue : current > selectedValue;
    if (shouldReplace) {
      selectedValue = current;
      selectedIndex = index;
    }
  }
  return selectedIndex;
};

/**
 * @param {object} options
 * @param {LayoutItem[]} options.items
 * @param {number} options.containerWidth
 * @param {number} options.columns
 * @param {number} options.gap
 * @param {number} options.rowGap
 * @param {string | number | undefined} options.aspectRatio
 * @param {number | undefined} options.minAspectRatio
 * @param {number | undefined} options.maxAspectRatio
 * @param {number} options.extraHeight
 * @param {string | ((item: LayoutItem, index: number) => number | undefined) | undefined} options.itemHeight
 * @param {string | ((item: LayoutItem, index: number) => boolean) | undefined} options.fullRow
 */
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
  fullRow,
}) => {
  const safeColumns = Math.max(1, columns);
  const baseItemWidth =
    (containerWidth - (safeColumns - 1) * gap) / safeColumns;
  /** @type {number[]} */
  let heights = Array.from({ length: safeColumns }, () => 0);

  const positions = items.map((item, index) => {
    const isFullRow =
      typeof fullRow === "function"
        ? fullRow(item, index)
        : typeof fullRow === "string"
        ? Boolean(item?.[fullRow])
        : Boolean(item?.fullRow ?? item?.widthFill);

    const width = isFullRow ? containerWidth : baseItemWidth;
    let resolvedHeight;

    if (typeof itemHeight === "function") {
      resolvedHeight = itemHeight(item, index);
    } else if (typeof itemHeight === "string") {
      resolvedHeight = item?.[itemHeight];
    }
    if (!Number.isFinite(resolvedHeight)) {
      resolvedHeight = item?.height ?? item?._height;
    }
    if (!Number.isFinite(resolvedHeight)) {
      const ratio = normalizeAspectRatio(
        aspectRatio ?? item?.aspectRatio ?? item?.resolution,
        minAspectRatio,
        maxAspectRatio
      );
      resolvedHeight = width / ratio + extraHeight;
    }

    const minColumnIndex = findColumnIndex(heights, "min");
    const maxColumnIndex = findColumnIndex(heights, "max");
    const top = isFullRow ? heights[maxColumnIndex] : heights[minColumnIndex];
    const left = isFullRow ? 0 : minColumnIndex * (baseItemWidth + gap);
    const nextHeight = top + resolvedHeight + rowGap;

    if (isFullRow) {
      heights = heights.map(() => nextHeight);
    } else {
      heights[minColumnIndex] = nextHeight;
    }

    return {
      left,
      top,
      width,
      height: resolvedHeight,
      topValue: top,
      bottomValue: top + resolvedHeight,
    };
  });

  return {
    itemWidth: baseItemWidth,
    positions,
    containerHeight: Math.max(0, ...heights),
  };
};
