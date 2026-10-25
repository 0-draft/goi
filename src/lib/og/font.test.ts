import { afterEach, describe, expect, it, vi } from "vitest";
import { loadFont } from "./font";

const css = (format: string) =>
  `@font-face { font-family: 'X'; src: url(https://fonts.gstatic.com/x) format('${format}'); }`;

function stubFetch(...responses: Response[]) {
  const fn = vi.fn();
  for (const r of responses) fn.mockResolvedValueOnce(r);
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => vi.unstubAllGlobals());

// 取得に失敗したら白紙の画像を出さず、ビルドを止める
describe("loadFont", () => {
  it("TTF を返し、同じ引数では取り直さない", async () => {
    const ttf = new Uint8Array([0, 1, 0, 0, 9]).buffer;
    const fetch = stubFetch(new Response(css("truetype")), new Response(ttf));
    const a = await loadFont("X", 400, "あ");
    const b = await loadFont("X", 400, "あ");
    expect(a).toBe(b);
    expect(fetch).toHaveBeenCalledTimes(2);
    const url = new URL(fetch.mock.calls[0]?.[0]);
    expect(url.searchParams.get("text")).toBe("あ");
    expect(url.searchParams.get("family")).toBe("X:wght@400");
  });

  it("CSS の取得に失敗したら投げる", async () => {
    stubFetch(new Response("", { status: 500 }));
    await expect(loadFont("X", 400, "い")).rejects.toThrow(/500/);
  });

  it("woff2 しか返らなければ投げる", async () => {
    stubFetch(new Response(css("woff2")));
    await expect(loadFont("X", 400, "う")).rejects.toThrow(/TTF\/OTF/);
  });

  it("中身が TTF/OTF でなければ投げる", async () => {
    stubFetch(new Response(css("truetype")), new Response(new Uint8Array([0x77, 0x4f, 0x46, 0x32])));
    await expect(loadFont("X", 400, "え")).rejects.toThrow(/TTF\/OTF でない/);
  });

  it("失敗を覚えず、次は取り直す", async () => {
    stubFetch(new Response("", { status: 503 }));
    await expect(loadFont("X", 700, "お")).rejects.toThrow();
    const ttf = new Uint8Array([0x4f, 0x54, 0x54, 0x4f]).buffer;
    stubFetch(new Response(css("opentype")), new Response(ttf));
    expect((await loadFont("X", 700, "お")).byteLength).toBe(4);
  });
});
