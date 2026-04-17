import type { CSSProperties } from "vue";

export type AspectRatio = string | number;
export type ItemKey = string | number;
export type ItemLike = Record<string, any>;
export type KeyResolver = string | ((item: ItemLike, index: number) => ItemKey);
export type BooleanResolver =
  | string
  | ((item: ItemLike, index: number) => boolean);
export type HeightResolver =
  | string
  | ((item: ItemLike, index: number) => number | undefined);
export type AspectRatioResolver =
  | string
  | ((item: ItemLike, index: number) => AspectRatio | undefined);
export type ScrollAlign = "start" | "center" | "end";

export interface MasonryGridProps {
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
  itemAspectRatio?: AspectRatioResolver;
  fullRow?: BooleanResolver;
  virtual?: boolean;
  reuse?: boolean;
  overscan?: number;
}

export interface RenderItem {
  key: ItemKey;
  index: number;
  data: ItemLike;
  style: CSSProperties;
  hidden?: boolean;
  poolSlotId?: number;
}

export interface LayoutSnapshot {
  styles: CSSProperties[];
  tops: number[];
  bottoms: number[];
  height: number;
}
