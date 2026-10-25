import type { Word } from "../../lib/schema";
import { toRomaji } from "./romaji";

// 種別ごとに一本の路線として扱う。記号は駅ナンバリングの路線記号にあたる
export interface Line {
  kind: string;
  code: string;
  color: string;
}

const KNOWN: Record<string, Omit<Line, "kind">> = {
  ことわざ: { code: "KW", color: "#2F7D6D" },
  四字熟語: { code: "YJ", color: "#3B5BA9" },
  慣用句: { code: "KY", color: "#8A8F3A" },
};

const OTHER_COLOR = "#6B5B95";

export interface Station {
  id: string;
  word: Word;
  romaji: string;
  line: Line;
  number: string;
}

export interface Route {
  lines: { line: Line; stations: Station[] }[];
  stations: Station[];
}

function lineFor(kind: string, otherIndex: number): Line {
  const known = KNOWN[kind];
  if (known) return { kind, ...known };
  // その他の種別は同じ色を共有し、記号で区別する
  return { kind, code: `X${String.fromCharCode(65 + otherIndex)}`, color: OTHER_COLOR };
}

// 既知の種別を先に、残りは出てきた順に並べ、各路線内は読みの五十音順にする
export function buildRoute(entries: { id: string; data: Word }[]): Route {
  const confirmed = entries.filter((e) => !e.data.pending);
  const kinds = [...new Set(confirmed.map((e) => e.data.kind))];
  const known = Object.keys(KNOWN).filter((k) => kinds.includes(k));
  const others = kinds.filter((k) => !KNOWN[k]);
  const lines = [...known, ...others].map((kind) => {
    const line = lineFor(kind, others.indexOf(kind));
    const stations = confirmed
      .filter((e) => e.data.kind === kind)
      .sort((a, b) => a.data.reading.localeCompare(b.data.reading, "ja"))
      .map((e, i) => ({
        id: e.id,
        word: e.data,
        romaji: toRomaji(e.data.reading),
        line,
        number: String(i + 1).padStart(2, "0"),
      }));
    return { line, stations };
  });
  return { lines, stations: lines.flatMap((l) => l.stations) };
}
