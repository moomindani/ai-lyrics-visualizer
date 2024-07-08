# 初音ミク「マジカルミライ 2024」プログラミング・コンテスト エントリー作品「Rhyme Traveler - ライムトラベラー -」

Rhyme Traveler - ライムトラベラー - は 歌詞の意味を解析し、その内容に合わせたリリックビデオを生成するリリックアプリです。
歌詞のリリックやライムが生み出す情景を旅する意味を込めて名付けられました。
[TextAlive](https://textalive.jp/)のApp APIを使用しています。

本アプリは [初音ミク「マジカルミライ 2024」プログラミング・コンテスト](https://developer.textalive.jp/events/magicalmirai2024/)の応募作品です。
課題曲 6曲のいずれにも対応しています。また、[Songle](https://songle.jp/)に音楽地図、[TextAlive](https://textalive.jp/) App APIに歌詞情報が登録された任意の曲に対応できます。

## デモサイト

[デモサイト](http://ai-lyrics-visualizer-test.s3-website.ap-northeast-1.amazonaws.com/)

## ムービー

TBD

## ポイント

本アプリでは、TextAlive API により取得した楽曲情報（音楽地図）をもとに、AI/LLM の技術によりさらなる意味情報を抽出し、リリックビデオを自動生成します。

* 特定の楽曲のためだけに作り込むのではなく、任意の楽曲に対応する
* AI/LLM の技術を、コンテンツ生成には使わずに、楽曲の解析に活用する

AI/LLM による解析で以下の情報を抽出して、演出に活用しています。

* フォント
* 配色パターン
* 繰り返しパターン (リフレイン)
* 特定の意味をもつワード (初音ミクとマジカルミライのコンテクストをもとに、"メロディ" と "未来" を扱います。)
* キーフレーズ
　
また、TextAlive API により取得した楽曲情報（音楽地図）から以下の情報を抽出して、演出に活用しています。

* ビート
* サビ

初音ミク「マジカルミライ 2024」プログラミング・コンテストの課題曲 6曲については、あらかじめ解析済みのデータを登録してあります。

上級者向けの機能として、Songle 上で登録されている楽曲の URL を入力し、任意の曲を演出できます。
[Open AI](https://openai.com/index/openai-api/) の API キーをお持ちの場合はそのキーを入力することで、[GPT-4o](https://openai.com/index/hello-gpt-4o/) を使って曲を解析します。
そうでない場合、ご利用の端末と Web ブラウザが WebGPU に対応している場合、[WebLLM](https://webllm.mlc.ai/) 経由で [Llama 3](https://llama.meta.com/llama3/) を使って曲を解析します。

課題曲 6曲については事前に解析したデータを使用するため、WebGPU や Open AIの API キーがない環境でも再生できます。

## 開発

[Node.js](https://nodejs.org/) をインストールしている環境で以下のコマンドを実行すると、開発用サーバが起動します。

```sh
npm install
npm run dev
```

## ビルド

以下のコマンドで `docs` 以下にビルド済みファイルが生成されます。

```sh
npm run build
```
