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

ユーザーが 0004 を Supabase に実行し `/learn/toeic/part5` の動作確認（10問演習・採点・保存）に成功した後、Phase 4 に着手。APIキー不要・新テーブル不要で出せる範囲を実装した。

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

---

## 14. 実装セッション（2026-06-12 / Part 5 問題数の拡充）

文脈を読み直して再開。APIキー不要で進められる候補（スコア推定+7日グラフ / Part 6 / Part 5 問題追加 / 復習モード）の中から、ユーザーが **「Part 5 問題数の拡充」** を選択。

### 実装内容
- `src/data/toeic-part5-seed.ts` のシードバンクを **20 → 40 問** に拡充（id 21〜40 を追加）。
- 既存の偏り（関係詞・代名詞・比較・数量が各1問）を補正し、9カテゴリを **各4〜6問** にほぼ均等化。
  - 品詞5 / 動詞の形6 / 前置詞4 / 接続詞4 / 関係詞4 / 代名詞4 / 比較4 / 数量4 / 語彙5。
- 全問オリジナル（公式過去問の転載なし）。各問に4択・正解・日本語解説・目標スコア帯（470/600/730/860）を付与。
- 採点（`/api/toeic/submit`）・カテゴリ集計（`src/lib/activity.ts`）・出題（`/learn/toeic/part5`）はいずれも **id 照合 / 全プールからランダム10問** なので、コード変更不要で追加 id を取り込む。1セッション10問の重複感が下がる。

### 環境メモ（重要）
- **この PC（PowerShell セッション）では node / npm が PATH に無く、`node_modules` も未インストール**だったため、`npx tsc --noEmit` / lint をこの場で実行できなかった。
  - 追加は既存の型に厳密準拠したデータのみ（`options` は4要素タプル、`category` は既存ユニオン型、`answer` 0–3、`targetScore` は所定の4値）で、id 重複なし・件数40を機械チェック済み。
  - **確実を期すなら `npm install` 済みの環境で `npx tsc --noEmit` を一度通すこと。**

### 次の予定
- さらなる TOEIC 横展開（Part 6/7・スコア推定・7日グラフ）、または Part 5 のさらなる問題追加。いずれも APIキー不要で着手可能。

---

## 15. 実装セッション（2026-06-13 / レスポンシブ化 ＋ Gemini 移行の合意）

文脈を読み直して再開。ユーザーから2件: (A) レスポンシブ化を先に、(B) その後 Anthropic→Gemini（無料）移行。

### Gemini 移行の提案・合意
- ユーザー提案「Gemini API 無料枠なら添削を無料で行えるのでは？」。Claude（私）の評価: **プロジェクトの無料方針に合致し、課金懸念で保留していた Phase 3 添削を無料で稼働できる good idea**。
- **正直な注意点を提示**: ①無料枠は入力が学習に使われる規約（有料枠は不使用）→個人利用なら許容範囲だが明示、②RPM/RPD 制限あり、③無料枠スペックは変動するため実装前に最新確認。
- **合意した手順**: まず**ユーザーが Gemini 無料枠の最新スペック（モデル・上限・データ規約）を確認** → その後に実装着手。レスポンシブ化を先に完了させる。
- 実装方針: `CorrectionResponse` インターフェース維持で Gemini 実装（`@google/generative-ai`・env `GEMINI_API_KEY`）を追加、`/api/correct`・DB・プロンプト/デリミタ流用、env でプロバイダ切替。

### レスポンシブ化（実装完了）
- 調査の結果、**ページ群は元々 `sm`/`lg` ブレークポイントで組まれており**、唯一の致命的問題は **アプリ内サイドバーが `hidden md:flex` でモバイルではナビ手段が消失**する点だった。
- 対応:
  - ナビ項目を `src/components/app/nav-items.ts` に共通化（サイドバーとモバイルで共有）。
  - `src/components/app/mobile-nav.tsx` を新規追加（ハンバーガー→左ドロワー・背景オーバーレイ・ルート遷移で自動クローズ・背景スクロールロック・`md:hidden`）。
  - `topbar.tsx` 左にハンバーガーを配置、`px-4 sm:px-5` に調整。
  - ランディングヘッダーの「ログイン」を `< sm` で非表示にして狭幅の崩れを防止。
- 型チェック（`tsc --noEmit`）・lint ともにパス。実機/devtools の目視確認はユーザー側に委ねる。

### 次の予定
- ユーザーが Gemini 無料枠スペックを確認後、Gemini 添削を実装（`@google/generative-ai` 導入・プロバイダ切替）。

---

## 16. 実装セッション（2026-06-13・続き / Gemini 添削の実装）

