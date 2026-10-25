// <script type="application/json"> に埋め込む JSON。
// 文字列中の "</script" でブロックが途中で閉じないよう < をエスケープする
export function jsonForScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
