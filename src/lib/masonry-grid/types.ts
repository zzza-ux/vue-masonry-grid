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
export type ScrollTarget = "parent" | "window";
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
  fullRow?: BooleanResolver;
  virtual?: boolean;
  overscan?: number;
  scrollTarget?: ScrollTarget;
}
