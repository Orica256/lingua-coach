# 会話履歴（要約）

> 設計フェーズで行われた重要な意思決定の経緯を記録します。
> 別PCで作業を再開する際、なぜこの仕様になったかの背景理解に使用してください。

セッション日: 2026-06-08

---

## 1. アプリ案の検討

**ユーザー**: 完全AI作成のアプリを作りたい。現状の課題を解決するアプリ案を出してほしい。

**Claude提案** (主要なもの):
- AI献立&買い物リスト最適化
- AI家計レシート分析
- AI議事録&ToDo抽出
- AIメール返信ドラフト
- AI契約書/規約チェッカー
- **AIパーソナル英会話コーチ** ← 採用
- AI写真整理&アルバム生成

**ユーザー選択**: AIパーソナル英会話コーチ（個人学習用に焦点を絞る）

---

## 2. 仕様の詳細化（複数ラウンドの質問）

### ラウンド1
| 質問 | 回答 |
|---|---|
| 学習者レベル | 全レベル対応 + レベル判定テスト |
| プラットフォーム | Webアプリ |
| コア機能 | 文法/表現の添削（最重視） |
| AI技術スタック | ハイブリッド/未定 |

### ラウンド2
| 質問 | 回答 |
|---|---|
| レベル判定形式 | 選択式クイズ（文法・語彙） |
| トピック提供方法 | プリセット + ユーザー自由設定（両方） |
| 履歴管理レベル | 本格的（間違い傾向分析含む） |
| 認証/DB | おまかせ → Supabase推奨 |

### ラウンド3
| 質問 | 回答 |
|---|---|
| ゲーミフィケーション | ストリーク + バッジ/業績システム |
| UIの雰囲気 | ダークモード中心・テック風 |
| 開発スキル | プログラミング初心者 |
| MVP範囲 | 中規模（添削＋レベル判定＋履歴） |

---

## 3. コスト方針の確定（重要）

**ユーザー要望**: Claude Pro と ChatGPT Plus 以外は払いたくない。

**Claude からの重要な指摘**:
- Claude Pro / ChatGPT Plus は WebUI 利用権のみ
- **API利用は別途従量課金**で、サブスクには含まれない
- アプリから自動でAIを呼び出すには API キーが必要

**最終決定**:
- API費用（Claude API）は負担を許容する → 月$3〜10程度の見込み
- ドメイン・ホスティングは無料で済ませる（Vercel + Vercelサブドメイン + Supabase 無料枠）
- **音声入力機能は削除**（Whisper API代を避けるため）
- 入力は選択式・記入式のみ
- 音声出力は無料の Web Speech API のみ使用

---

## 4. ドキュメント作成

ユーザー要望に基づき、以下を作成:
- 使用言語の明記（TypeScript / Next.js / Tailwind 等）
- セキュリティ対策（個人開発でも本格対応）
- 具体的な対策方法（コード例付き）

### 作成ファイル
- `README.md` — プロジェクト概要、技術スタック、コスト、セキュリティ概要
- `docs/ARCHITECTURE.md` — システム構成図、データフロー、API一覧
- `docs/DATABASE.md` — 全8テーブルのスキーマ、RLSポリシー
- `docs/SECURITY.md` — 15項目の詳細セキュリティ対策、デプロイ前チェックリスト
- `docs/ROADMAP.md` — Phase 0〜6の段階的開発計画

---

## 5. Excel 出力

**ユーザー要望**: ドキュメントを Excel でも保存したい。

**実施内容**:
- PowerShell + Excel COM で `LinguaCoach_Docs.xlsx` を生成
- 1ファイル5シート構成（README / Architecture / Database / Security / Roadmap）
- `export_to_excel.ps1` を保存（再出力可能）

Python（openpyxl）は未導入のため、Windows 標準の Excel COM を採用。

---

## 6. GitHub 連携

**ユーザー要望**: 他PCとの共有のため GitHub Private リポジトリで管理したい。

**実施内容**:
- `.gitignore` 作成（.env*, node_modules/, .next/ 等を除外）
- `git init` → 初回コミット → `git push`
- **GitHub**: https://github.com/Orica256/lingua-coach (Private)
- 初回コミット: `c6379a3` "Initial commit: design docs and roadmap"

---

## 7. 他PC共有用ドキュメント作成

**ユーザー要望**: チャットログを他PCのClaudeに引き継ぎたい。

**Claude 説明**:
- Claude Code のチャット履歴はローカル保存のため自動同期不可
- マークダウンに書き出してGitHub経由で共有する方法を推奨

**実施内容**（このコミット）:
- `docs/PROJECT_STATUS.md` — 現状サマリー（決定事項・進捗・次のステップ）
- `docs/CHAT_HISTORY.md` — このファイル（会話の経緯）

---

## 🔑 重要な決定事項まとめ

