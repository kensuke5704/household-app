# 家計簿アプリ（Next.js + Supabase）

Excel家計簿の内容をもとに、新規で作成した家計簿Webアプリです。

## 機能

- 月別管理
- 支出入力
- 収入入力
- 大分類 / 小分類 / 金額 / メモ
- 履歴表示
- 削除
- 収入・支出・残高の自動集計
- カテゴリ別の予算・実費・差額
- Excelにあった固定費テンプレート追加
- Supabase保存
- Supabase未設定時はlocalStorageで動作

## Excelから反映した分類

### 収入

- 給与
- その他(収入)
- 取崩し

### 支出

- 食費
- 住居
- 光熱・水道
- 生活用品
- 被服
- 保険医療
- 交通・通信
- 娯楽
- その他(支出)

## 実行方法

```bash
npm install
npm run dev
```

ブラウザで開きます。

```text
http://localhost:3000
```

## Supabaseを使う場合

1. Supabaseで新規プロジェクトを作成
2. SQL Editorで `supabase/schema.sql` を実行
3. `.env.example` をコピーして `.env.local` を作成
4. SupabaseのURLとanon keyを入れる
5. 再起動

```bash
npm run dev
```

## Supabaseなしで確認する場合

`.env.local` を作らなくても動きます。  
その場合、ブラウザのlocalStorageに保存されます。

## 注意

`supabase/schema.sql` は個人用デモとして、匿名ユーザーからの読み書きを許可しています。公開運用する場合は、Supabase Authを導入してRLSをユーザー別に変更してください。