ユーザーが Gemini 無料枠スペックを確認（**gemini-2.5-flash / 10 RPM・250,000 TPM・250 RPD / データ利用は許容**）→ そのまま実装。

### 実装内容
- **SDK**: `@google/genai`（新しい統合 SDK。旧 `@google/generative-ai` ではなくこちらを採用）を導入。
- **共通化**: 型・システムプロンプト（`<user_text>` デリミタによるインジェクション対策込み）・出力正規化・JSON 抽出を `src/lib/correction.ts` に集約し、Gemini / Anthropic 両実装で共有。
- **Gemini 実装** `src/lib/gemini.ts`: `gemini-2.5-flash`、`responseMimeType: application/json` + `responseSchema` で構造化出力を強制（手動パースより堅牢）、`temperature 0.3`。usageMetadata からトークン数を取得。
- **Anthropic** は `correctWithAnthropic` にリネームして共通モジュール利用に変更（任意プロバイダとして温存）。
- **プロバイダ切替**: `correction.ts` の `resolveProvider()`＝env `LLM_PROVIDER`（gemini/anthropic）→ 未指定ならキーのある方（**Gemini 優先**）。`correctText()` は動的 import で未使用 SDK を読み込まない。
- **API** `/api/correct`: `isCorrectionConfigured()` でキー有無を判定し、未設定時はプロバイダ非依存の 503。`correctText` を共通モジュールから呼ぶように変更。
- `.env.example` に `LLM_PROVIDER` / `GEMINI_API_KEY` / `GEMINI_MODEL` を追記。Gemini を既定にし、Anthropic キーは空例に。
- 型チェック・lint パス。

### ユーザー側の残作業（動作確認）
1. `0003_corrections.sql` を Supabase SQL Editor で実行（履歴・添削回数の保存用）。
2. https://aistudio.google.com/apikey で**無料**キー取得 → `.env.local` に `GEMINI_API_KEY=` 設定 → dev 再起動。
3. `/learn/typing` で英文を入力し、添削が返ること・ダッシュボードの添削回数が増えることを確認。

### 意義
- これまで「課金が怖いので保留」だった Phase 3 添削が、**無料で稼働可能**になった。従量課金の Anthropic は env 切替でいつでも併用可能。

### 次の予定
- Gemini 添削の動作確認（ユーザー）。その後 TOEIC 問題の Gemini 自動生成や Phase 4 残りへ。

---

## 17. デバッグ: 添削API が 500（service_role の GRANT 不足）→ 修正・稼働確認（2026-06-13）

### 症状
- `/learn/typing` で「添削する」を押すとボタンが一瞬回って何も出ない。ターミナルに `POST /api/correct 500`。

### 切り分け
1. `.env.local` を確認 → `GEMINI_API_KEY=AQ.Ab8...`（`AIza...` でない新形式）。**キーを直接テスト**（models.list を x-goog-api-key ヘッダーで叩く）→ **HTTP 200**＝キーは有効。原因はキーではない。
2. 500 は Gemini 呼び出し前（レート制限の usage_log 参照）と推定 → **service_role キーで REST に直接アクセス**して確認 → `usage_log`/`corrections`/`toeic_attempts` すべて **403**。
3. 原因確定: プロジェクト設定「Automatically expose new tables: OFF」のため、新規テーブルは明示 GRANT した role のみアクセス可。マイグレーションは `authenticated` にしか GRANT しておらず、**サーバー側書き込みに使う service_role への GRANT が抜けていた**。service_role は RLS は飛び越えるが、テーブルの GRANT 権限は別途必要。

### 修正
- `supabase/migrations/0005_grant_service_role.sql` を作成し、service_role に `usage_log`/`corrections`/`toeic_attempts`/`profiles`/`level_tests` の GRANT を付与。ユーザーが Supabase で実行。
- 併せて `/api/correct` のエラーメッセージを具体化（500/502 の原因が画面・ログに出るよう改善）。

### 確認
- 実行後、service_role の REST アクセスが **403→200**。`/learn/typing` で Gemini 添削が返り（自然さ98/100 等）、`corrections`・`usage_log` に各1件保存を確認。**英会話添削が無料で完全稼働**。

### 再発防止（重要メモ）
- 今後 **新規テーブルを足したら service_role にも GRANT** する（admin クライアントで触る場合）。PROJECT_STATUS の「Supabase プロジェクト情報」に注意書きを追加済み。

### 次の予定
- 一連の変更（Gemini 実装・0005・docs）のコミット&push。その後 TOEIC 問題の Gemini 自動生成 / Phase 4 残り等。

---

## 18. 添削の採点を辛口化（2026-06-13）

