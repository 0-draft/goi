import { describe, expect, it } from "vitest";
import { jsonForScript } from "./json";

describe("jsonForScript", () => {
  it("</script を閉じタグとして出さない", () => {
    const out = jsonForScript({ meaning: "a</script><b>" });
    expect(out).not.toContain("</script");
    expect(JSON.parse(out)).toEqual({ meaning: "a</script><b>" });
  });
});
