import test from "node:test";
import assert from "node:assert/strict";
import { computeMasonryLayout } from "../src/lib/masonry-grid/layout.ts";

test("uniform aspect ratio distributes items to shortest columns", () => {
  const layout = computeMasonryLayout({
    items: [{}, {}, {}],
    containerWidth: 220,
    columns: 2,
    gap: 20,
    rowGap: 20,
    aspectRatio: "1/1",
    extraHeight: 0,
  });

  assert.equal(layout.itemWidth, 100);
  assert.deepEqual(
    layout.positions.map((p) => ({ left: p.left, top: p.top, height: p.height })),
    [
      { left: 0, top: 0, height: 100 },
      { left: 120, top: 0, height: 100 },
      { left: 0, top: 120, height: 100 },
    ]
  );
  assert.equal(layout.containerHeight, 220);
});

test("per-item heights via itemHeight function", () => {
  const heights = [100, 200, 100];
  const layout = computeMasonryLayout({
    items: [{}, {}, {}],
    containerWidth: 220,
    columns: 2,
    gap: 20,
    rowGap: 20,
    extraHeight: 0,
    itemHeight: (_item, index) => heights[index],
  });

  assert.deepEqual(
    layout.positions.map((p) => ({ left: p.left, top: p.top, height: p.height })),
    [
      { left: 0, top: 0, height: 100 },
      { left: 120, top: 0, height: 200 },
      { left: 0, top: 120, height: 100 },
    ]
  );
  assert.equal(layout.containerHeight, 220);
});

test("per-item heights via itemHeight string key", () => {
  const layout = computeMasonryLayout({
    items: [{ h: 180 }, { h: 90 }],
    containerWidth: 210,
    columns: 2,
    gap: 10,
    rowGap: 10,
    extraHeight: 0,
    itemHeight: "h",
  });

  assert.equal(layout.positions[0].height, 180);
  assert.equal(layout.positions[1].height, 90);
});

test("full-row items span entire width", () => {
  const layout = computeMasonryLayout({
    items: [{}, { full: true }, {}],
    containerWidth: 210,
    columns: 2,
    gap: 10,
    rowGap: 10,
    aspectRatio: "1/1",
    extraHeight: 0,
    fullRow: "full",
  });

  // First two normal items: width = (210-10)/2 = 100, height = 100
  // Full-row item starts after max column height (100+10=110)
  assert.equal(layout.positions[1].left, 0);
  assert.equal(layout.positions[1].width, 210);
  assert.equal(layout.positions[1].top, 110);
});

test("extraHeight adds to computed height", () => {
  const layout = computeMasonryLayout({
    items: [{}],
    containerWidth: 100,
    columns: 1,
    gap: 0,
    rowGap: 0,
    aspectRatio: "1/1",
    extraHeight: 50,
  });

  // width=100, ratio=1, so base height=100, + extraHeight=50
  assert.equal(layout.positions[0].height, 150);
});

test("defaults to aspect ratio 1 when no ratio provided", () => {
  const layout = computeMasonryLayout({
    items: [{}],
    containerWidth: 200,
    columns: 1,
    gap: 0,
    rowGap: 0,
    extraHeight: 0,
  });

  // DEFAULT_ASPECT_RATIO = 1, so height = 200/1 = 200
  assert.equal(layout.positions[0].height, 200);
});

test("string aspect ratio with * separator", () => {
  const layout = computeMasonryLayout({
    items: [{}],
    containerWidth: 160,
    columns: 1,
    gap: 0,
    rowGap: 0,
    aspectRatio: "16*9",
    extraHeight: 0,
  });

  assert.equal(layout.positions[0].height, 160 / (16 / 9));
});

test("minAspectRatio and maxAspectRatio clamp the ratio", () => {
  const layoutMin = computeMasonryLayout({
    items: [{}],
    containerWidth: 100,
    columns: 1,
    gap: 0,
    rowGap: 0,
    aspectRatio: "1/4",
    minAspectRatio: 0.5,
    extraHeight: 0,
  });
  // 1/4 = 0.25, clamped to 0.5 → height = 100/0.5 = 200
  assert.equal(layoutMin.positions[0].height, 200);

  const layoutMax = computeMasonryLayout({
    items: [{}],
    containerWidth: 100,
    columns: 1,
    gap: 0,
    rowGap: 0,
    aspectRatio: "16/9",
    maxAspectRatio: 1.5,
    extraHeight: 0,
  });
  // 16/9 ≈ 1.78, clamped to 1.5 → height = 100/1.5
  assert.equal(layoutMax.positions[0].height, 100 / 1.5);
});
