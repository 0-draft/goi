# goi

使いたくなる日本語を集めた語彙帳。関の山、日下開山、痘痕も靨のような、知ってはいるけど自分ではなかなか口に出さない言葉を、意味・由来・例文・出典つきで1語ずつ載せていく。

公開先: <https://0-draft.github.io/goi/>

## 収録の決まり

- 1語につき1ページ (`/w/<id>/`)。言葉のデータはすべて [`src/data/words.json`](src/data/words.json) にある
- 意味と由来は辞書や自治体・新聞などの出典で裏を取り、`sources` に URL を残す。出典のない語は載せない
- どの言葉か特定できないものは `pending` に理由を書いて置いておく。ページは作らない

### データの形

```json
{
  "id": "seki-no-yama",
  "word": "関の山",
  "reading": "せきのやま",
  "kind": "慣用句",
  "meaning": "どう頑張ってもそこまでが限度、という精一杯のところ。",
  "origin": "「関」は東海道の宿場町・関宿、「山」は祭りの山車。",
  "example": "この予算じゃ現状維持が関の山だ。",
  "sources": [{ "label": "和樂web", "url": "https://intojapanwaraku.com/rock/culture-rock/164072/" }]
}
```

スキーマは [`src/lib/schema.ts`](src/lib/schema.ts)。`id` は小文字ローマ字とハイフン、`reading` はひらがなのみ、確定した語は読み・意味・出典が必須。合わないデータはビルドとテストで落ちる。

## 開発

```bash
pnpm install
pnpm dev          # http://localhost:4321/goi/
pnpm build
pnpm lint         # Biome + markdownlint
pnpm check        # astro check
pnpm test         # Vitest (検索ロジックと words.json の検証)
pnpm test:e2e     # Playwright + axe (先に pnpm build)
pnpm lhci         # Lighthouse CI (先に pnpm build)
```

検索はクライアント側の自前実装 ([`src/lib/search.ts`](src/lib/search.ts))。NFKC 正規化とカタカナ→ひらがなの変換をしてから、見出し・読み・意味を部分一致で引く。

## 構成

| 領域 | 使っているもの |
| --- | --- |
| フレームワーク | Astro 7 (静的出力) |
| ランタイム | Node 26, pnpm 12 |
| 型・スキーマ | TypeScript 6, Zod 4 (Astro content collections) |
| Lint / format | Biome 2, markdownlint-cli2 |
| テスト | Vitest 5, Playwright, axe-core, Lighthouse CI |
| ホスティング | GitHub Pages |

## CI

| ワークフロー | 内容 |
| --- | --- |
| `ci.yml` | lint、astro check、unit test、build、e2e (デスクトップとモバイル)、Lighthouse |
| `deploy.yml` | `main` への push で GitHub Pages にデプロイ (OIDC) |
| `security.yml` | ワークフローを actionlint と zizmor で検査 |

アクションはすべてコミット SHA で固定している。依存の更新は Dependabot (npm と GitHub Actions、週1回、グループ化、7日の cooldown)。
