// 語がどの世界から来たか。索引の絞り込みと語ページの見出しに使う
export const THEMES = [
  "sumo",
  "stage",
  "buddhism",
  "history",
  "trade",
  "body",
  "animals",
  "everyday",
] as const;
export type Theme = (typeof THEMES)[number];
