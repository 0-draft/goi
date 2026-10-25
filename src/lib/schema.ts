import { z } from "astro/zod";

export const sourceSchema = z.object({
  label: z.string().min(1),
  url: z.url({ protocol: /^https$/ }),
});

export const wordSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "id は小文字ローマ字とハイフンのみ"),
    word: z.string().min(1),
    reading: z.string().regex(/^[\p{Script=Hiragana}ー]*$/u, "読みはひらがなで書く"),
    // 表現の型。由来（仏教語・相撲など）は origin に書く
    kind: z.enum(["ことわざ", "慣用句", "四字熟語", "ことば"]),
    meaning: z.string(),
    origin: z.string(),
    example: z.string(),
    sources: z.array(sourceSchema),
    // 英語版の表示用。例文は日本語のまま出し、en.example はその英訳
    en: z
      .object({
        gloss: z.string().min(1),
        meaning: z.string().min(1),
        origin: z.string().min(1),
        example: z.string().min(1),
      })
      .optional(),
    // 調べきれていない語は pending に理由を書いて置いておく
    pending: z.string().min(1).optional(),
  })
  .refine((w) => w.pending || (w.reading && w.meaning && w.sources.length > 0), {
    message: "確定した語には読み・意味・出典が必要",
  });

export type Word = z.infer<typeof wordSchema>;
