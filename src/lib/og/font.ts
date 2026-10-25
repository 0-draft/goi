// satori は woff2 を読めないので、Google Fonts から TTF を取り寄せる。
// css2 API は User-Agent を見て形式を変える。古いクライアントを名乗ると truetype が返る

const UA = "Mozilla/5.0 (compatible; goi-og/1.0)";

const cache = new Map<string, Promise<ArrayBuffer>>();

/** text に含まれる字だけを持つ TTF を返す。同じ引数の取得はビルド中1回にまとめる */
export function loadFont(family: string, weight: number, text: string): Promise<ArrayBuffer> {
  const key = `${family}:${weight}:${text}`;
  let p = cache.get(key);
  if (!p) {
    p = fetchFont(family, weight, text);
    // 失敗を覚えておくと次の呼び出しも同じ理由で落ちるだけなので消しておく
    p.catch(() => cache.delete(key));
    cache.set(key, p);
  }
  return p;
}

async function fetchFont(family: string, weight: number, text: string): Promise<ArrayBuffer> {
  const css = new URL("https://fonts.googleapis.com/css2");
  css.searchParams.set("family", `${family}:wght@${weight}`);
  css.searchParams.set("text", text);
  const res = await fetch(css, { headers: { "User-Agent": UA } }).catch((cause) => {
    throw new Error(`OGP 用フォントを取りに Google Fonts へ接続できない: ${family} ${weight}`, { cause });
  });
  if (!res.ok) throw new Error(`OGP 用フォントの CSS を取得できない: ${res.status} ${css}`);
  const body = await res.text();
  const src = body.match(/src:\s*url\(([^)]+)\)\s*format\('(truetype|opentype)'\)/);
  if (!src?.[1]) throw new Error(`OGP 用フォントの CSS に TTF/OTF がない: ${family} ${weight}\n${body}`);
  const font = await fetch(src[1]);
  if (!font.ok) throw new Error(`OGP 用フォントを取得できない: ${font.status} ${src[1]}`);
  const buf = await font.arrayBuffer();
  const magic = new DataView(buf).getUint32(0);
  // 0x00010000 = TrueType, "OTTO" = CFF の OpenType
  if (magic !== 0x00010000 && magic !== 0x4f54544f) {
    throw new Error(`OGP 用フォントが TTF/OTF でない: ${family} ${weight}`);
  }
  return buf;
}
