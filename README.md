# 家計簿アプリ（GitHub Pages）

SupabaseやVercelを使わず、GitHub Pagesだけで公開できる家計簿Webアプリです。

## データ保存

- 明細・予算・設定は利用中のブラウザ内に保存されます
- プロフィール画面から、バージョン付きJSONバックアップを書き出せます
- 新しいスマートフォンでは、ログイン画面の「復元する」からJSONを読み込みます
- バックアップには家計データが含まれるため、iCloud DriveやGoogle Driveなど本人だけが見られる場所へ保管してください

リポジトリに収録済みの既存データ476件は、ID `kensuke5704` の初回利用時にブラウザへ取り込まれます。

## GitHub Pagesで公開

`main` ブランチへ反映すると、`.github/workflows/pages.yml` が静的サイトをビルドして公開します。

初回だけGitHubリポジトリの `Settings > Pages > Build and deployment` で、Sourceを `GitHub Actions` に設定してください。

公開URL:

```text
https://kensuke5704.github.io/household-app/
```

## ローカルで確認

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

静的ファイルの生成:

```bash
npm run build
```

生成先は `out/` です。
