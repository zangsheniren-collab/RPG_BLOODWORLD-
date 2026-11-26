# BLOODWORLD RPG Prototype v0.1.0

ブラウザで動作する、BLOODWORLDのオリジナルRPG試作版です。

## GitHub Pagesで公開する方法
1. GitHubで新しいリポジトリを作成します（例: `bloodworld-rpg`）。
2. このフォルダ内の `index.html` と `README.md` をリポジトリ直下にアップロードします。
3. GitHubのリポジトリで **Settings → Pages** を開きます。
4. Build and deployment の Source を **Deploy from a branch** にします。
5. Branch を `main`、フォルダを `/(root)` にして Save。
6. 数分後に表示されるGitHub PagesのURLで遊べます。

## 操作
- 移動: WASD / 矢印キー
- 会話・調査: Space / Enter
- スマホ: 画面下の方向ボタン、中央の「話す」

## v0.1.0で実装済み
- タイトル画面
- キャラクター作成（名前・ドット絵画像・初期能力値割り振り）
- 飢京・中央街区の試作マップ
- NPC会話
- ランダムエンカウントとターン制戦闘
- EXP・レベルアップ・スキルポイント
- オリジナルスキル開発（技名・カテゴリ・説明・威力・MP）
- ブラウザ内セーブ、JSON書き出し・読み込み

## 現時点の制限
これは最初の動作試作です。仲間システム、12エリア、クエスト分岐、歩行アニメーション、属性・状態異常の詳細なスキル構築、セーブデータの将来バージョン移行は今後の実装項目です。

## ファイル構成
- `index.html`: 現在のゲーム本体（CSS・JavaScriptを内包）
- `README.md`: 公開手順と操作説明

まずは単一HTMLでGitHub Pagesへの公開を簡単にし、規模が大きくなった段階でCSS・JavaScript・データ・画像を分割する方針です。