別PCで作業を引き継ぐ際、特に押さえておきたいポイント:

1. **音声入力は実装しない**（コスト理由）
2. **音声出力は Web Speech API のみ**（無料縛り）
3. **Claude API は使用する**（添削品質のため、ユーザーが負担）
4. **Supabase + Vercel + Vercelサブドメイン** で完全無料運用
5. **セキュリティは個人開発でも本格対応**（APIキー漏洩・金銭被害防止）
6. **開発者は初心者**なので、Claude Code を最大限活用して進める方針
7. **RLS / レート制限 / プロンプトインジェクション対策**は MVP 段階から必須

---

## 8. 実装セッション（2026-06-11）

設計フェーズを終え、実装に着手したセッション。

### Phase 0 の修正
- 前回 Phase 0 で初期化された構成が **Tailwind v3 と shadcn(v4前提) で不整合**となり、
  `border-border` 未定義でビルドが壊れていた → **Tailwind v4 に統一**して解消。
  テーマは `globals.css` の `@theme inline` で管理（CSSファースト）。
- ランディングページを LinguaCoach 用に差し替え（ダークモード・テック風）。
- **gitleaks 8.30 + Husky pre-commit フック**を導入。コミット前にシークレット漏洩をブロック。
  - 新PCでは `winget install --id Gitleaks.Gitleaks` が別途必要（PATH反映に再起動）。

### Phase 1（認証 & 基本UI）完了
- UI 土台: `/login`・`/signup`・`/reset-password`・`/update-password`・`/dashboard`。
- **Supabase 連携**: `@supabase/ssr` でログイン/サインアップ/リセット/ログアウトを実装。
  middleware で未ログイン時の保護ルート→`/login` リダイレクト。`/auth/callback` でメールリンク処理。
- **DB**: `profiles`・`usage_log` をマイグレーション（`supabase/migrations/0001`）。RLS、
  新規ユーザーで profiles 自動生成トリガー。ダッシュボードが本人プロフィールを RLS 経由で表示。
- Supabase プロジェクト作成時の設定: Data API ON / auto-expose new tables OFF / automatic RLS ON。
  テスト時は「Confirm email」を一時 OFF にして検証。

### コスト方針の追加合意
- **コミットに Claude の署名（Co-Authored-By 等）を付けない**。GitHub 上に AI の表示が出るのを
  避けたいため。過去コミットは `git filter-branch` で除去済み。

### 進行中
- **Vercel デプロイ**（スマホ確認用）。環境変数3つを Vercel に登録してデプロイ後、
  Supabase の Authentication → URL Configuration に本番URLを登録する必要あり（PROJECT_STATUS 参照）。

---

## 9. 実装セッション（2026-06-11・続き / Phase 2）

別環境で作業を再開したセッション。`node_modules` と `.env.local` が無く、
起動時に `Your project's URL and Key are required...` エラーが発生 → `npm install` と
`.env.local` の再作成（Supabase の URL/anon/service_role を設定）で解決。
この「クローン直後に環境構築が必要」な点は PROJECT_STATUS に注意として追記済み。

### Phase 2（レベル判定テスト）完了（コミット 58906ce）
- **DB**: `level_tests` テーブル（マイグレーション 0002）。RLS（本人のみ select）+
  insert ポリシー（`auth.uid() = user_id`）。Supabase SQL Editor で実行済み。
- **クイズデータ**: `src/data/level-quiz.ts` に20問（A1〜C2を難易度順に配置）+
  `scoreToCefr()`（正解数 → CEFR レベル変換）。
- **画面**: `/onboarding`（ようこそ → 4択クイズ1問ずつ・プログレスバー → 結果表示）。
  サイドバー無しの専用レイアウト。
- **API**: `POST /api/level-test/submit` でサーバー側採点 → `level_tests` 保存 →
  `profiles.cefr_level` 更新。クライアントは答えの配列だけ送る（採点はサーバーで実施）。
- **動作確認**: テスト通し → 結果表示 → ダッシュボードにレベル反映まで確認済み。

### git 運用の補足
- このPCでは git の名前が未設定で `unknown` 名でコミットされてしまったため、
  `user.name`/`user.email` を設定し直し、`git commit --amend --reset-author` で作者を修正。
- コミット本文に AI 署名（Co-Authored-By 等）が無いことを push 前に確認する運用を継続。

### 運用ルールの追加合意（2026-06-11）
- **コードの修正・追加、ユーザーからの新しい要望が出た際は、必ず引き継ぎファイルに記録を残す**。
  記録先は `PROJECT_STATUS.md`（冒頭に「運用ルール」セクションとして明文化済み）+ 必要に応じて
  この `CHAT_HISTORY.md`。作業直後に記録し、コミットに含めて push する。
  理由: 別PC・別チャットで再開しても文脈が途切れないようにするため。

