// ひらがなの読みを駅名標のローマ字（ヘボン式、長音はマクロン）に変換する。
// 語の切れ目は読みからは分からないので、駅名と同じく一語として先頭だけ大文字にする。

// biome-ignore format: 五十音表の並びを保つ
const BASE: Record<string, string> = {
  あ: "a", い: "i", う: "u", え: "e", お: "o",
  か: "ka", き: "ki", く: "ku", け: "ke", こ: "ko",
  さ: "sa", し: "shi", す: "su", せ: "se", そ: "so",
  た: "ta", ち: "chi", つ: "tsu", て: "te", と: "to",
  な: "na", に: "ni", ぬ: "nu", ね: "ne", の: "no",
  は: "ha", ひ: "hi", ふ: "fu", へ: "he", ほ: "ho",
  ま: "ma", み: "mi", む: "mu", め: "me", も: "mo",
  や: "ya", ゆ: "yu", よ: "yo",
  ら: "ra", り: "ri", る: "ru", れ: "re", ろ: "ro",
  わ: "wa", ゐ: "i", ゑ: "e", を: "o", ん: "n",
  が: "ga", ぎ: "gi", ぐ: "gu", げ: "ge", ご: "go",
  ざ: "za", じ: "ji", ず: "zu", ぜ: "ze", ぞ: "zo",
  だ: "da", ぢ: "ji", づ: "zu", で: "de", ど: "do",
  ば: "ba", び: "bi", ぶ: "bu", べ: "be", ぼ: "bo",
  ぱ: "pa", ぴ: "pi", ぷ: "pu", ぺ: "pe", ぽ: "po",
  ゔ: "vu", ぁ: "a", ぃ: "i", ぅ: "u", ぇ: "e", ぉ: "o",
};

const YOON: Record<string, string> = {
  ゃ: "a",
  ゅ: "u",
  ょ: "o",
};

const MACRON: Record<string, string> = { a: "ā", i: "ī", u: "ū", e: "ē", o: "ō" };

function syllables(kana: string): string[] {
  const out: string[] = [];
  const chars = [...kana];
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    const next = chars[i + 1];
    const base = BASE[c];
    if (base && next && YOON[next] && base.endsWith("i") && base.length > 1) {
      // きゃ → kya, しゃ → sha, ちゃ → cha, じゃ → ja
      const stem = base.slice(0, -1);
      const glide = /^(sh|ch|j)$/.test(stem) ? "" : "y";
      out.push(stem + glide + YOON[next]);
      i++;
    } else if (c === "っ") {
      out.push("っ");
    } else if (c === "ー") {
      out.push("ー");
    } else {
      out.push(base ?? c);
    }
  }
  return out;
}

export function toRomaji(reading: string): string {
  const parts = syllables(reading);
  let text = "";
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    const next = parts[i + 1] ?? "";
    if (p === "っ") {
      // 促音は次の子音を重ねる。ch の前だけは t
      if (next.startsWith("ch")) text += "t";
      else if (/^[a-z]/.test(next) && !/^[aiueon]/.test(next)) text += next[0];
      continue;
    }
    if (p === "ー") {
      const last = text.at(-1) ?? "";
      if (MACRON[last]) text = text.slice(0, -1) + MACRON[last];
      continue;
    }
    // おう・おお・うう を長音として扱う
    const last = text.at(-1);
    if ((last === "o" && (p === "u" || p === "o")) || (last === "u" && p === "u")) {
      text = text.slice(0, -1) + MACRON[last];
      continue;
    }
    // ん の直後が母音・や行なら n' で区切る
    if (p === "n" && /^[aiueoy]/.test(next)) {
      text += "n'";
      continue;
    }
    text += p;
  }
  return text.charAt(0).toUpperCase() + text.slice(1);
}
