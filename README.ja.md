# goi

[English](README.md) | **日本語**

使いたくなる日本語の路線図。語の種類 (ことわざ・慣用句・四字熟語・ことば) ごとに路線を引き、1語を1駅として駅名標を立てている。駅名標には意味・由来・用例・出典を載せる。

公開先: <https://0-draft.github.io/goi/ja/> (日本語)、<https://0-draft.github.io/goi/> (英語)

## 中身

- 関の山、日下開山、痘痕も靨のような、知ってはいるけど自分ではなかなか口に出さない言葉
- 1語につき1ページ。日本語版は `/goi/ja/w/<id>/`、英語版は `/goi/w/<id>/`
- 意味と由来は辞書や自治体・新聞などの出典で裏を取り、出典の URL を残している。由来に複数の説があるものは、説として両方書く
- 英語版でも見出し・読み・用例は日本語のまま出し、英語の訳語・意味・由来と用例の英訳を添える
- 語ごと・言語ごとの OGP 画像、hreflang つきの sitemap、旧 URL を案内する 404 ページ

## データ

言葉のデータはすべて [`src/data/words.json`](src/data/words.json) にある。形は英語版の README を参照。スキーマは [`src/lib/schema.ts`](src/lib/schema.ts)。

- `id` は小文字ローマ字とハイフン、`reading` はひらがなのみ
- `kind` は `ことわざ` / `慣用句` / `四字熟語` / `ことば` のどれか。仏教語・相撲由来といった由来の分野は `origin` に書く
- 確定した語は読み・意味・出典が必須。英語版の文言は `en` に入れる
- どの言葉か特定できないものは `pending` に理由を書いて置いておく。ページは作らない

合わないデータはビルドとテストで落ちる。

## 開発

```bash
pnpm install
pnpm dev          # http://localhost:4321/goi/
pnpm build
pnpm lint         # Biome + markdownlint
pnpm check        # astro check
pnpm test         # Vitest
pnpm test:e2e     # Playwright + axe (先に pnpm build)
pnpm lhci         # Lighthouse CI (先に pnpm build)
```

- 検索はクライアント側の自前実装 ([`src/lib/search.ts`](src/lib/search.ts))。NFKC 正規化とカタカナ→ひらがなの変換をしてから、見出し・読み・ローマ字・意味を部分一致で引く
- 画面の文言は [`src/i18n/ui.ts`](src/i18n/ui.ts) に両言語ぶんある。`src/pages/` と `src/pages/ja/` は `src/views/` の画面を言語を指定して呼ぶだけ
- OGP 画像はビルド時に satori と resvg で作る。フォント (BIZ UDPGothic) は Google Fonts から使う字だけ取ってくるので、ビルドにはネットワークが要る

### 見た目の回帰テスト

`tests/e2e/visual.spec.ts` は CI と同じ Playwright のコンテナの中でだけ走らせる。フォントの描画が OS ごとに違うので、手元の macOS では `pnpm test:e2e` から外してある。

語を足したりデザインを変えたりして基準画像を作り直すときは、次の手順で更新する。

1. GitHub Actions の `Visual baseline` ワークフローを手動で実行する
2. artifact `visual-snapshots` をダウンロードして中身を確認する
3. `tests/e2e/visual.spec.ts-snapshots/` に置いてコミットする

## 構成

| 領域 | 使っているもの |
| --- | --- |
| フレームワーク | Astro 7 (静的出力) |
| ランタイム | Node 26, pnpm 12 |
| 型・スキーマ | TypeScript 6, Zod 4 (Astro content collections) |
| Lint / format | Biome 2, markdownlint-cli2 |
| テスト | Vitest 5, Playwright, axe-core, Lighthouse CI |
| OGP 画像 | satori, resvg |
| ホスティング | GitHub Pages |

## CI

| ワークフロー | 内容 |
| --- | --- |
| `ci.yml` | lint、astro check、unit test、build、e2e (デスクトップとモバイル)、Lighthouse |
| `deploy.yml` | `main` への push で GitHub Pages にデプロイ (OIDC) |
| `security.yml` | ワークフローを actionlint と zizmor で検査 |
| `visual-baseline.yml` | 見た目の回帰テストの基準画像を作り直す (手動実行) |

- アクションはすべてコミット SHA で固定していて、リポジトリ設定でも SHA 固定を必須にしている
- 依存の更新は Dependabot (npm と GitHub Actions、週1回、グループ化、7日の cooldown)
- `main` は削除と force push を禁止している
