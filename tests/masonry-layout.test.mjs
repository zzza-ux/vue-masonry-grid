import test from "node:test";
import assert from "node:assert/strict";
import {
  computeMasonryLayout,
  findColumnIndex,
  normalizeAspectRatio,
} from "../src/lib/masonry-grid/layout.js";

test("normalizeAspectRatio handles string and numeric inputs", () => {
  assert.equal(normalizeAspectRatio("3/4"), 0.75);
  assert.equal(normalizeAspectRatio("16*9"), 16 / 9);
  assert.equal(normalizeAspectRatio(1.2), 1.2);
  assert.equal(normalizeAspectRatio(undefined), 1.55);
});

test("normalizeAspectRatio respects min/max clamps", () => {
  assert.equal(normalizeAspectRatio("1/4", 0.5), 0.5);
  assert.equal(normalizeAspectRatio("16/9", undefined, 1.5), 1.5);
});

test("findColumnIndex chooses the smallest or largest column", () => {
  assert.equal(findColumnIndex([10, 4, 8], "min"), 1);
  assert.equal(findColumnIndex([10, 4, 8], "max"), 0);
});

test("computeMasonryLayout distributes uneven cards to shortest columns", () => {
  const layout = computeMasonryLayout({
    items: [
      { resolution: "1/1" },
      { resolution: "1/2" },
      { resolution: "1/1" },
    ],
    containerWidth: 220,
    columns: 2,
    gap: 20,
    rowGap: 20,
    extraHeight: 0,
  });

  assert.equal(layout.itemWidth, 100);
  assert.deepEqual(
    layout.positions.map((item) => ({
      left: item.left,
      top: item.top,
      height: item.height,
    })),
    [
      { left: 0, top: 0, height: 100 },
      { left: 120, top: 0, height: 200 },
      { left: 0, top: 120, height: 100 },
    ]
  );
  assert.equal(layout.containerHeight, 240);
});

test("computeMasonryLayout supports full-row items", () => {
  const layout = computeMasonryLayout({
    items: [
      { resolution: "1/1" },
      { resolution: "2/1", fullRow: true },
      { resolution: "1/1" },
    ],
    containerWidth: 210,
    columns: 2,
    gap: 10,
    rowGap: 10,
    extraHeight: 0,
    fullRow: "fullRow",
  });

  assert.equal(layout.positions[1].left, 0);
  assert.equal(layout.positions[1].width, 210);
  assert.equal(layout.positions[1].top, 110);
  assert.equal(layout.positions[2].top, 225);
});

test("computeMasonryLayout prefers explicit height fields over ratio", () => {
  const layout = computeMasonryLayout({
    items: [{ height: 180 }, { _height: 90 }],
    containerWidth: 210,
    columns: 2,
    gap: 10,
    rowGap: 10,
    extraHeight: 0,
  });

  assert.equal(layout.positions[0].height, 180);
  assert.equal(layout.positions[1].height, 90);
});
