export type LayoutItem = Record<string, any>;

export declare const normalizeAspectRatio: (
  value: string | number | undefined,
  minAspectRatio?: number,
  maxAspectRatio?: number
) => number;

export declare const findColumnIndex: (
  heights: number[],
  mode: "min" | "max"
) => number;

export declare const computeMasonryLayout: (options: {
  items: LayoutItem[];
  containerWidth: number;
  columns: number;
  gap: number;
  rowGap: number;
  aspectRatio?: string | number;
  minAspectRatio?: number;
  maxAspectRatio?: number;
  extraHeight: number;
  itemHeight?:
    | string
    | ((item: LayoutItem, index: number) => number | undefined);
  fullRow?: string | ((item: LayoutItem, index: number) => boolean);
}) => {
  itemWidth: number;
  positions: Array<{
    left: number;
    top: number;
    width: number;
    height: number;
    topValue: number;
    bottomValue: number;
  }>;
  containerHeight: number;
};
