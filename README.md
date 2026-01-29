Next.js (App Router) + TypeScript + Tailwind CSS で作成した「髪型AIシミュレーター」のMVPです。

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- JPG/PNGの画像を2枚アップロード（自分の写真・参考画像）
- それぞれのプレビュー表示
- ダミーの変換API（`/api/transform`）
- 変換履歴をlocalStorageに保存・再表示

## Notes

- 認証やDBは使っていません。
- 変換結果はダミーで、自分の写真を返すだけの実装です。
