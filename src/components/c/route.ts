import type { Word } from "../../lib/schema";
import { toRomaji } from "./romaji";

// かなだけでは語の切れ目が分からず、語をまたいで長音にしてしまうもの
const ROMAJI_OVERRIDES: Record<string, string> = {
  "nengu-no-osamedoki": "Nengunoosamedoki",
  "yome-toome-kasa-no-uchi": "Yometōmekasanouchi",
};

// 種別ごとに一本の路線として扱う。記号は駅ナンバリングの路線記号にあたる
export interface Line {
  kind: string;
  code: string;
  color: string;
}

// 種別ごとの路線。並び順がそのまま路線図の上からの順になる
const LINES: Record<Word["kind"], Omit<Line, "kind">> = {
  ことわざ: { code: "KW", color: "#2F7D6D" },
  四字熟語: { code: "YJ", color: "#3B5BA9" },
  慣用句: { code: "KY", color: "#8A8F3A" },
  ことば: { code: "KT", color: "#6B5B95" },
};

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

// 語のある路線だけを LINES の順に並べ、各路線内は読みの五十音順にする
export function buildRoute(entries: { id: string; data: Word }[]): Route {
  const confirmed = entries.filter((e) => !e.data.pending);
  const kinds = (Object.keys(LINES) as Word["kind"][]).filter((k) =>
    confirmed.some((e) => e.data.kind === k),
  );
  const lines = kinds.map((kind) => {
    const line: Line = { kind, ...LINES[kind] };
    const stations = confirmed
      .filter((e) => e.data.kind === kind)
      .sort((a, b) => a.data.reading.localeCompare(b.data.reading, "ja"))
      .map((e, i) => ({
        id: e.id,
        word: e.data,
        romaji: ROMAJI_OVERRIDES[e.id] ?? toRomaji(e.data.reading),
        line,
        number: String(i + 1).padStart(2, "0"),
      }));
    return { line, stations };
  });
  return { lines, stations: lines.flatMap((l) => l.stations) };
}
