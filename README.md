# 家計簿アプリ（GitHub Pages）

SupabaseやVercelを使わず、GitHub Pagesだけで公開できる家計簿Webアプリです。

## データ保存

- 明細・予算・設定は利用中のブラウザ内に保存されます
- 変更時に端末内へ自動バックアップし、直近10世代から復元できます
- プロフィール画面から、バージョン付きJSONバックアップを書き出せます
- iPhoneでは「iCloudへ保存」から共有画面を開き、iCloud Driveへ保管できます
- 新しいスマートフォンでは、ログイン画面の「復元する」からJSONを読み込みます
- バックアップには家計データが含まれるため、iCloud DriveやGoogle Driveなど本人だけが見られる場所へ保管してください

自動バックアップは同じ端末・ブラウザ内の復旧用です。紛失や機種変更に備えるには、JSONの書き出しも定期的に行ってください。
ブラウザの安全制限により、操作なしでiCloud Driveへ自動保存することはできません。

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
