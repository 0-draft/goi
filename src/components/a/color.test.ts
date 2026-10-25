import { describe, expect, it } from "vitest";
import words from "../../data/words.json";
import { assignColors } from "./color";

const ids = words
  .filter((w) => !("pending" in w))
  .sort((a, b) => a.reading.localeCompare(b.reading, "ja"))
  .map((w) => w.id);

describe("assignColors", () => {
  it("隣り合う語（末尾と先頭も）は同じ色にならない", () => {
    const colors = assignColors(ids);
    const bg = ids.map((id) => colors.get(id)?.bg);
    for (let i = 0; i < bg.length; i++) {
      expect(bg[i], `${ids[i]} と ${ids[(i + 1) % bg.length]}`).not.toBe(bg[(i + 1) % bg.length]);
    }
  });

  it("語を1つ足しても色が変わるのは前後の語だけ", () => {
    const before = assignColors(ids);
    const added = [...ids.slice(0, 10), "zz-new", ...ids.slice(10)];
    const after = assignColors(added);
    const changed = ids.filter((id) => before.get(id)?.bg !== after.get(id)?.bg);
    expect(changed.length).toBeLessThanOrEqual(2);
  });
});