### 症状
- 誤りだらけの自己紹介文（"I am student", "I studying ... every days", "English are", "I can not writes", "I wants work" 等）に **90点**が出て甘すぎる、とユーザー指摘。

### 原因
- `CORRECTION_SYSTEM_PROMPT` に採点基準が無く、「良い点を褒める」方向に寄っていた。

### 修正
- `src/lib/correction.ts` のシステムプロンプトを「プロの英語試験官」スタンスに変更し、**naturalness の採点ルーブリック（誤りの個数→スコア帯: 0–1個=85+, 1–2個=70–84, 3–5個=55–69, 6–9個=40–54, 10個以上=20–39）**を明記。「励ましでスコアを上げない」「誤りを1つ残らず指摘」「まず誤り数を数えてから採点」と指示。
- 実機相当の検証（一時スクリプトで実際に Gemini に投げる）で **同一英文 90点→28点**・誤り7件指摘を確認。スクリプトは検証後に削除。
- 共通プロンプトなので Anthropic 側にも同じ厳格基準が適用される。

### 次の予定
- 採点厳格化のコミット&push。その後 TOEIC の Gemini 自動生成 / Phase 4 残り等。

---

## 19. Phase 4 残りの一部実装（進捗可視化・2026-06-13）

ユーザー「Phase 4 の残りをお願いします」。残3項目のうち、Cron 不要で価値の高い2つを実装。

### 実装内容
- `src/lib/activity.ts` に集計関数を追加:
  - `getDailyActivity(supabase, userId, days=7)`: 直近7日の1日あたり学習回数（toeic_attempts＋corrections）を**生データから render 時集計**（daily_stats バッチ/Cron は使わない）。0回の日も0で埋めて7要素返す。
  - `getCorrectionMistakeStats(supabase, userId)`: corrections.feedback.corrections[].category を横断集計し、カテゴリ別件数を多い順に返す。
- **ダッシュボード**: 「直近7日間の学習」棒グラフ（CSS のみ・チャートライブラリ不使用）を統計サマリーの下に追加。
- **`/history`**: 「英会話添削の傾向」カード（カテゴリ別件数バー・rose 色）を TOEIC 傾向の下に追加。データが無ければ非表示。
- 型チェック・lint パス。

### Phase 4 の残（次）
- 復習モード `/learn/review`（過去の間違いから Gemini で復習問題を生成）。これだけが未実装。
- `daily_stats` 事前集計バッチ（Cron）は render 時集計で代替済みのため当面不要。

### 次の予定
- 復習モード `/learn/review` の実装（Gemini・無料枠）。または本実装のコミット&push。

---

## 20. 復習モード /learn/review 実装 → Phase 4 完了（2026-06-13）

ユーザー「復習モードお願いします」。Phase 4 最後の項目を実装。

### 実装内容
- `src/lib/activity.ts` に `getRecentMistakeExamples`（corrections.feedback から実際の誤→正ペアを最大6件抽出）を追加。
- `src/lib/review.ts`: `generateReviewQuestions({ weakCategories, mistakeExamples, count })`。Gemini（gemini-2.5-flash）+ responseSchema で**4択問題の配列**を生成。options が4個でない/answer が0〜3でない問題は正規化で捨てる。temperature 0.7。
- API `POST /api/review/generate`: 認証 → GEMINI_API_KEY 必須チェック → usage_log 日次レート制限（添削と共有の200/日）→ 弱点収集（getToeicCategoryStats の accuracy<80＋getCorrectionMistakeStats 上位3＋誤り例）→ 生成 → usage_log 記録。
- 画面 `/learn/review`（intro→loading→quiz→result）。1問ごと即時正誤＆解説、結果に正答率、「新しい問題で復習」で再生成。履歴が無くても「基礎文法全般」で出題。
- 導線: nav-items に「弱点復習」（Repeat アイコン）、/history ヘッダーに「弱点を復習する」CTA。

### 検証
- 一時スクリプトで実際に Gemini に弱点（時制/冠詞/主述一致）＋誤り例を渡して生成 → 3問すべて4択・answer 妥当・弱点反映（an / plans / produces）を確認。スクリプトは削除。
- 型・lint パス。

### Phase 4 完了
- 学習履歴・TOEIC傾向・添削傾向・7日グラフ・ダッシュボード強化・復習モードまで実装。daily_stats バッチ（Cron）は render 時集計で代替済みのため不要。

### 次の予定（候補）
- TOEIC 問題の Gemini 自動生成（toeic_questions バンク）、Part 6/7、ゲーミフィケーション（バッジ/ストリーク実データ）、Vercel 本番設定。