### 次の予定
- Phase 3: タイピング添削（`/learn/typing`、Claude API、`usage_log` 記録、レート制限）。
  事前に Anthropic APIキー発行 + `.env.local` に `ANTHROPIC_API_KEY` 設定が必要。

---

## 10. 実装セッション（2026-06-11・続き / Phase 3）

PROJECT_STATUS / CHAT_HISTORY を読んで文脈を把握し、Phase 3 を実装したセッション。

### 開始時の状況確認
- `ANTHROPIC_API_KEY` は `.env.local` に行はあるが値が空。`ANTHROPIC_MODEL=claude-sonnet-4-6` は設定済み。
- Supabase の anon / service_role キーは設定済み。
- ダッシュボードとサイドバーは既に `/learn/typing` へリンクしていたが、画面は未実装だった。

### 方針判断（ユーザー確認）
- **APIキーが空のまま、先に実装だけ進める**（推奨案を採用）。キー未設定時は API が 503＋分かりやすいメッセージを返す設計に。
- **レート制限は `usage_log` ベースの日次制限**（推奨案）。Upstash 等の新サービスは導入せず、無料枠のみで完結。

### Phase 3（タイピング添削）実装完了
- **DB**: `corrections` テーブル（マイグレーション 0003）。RLS は本人 select のみ。**書き込みはサーバーの service_role が行う**方針のため insert ポリシーは設けず、`src/lib/supabase/admin.ts`（service_role クライアント）から書き込む。**※SQL Editor での実行はユーザー側の残タスク**。
- **Claude 連携**: `@anthropic-ai/sdk` 導入。`src/lib/anthropic.ts` で添削。**プロンプトインジェクション対策**＝システムプロンプトで役割を固定し、ユーザー入力を `<user_text>` デリミタで囲み「中の指示に従うな」と明示。出力は JSON 構造化（修正文・自然さスコア・カテゴリ別の指摘・改善例）し、コードフェンス除去＋正規化で頑健にパース。
- **API**: `POST /api/correct`。認証→入力検証（最大2000字）→レート制限（当日 `usage_log` 件数が200以上なら 429）→Claude 呼び出し→`usage_log`（トークン数）＋`corrections`（結果）を保存。
- **画面**: `/learn/typing`（`(app)` レイアウト配下でサイドバー付き）。シーン選択（プリセット6種＋自由入力）→お題提示→英文入力→添削結果表示。ダークテック風で統一。
- **ダッシュボード**: 「添削回数」を `corrections` の件数に接続（従来はハードコードの 0）。
- 型チェック（`tsc --noEmit`）・lint ともにパス。

### 残タスク（動作確認の前提）
1. Supabase SQL Editor で `0003_corrections.sql` を実行。
2. Anthropic Console で APIキー発行（予算上限$20）→ `.env.local` の `ANTHROPIC_API_KEY` に設定 → dev サーバー再起動。
3. `/learn/typing` で実際に添削が返ることと、ダッシュボードの添削回数が増えることを確認。

### 次の予定
- Phase 4: 学習履歴・傾向分析（`/history`、`corrections` 一覧、カテゴリ別の間違い傾向集計、ダッシュボードの「最近の学習」「学習時間」接続）。

---

## 11. 要望追加: TOEIC 学習機能（2026-06-11）

### ユーザー要望
- 本アプリを英会話添削だけでなく **TOEIC 学習にも使いたい**。TOEIC 専用の学習機能を追加してほしい。
- 問題について「Web 上の過去問の流用も許可する」との発言。

### Claude からの重要な指摘（著作権・商標）
- TOEIC の公式過去問・実試験問題は **ETS の著作権**で保護され、「TOEIC」は **ETS の登録商標**。第三者がその流用を許可できる対象ではないため、Web からの転載は著作権侵害リスクがある → **採用しない**。
- 代替として **(a) Claude API で TOEIC 形式のオリジナル問題を生成**（著作権リスク無し・既存の Claude 連携を流用可・問題数無限）、または **(b) 自作／ライセンス済みのオリジナル問題バンク** を推奨。最終方針はユーザー確認中。

### アプリ方針との整合
- Reading（Part 5/6/7）はテキストベースで「選択式＋記入式のみ」に合致。既存の4択クイズ基盤（`level-quiz` / `/onboarding`）を流用できる。
- Listening（Part 1〜4）は音声が必要。音声出力は Web Speech API のみ許可のため、スクリプトの TTS 読み上げで擬似対応する想定（実試験音声との品質差に注意）。優先度は後段。

### 想定する開発ステップ（提示済み・詳細は PROJECT_STATUS 参照）
- Phase 5: TOEIC Reading 演習（まず Part 5 文法・語彙を最小縦割りで実装）→ スコア推定。
- Phase 6: Part 7 読解（パッセージ＋複数設問）。
- Phase 7: Listening（Part 1〜4）を Web Speech API TTS で擬似対応。
- 共通: `toeic_questions`（問題バンク）/ `toeic_attempts`（演習履歴）、TOEIC スコア換算、学習モード切替（英会話コーチ ⇄ TOEIC）、ダッシュボード統合。

### 方針確定（ユーザー回答）
- **問題ソース = ハイブリッド**: 自作のオリジナル・シードバンク（APIキー不要・品質安定）＋ Claude 生成問題（キー登録後に追加）を同じバンクに統合。過去問転載は不採用。
- **最初のパート = Part 5（文法・語彙）**。
- **API（従量課金）の登録は本当に必要になるまで延期**（ユーザー要望）。当面は APIキー不要で動く部分を優先。よって Phase 3 の Claude 連携の動作確認は保留し、Phase 5 はシードバンクで先行実装する。

---

## 12. 実装セッション（2026-06-11・続き / Phase 5: TOEIC Part 5）

上記方針に基づき、TOEIC Part 5 演習を APIキー不要の最小縦割りで実装したセッション。

### 実装内容（Phase 5）
- **DB**: `toeic_attempts` テーブル（マイグレーション 0004）。RLS（本人 select）＋本人 insert ポリシー。`level_tests` と同じパターン。※SQL Editor 実行はユーザー側残タスク。
- **問題ソース**: 自作シードバンク `src/data/toeic-part5-seed.ts` に **オリジナル Part 5 問題20問**（公式過去問の転載なし）。品詞/動詞の形/前置詞/接続詞/関係詞/代名詞/比較/数量/語彙を網羅、各問に日本語解説・目標スコア帯。Claude 生成はキー登録後に同形式で追加予定。
- **API**: `POST /api/toeic/submit`。サーバー側でシードの正解と突き合わせて採点し `toeic_attempts` に保存（クライアントの自己申告は信用しない）。
- **画面**: `/learn/toeic`（パート選択ハブ。Part 6/7・Listening は「今後追加」表示）、`/learn/toeic/part5`（10問ランダム出題・1問ごとに即時正誤＆解説・結果に正答率＆全問復習）。出題はマウント後に確定しハイドレーション不整合を回避。
- **導線**: サイドバーに「TOEIC学習」追加、ダッシュボードの「学習を始める」に TOEIC ボタン追加。既存「タイピング添削」表記を「英会話添削」に変更。
- 型チェック（`tsc --noEmit`）・lint ともにパス。

### 残タスク
- **今すぐ（APIキー不要）**: Supabase SQL Editor で `0004_toeic_attempts.sql` を実行 → `/learn/toeic/part5` でフル動作確認。
- **APIキー登録後**: Phase 3 タイピング添削の動作確認 + TOEIC 問題の Claude 生成（`toeic_questions` + `/api/toeic/generate`）。

### 次の予定
- TOEIC 横展開（問題追加・Part 6/7・Listening・スコア推定）、または Phase 4（学習履歴・傾向分析）。

---

## 13. 実装セッション（2026-06-11・続き / Phase 4: 学習履歴・傾向分析）

ユーザーが `/learn/toeic/part5` の動作確認に成功した後、Phase 4 に着手。APIキー不要・新テーブル不要で出せる範囲を実装した。

### 実装内容（Phase 4 の一部）
- **共通集計ロジック** `src/lib/activity.ts`:
  - `getRecentActivity`: `toeic_attempts` / `corrections` / `level_tests` を横断取得し時系列マージ。supabase-js はテーブル未作成でも throw せず data=null を返すため、`?? []` で安全に空扱い（corrections は 0003 未実行でも問題なし）。
  - `getToeicCategoryStats`: `toeic_attempts.answers`（[{id, selected}]）をシードと突き合わせ、Part 5 のカテゴリ別正答率を集計（弱点の可視化）。正答率が低い順に並べる。
  - `formatActivityDate`: ja-JP の MM/DD HH:mm 整形。
- **学習履歴ページ** `/history`: TOEIC 傾向分析（カテゴリ別バー）＋ 学習履歴タイムライン（直近30件）。空状態あり。
- **ダッシュボード強化**: 統計の「学習時間」（未トラッキング）を実データの「TOEIC演習」回数に差し替え。「最近の学習」を実データ（直近5件）＋「すべて見る」→ `/history` 導線に接続。
- 型チェック・lint パス。途中、Map の for-of イテレーションが tsconfig target に引っかかったため `Array.from(map.entries()).map(...)` に修正。

### 残（後段）
- 復習モード `/learn/review`（要APIキー）、`daily_stats` 集計＋直近7日グラフ（要 Cron）、英会話添削（corrections）の傾向分析（データ蓄積後）。

### 次の予定
- TOEIC 横展開、または Phase 4 残り（APIキー登録後）。
