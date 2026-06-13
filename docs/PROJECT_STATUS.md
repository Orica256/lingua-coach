# プロジェクト現状サマリー

> このファイルは他PC・別セッションで作業を再開する際の引き継ぎ用ドキュメントです。
> Claude Code に「このファイルを読んで文脈を把握して」と一声かければ続きから作業可能です。

---

## 📌 運用ルール（Claude Code は必ず守ること）

**コードの修正・追加、またはユーザーからの新しい要望・方針変更があった場合は、
その都度この `PROJECT_STATUS.md` と必要に応じて `CHAT_HISTORY.md` に必ず記録を残すこと。**

- **コード変更時**: 「完了」セクションに何をどのファイルで実装/修正したか追記する。
- **新しい要望・方針が出たとき**: 「開発判断のメモ」または該当セクションに、
  内容・理由・決定日（絶対日付）を記録する。
- **詰まった点・環境依存の問題**: 「新しいPCで開発する際の注意」等に再発防止メモを残す。
- 記録は**作業の直後に**行い、コミットに含めて push する（他PC・他チャットへ即共有するため）。
- これにより、いつ別環境・別セッションで再開しても文脈が途切れないようにする。

---

最終更新: 2026-06-13（**レスポンシブデザイン化 実装完了（モバイルドロワーナビ追加）** / Phase 3 添削実装済〔Anthropic→Gemini 無料移行を検討中〕 / Phase 5 TOEIC Part 5 実装完了・動作確認済み・問題40問 / Phase 4 学習履歴・傾向分析（一部）実装完了〔APIキー不要〕 / 新規PC向け setup.ps1 / Vercel デプロイ進行中）

---

## 🎯 プロジェクト概要

**名称**: AIパーソナル英会話コーチ（仮称: LinguaCoach）
**目的**: 個人学習用の英会話Webアプリ。Claude APIを活用し、文法・表現の添削、レベル判定、間違い傾向分析を提供する。
**開発者スキル**: プログラミング初心者（Claude Codeを最大限活用しながら学ぶ前提）

---

## ✅ 確定済み仕様

| 項目 | 内容 |
|---|---|
| プラットフォーム | Webアプリ |
| 対象レベル | 全レベル対応（CEFR A1〜C2）+ レベル判定テスト |
| 入力方式 | **選択式 + 記入式のみ**（音声入力は実装しない） |
| 音声出力 | **Web Speech API（ブラウザ標準・無料）のみ** |
| AI | Claude API（claude-sonnet-4-6） ※従量課金許容 |
| レベル判定 | 選択式クイズ（文法・語彙、20問程度） |
| 学習トピック | プリセット + ユーザー自由設定（両方） |
| 進捗管理 | 本格的（間違い傾向分析・ダッシュボード） |
| 認証/DB | Supabase（無料枠） |
| ホスティング | Vercel（無料枠）+ Vercelサブドメイン |
| ゲーミフィケーション | ストリーク + バッジ/業績システム |
| UI | ダークモード中心・テック風 |
| MVP範囲 | 中規模（添削＋レベル判定＋履歴） |

---

## 🛠 確定技術スタック

### 言語・フレームワーク
- TypeScript 5.x
- Next.js 14.x (App Router)
- React 18.x
- Tailwind CSS 4.x（CSSファースト・`@theme inline` でテーマ管理）
- shadcn/ui
- Zustand（状態管理）
- React Hook Form + Zod（フォーム検証）

### バックエンド・インフラ
- Next.js API Routes
- Supabase（Auth + PostgreSQL + RLS）
- Vercel（ホスティング）
- Upstash Redis（レート制限・無料枠検討）

### AI・音声
- Claude API（claude-sonnet-4-6）
- Web Speech API（音声出力のみ）

### 開発ツール
- ESLint / Prettier
- Husky + lint-staged
- gitleaks（APIキー漏洩防止）
- Vitest（テスト）

---

## 💰 想定コスト

- Claude API: 月$3〜10（個人利用想定、ユーザーが負担）
- その他（Vercel/Supabase/ドメイン/音声出力）: 全て無料枠内
- **追加費用が発生しない方針**で設計（Claude Pro/ChatGPT Plus はサブスクUIのため、アプリ組込み不可と確認済み）

---

## 🔐 セキュリティ方針

個人開発でも本格的に対策する方針。詳細は [SECURITY.md](SECURITY.md) 参照。

主な対策:
- APIキーはサーバーサイドのみ、`.env.local` 管理 + gitleaks
- Supabase RLS 全テーブル有効化
- レート制限（1ユーザー1日200リクエスト等）
- Zod入力バリデーション
- プロンプトインジェクション対策（デリミタ + システムプロンプト明示）
- CSP / セキュリティヘッダー
- Anthropicコンソール月次予算アラート（$20）

---

## 📁 リポジトリ構成（現状）

```
完全AIファイル/  (= GitHub: Orica256/lingua-coach)
├── .gitignore
├── README.md                  # プロジェクト概要
├── LinguaCoach_Docs.xlsx      # ドキュメント Excel 版
├── export_to_excel.ps1        # Excel 出力スクリプト
└── docs/
    ├── ARCHITECTURE.md        # アーキテクチャ設計
    ├── DATABASE.md            # DBスキーマ
    ├── SECURITY.md            # セキュリティ詳細
    ├── ROADMAP.md             # 開発ロードマップ
    ├── PROJECT_STATUS.md      # このファイル
    └── CHAT_HISTORY.md        # 主要な会話の経緯
```

**GitHub**: https://github.com/Orica256/lingua-coach (Private)

---

## 🚦 現在地・次のステップ

### 完了
- ✅ アプリ案出し（英会話コーチに決定）
- ✅ 仕様詳細決定（音声入力削除、添削特化）
- ✅ 技術スタック確定
- ✅ 設計ドキュメント一式作成（README + docs/4点）
- ✅ Excel 版ドキュメント出力
- ✅ GitHub リポジトリ作成・初回push 完了
- ✅ **Phase 0: Next.js 14 + shadcn/ui 初期化、セキュリティヘッダー、`.env.example`**（コミット 253fda0）
- ✅ **Tailwind v4 へ移行**（v3 との不整合でビルドが壊れていたのを解消／コミット 00d5b4c）
- ✅ **ランディングページを LinguaCoach 用に差し替え**（ダークモード・テック風）
- ✅ **gitleaks 8.30 インストール + Husky pre-commit フック**（シークレット漏洩をコミット前にブロック・動作検証済み）
- ✅ **Phase 1 UI 土台**（コミット fc815f4）:
  - 認証画面 `/login`・`/signup`・`/reset-password`（`(auth)` ルートグループ）
  - ダッシュボード `/dashboard`（`(app)` ルートグループ、サイドバー＋ヘッダー＋カード）
  - 共通部品 `Logo` / `GridGlow`、shadcn の input/label/card を追加
- ✅ **Phase 1 認証接続**（コミット 7ce7fe8・Supabase 連携済み）:
  - `@supabase/ssr` でクライアント設定（browser / server / middleware）
  - ログイン（signInWithPassword）・サインアップ（signUp＋確認メール）・
    パスワード再設定（resetPasswordForEmail → `/auth/update-password`）・ログアウト
  - 認証ミドルウェア: 未ログインで保護ルート→`/login`、ログイン済みで `/login`・`/signup`→`/dashboard`
  - `/auth/callback` でメールリンクのコード交換
- ✅ **Phase 1 DB**（コミット 397cb36）:
  - `profiles`・`usage_log` テーブル作成（[supabase/migrations/0001](../supabase/migrations/0001_profiles_usage_log.sql)）
  - RLS ポリシー、新規ユーザーで profiles 自動生成トリガー、updated_at トリガー
  - ダッシュボードが RLS 経由で本人プロフィール（表示名/CEFRレベル/ストリーク）を表示
- ✅ **Phase 2: レベル判定テスト**（コミット 58906ce・動作確認済み）:
  - `level_tests` テーブル作成（[supabase/migrations/0002](../supabase/migrations/0002_level_tests.sql)）— RLS・insert ポリシー付き／**Supabase に実行済み**
  - 20問クイズデータ（[src/data/level-quiz.ts](../src/data/level-quiz.ts)）— A1×3・A2×3・B1×4・B2×4・C1×3・C2×3
  - `/onboarding` ページ: ようこそ画面 → クイズ（4択・1問ずつ・プログレスバー）→ 結果表示（CEFR レベル・スコア）
  - API `POST /api/level-test/submit`: 採点・`level_tests` 保存・`profiles.cefr_level` 更新
  - ダッシュボードの「判定を始める」ボタン → 完了後にレベルカードへ自動反映（接続済み）
  - ✅ ローカルでテスト通し・結果表示・ダッシュボード反映まで動作確認済み
- ✅ **Phase 3: タイピング添削 実装完了**（型チェック・lint パス済み・※APIキー設定後に動作確認）:
  - `corrections` テーブル作成（[supabase/migrations/0003](../supabase/migrations/0003_corrections.sql)）— RLS（本人のみ select）。**書き込みはサーバーの service_role が行う**ため insert ポリシーは無し。**※Supabase の SQL Editor で要実行（未実行）**
  - `@anthropic-ai/sdk` 導入。Claude 添削ロジック [src/lib/anthropic.ts](../src/lib/anthropic.ts)：システムプロンプトで役割固定＋`<user_text>` デリミタでプロンプトインジェクション対策、JSON 構造化出力（修正文・自然さ score・カテゴリ別の指摘・改善例）をパース＆正規化
  - service_role 用クライアント [src/lib/supabase/admin.ts](../src/lib/supabase/admin.ts)（RLS バイパス・サーバー専用）
  - API `POST /api/correct`（[route](../src/app/api/correct/route.ts)）：認証→入力検証（最大2000字）→**レート制限（`usage_log` ベースで1日200回）**→Claude 呼び出し→`usage_log`＋`corrections` 保存。APIキー未設定時は 503 で分かりやすいメッセージ
  - 画面 `/learn/typing`（[page](../src/app/(app)/learn/typing/page.tsx)）：シーン選択（プリセット6種＋自由入力）→英文入力→添削結果（修正文・自然さスコア・カテゴリ別指摘・改善例）。ダークテック風 UI
  - プリセットシーン [src/data/typing-scenes.ts](../src/data/typing-scenes.ts)
  - ダッシュボードの「添削回数」を `corrections` 件数に接続
  - ⚠️ **動作確認の前提（残タスク）**: ① Supabase SQL Editor で `0003_corrections.sql` を実行 ② `.env.local` の `ANTHROPIC_API_KEY` に値を設定（Anthropic Console で発行・予算上限$20）→ 開発サーバー再起動
- ✅ **Phase 5: TOEIC Part 5 演習（最小縦割り）実装完了・動作確認済み**（型チェック・lint パス済み・**APIキー不要で動作**）:
  - `toeic_attempts` テーブル作成（[supabase/migrations/0004](../supabase/migrations/0004_toeic_attempts.sql)）— RLS・本人 insert ポリシー付き。**Supabase SQL Editor で実行済み**（ユーザーが Part 5 演習を通しで動作確認・2026-06-11）
  - 自作シードバンク [src/data/toeic-part5-seed.ts](../src/data/toeic-part5-seed.ts) — **オリジナル Part 5 問題40問**（公式過去問の転載なし／2026-06-12 に 20→40 問へ拡充）。品詞/動詞の形/前置詞/接続詞/関係詞/代名詞/比較/数量/語彙の9カテゴリをほぼ均等（各4〜6問）に配置。各問に日本語解説・目標スコア帯付き。出題は全プールからランダム10問、採点・カテゴリ集計はすべて id 照合のため、新 id 追加だけで安全に拡張できる構造
  - API `POST /api/toeic/submit`（[route](../src/app/api/toeic/submit/route.ts)）: サーバー側採点 → `toeic_attempts` 保存（クライアントの自己申告は不採用）
  - 画面: [/learn/toeic](../src/app/(app)/learn/toeic/page.tsx)（パート選択ハブ・Part 6/7・Listening は「今後追加」表示）、[/learn/toeic/part5](../src/app/(app)/learn/toeic/part5/page.tsx)（10問ランダム出題・1問ごとに即時正誤＆解説・結果に正答率＆復習一覧）
  - 導線追加: サイドバーに「TOEIC学習」、ダッシュボードの「学習を始める」に TOEIC ボタン。既存の「タイピング添削」表記は「英会話添削」に変更
  - ✅ 0004 実行済み・`/learn/toeic/part5` でユーザーが10問演習を通しで動作確認（2026-06-11）
  - 次の拡張: Claude で Part 5 問題を追加生成しバンク化（`toeic_questions` テーブル＋ `/generate`・**APIキー登録後**）、Part 6/7・Listening、TOEIC スコア推定
- ✅ **Phase 4: 学習履歴・傾向分析（一部）実装完了**（型チェック・lint パス済み・**APIキー不要**・新テーブル不要）:
  - 共通集計ロジック [src/lib/activity.ts](../src/lib/activity.ts): `getRecentActivity`（toeic_attempts / corrections / level_tests を横断し時系列マージ。テーブル未作成でも data=null を空配列として扱い安全）、`getToeicCategoryStats`（toeic_attempts.answers ×シードで Part 5 カテゴリ別正答率を集計＝弱点可視化）、`formatActivityDate`
  - 学習履歴ページ [/history](../src/app/(app)/history/page.tsx): TOEIC 傾向分析（カテゴリ別バー・正答率の低い順）＋ 学習履歴タイムライン（直近30件）。空状態あり
  - ダッシュボード強化 [dashboard](../src/app/(app)/dashboard/page.tsx): 統計の「学習時間」を実データの「TOEIC演習」回数に差し替え、「最近の学習」を実データ（直近5件）＋「すべて見る」→ `/history` 導線に接続
  - ⚠️ **未実装（後段・要APIキー or Cron）**: 復習モード `/learn/review`（過去の間違いから Claude で復習問題生成）、`daily_stats` 集計バッチ＋直近7日グラフ、`mistakes` 由来の英会話添削の傾向（corrections が貯まってから）
- ✅ **レスポンシブデザイン化 実装完了**（型チェック・lint パス済み・2026-06-13）:
  - **最大の問題＝アプリ内サイドバーが `hidden md:flex` でモバイルではナビ消失**だった点を解消。モバイル用ドロワーナビ [src/components/app/mobile-nav.tsx](../src/components/app/mobile-nav.tsx) を追加（ハンバーガー→左ドロワー・背景オーバーレイ・ルート遷移で自動クローズ・背景スクロールロック）
  - ナビ項目を [src/components/app/nav-items.ts](../src/components/app/nav-items.ts) に共通化し、サイドバー（PC）とドロワー（モバイル）で共有
  - [topbar](../src/components/app/topbar.tsx) 左にハンバーガー（`md:hidden`）を配置。`px-4 sm:px-5` に調整
  - ランディング [page](../src/app/page.tsx) ヘッダーの「ログイン」を `< sm` で非表示にして狭幅の崩れを防止（ヒーロー内に同ボタンあり）
  - 既存ページは元々 `sm`/`lg` ブレークポイントで組まれており（grid-cols / flex-col→sm:flex-row 等）、追加修正は不要だった
  - ⚠️ 実機・devtools での目視確認はユーザー側で推奨（dev サーバーで幅360px等を確認）

### Supabase プロジェクト情報
- Project URL: `https://sshauvkhsdpwkgagcvfi.supabase.co`
- キーは `.env.local`（Git 管理外）に設定済み
- プロジェクト作成時設定: Data API ON / auto-expose new tables OFF / automatic RLS ON
- テスト時は Authentication → Email の「Confirm email」を OFF にして検証（本番前に要再考）
- マイグレーションは Supabase の SQL Editor に手貼りして実行（Supabase CLI は未導入）

### Phase 0/外部サービスの残タスク（ユーザー側）
- Anthropic アカウント・APIキー発行（Phase 3 で使用）、予算上限$20設定
- Vercel アカウント・GitHubリポジトリ連携（自動デプロイ・公開URL）

### 🔧 進行中: Vercel デプロイ（中断中・ユーザー作業）
スマホ確認のため Vercel へデプロイ中。ユーザーがブラウザで以下を実施する想定:
1. Vercel に GitHub 連携でサインアップ（Hobby 無料）
2. `lingua-coach` リポジトリを Import（Framework: Next.js 自動検出）
3. **環境変数を3つ登録**（`.env.local` からコピー）:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy（2〜3分）→ `https://〇〇.vercel.app` を取得
5. **【未完・重要】** 取得した本番URLを Supabase に許可登録しないと本番で認証が動かない:
   - Supabase → Authentication → URL Configuration
   - Site URL を本番URLに、Redirect URLs に `https://〇〇.vercel.app/**` を追加
   - （ローカル開発用に `http://localhost:3000/**` も残す）
> 再開時: ユーザーに Vercel の本番URLを確認し、上記ステップ5（Supabase 側設定）を案内する。

### 次のステップ
0. ✅ **済: レスポンシブデザイン化**（2026-06-13 実装完了）。モバイルでサイドバーが消えてナビ不能だった問題をドロワーナビで解消。全ページは既存ブレークポイントで対応済み。→ 実機での目視確認のみ残（ユーザー）。
1. 🔜 **次に着手予定: 英会話添削の AI を Anthropic → Gemini（無料枠）へ移行（2026-06-13 ユーザー提案・優先）**。
   - 手順: **(1) ユーザーが Gemini 無料枠の最新スペック（モデル・RPM/RPD 上限・データ利用規約）を確認** → (2) 確認後に実装着手。
   - 実装方針: `src/lib/anthropic.ts` と同じ戻り値インターフェース（`CorrectionResponse`）で Gemini 実装（`@google/generative-ai`・env `GEMINI_API_KEY`）を追加し、`/api/correct`・DB保存・プロンプト/デリミタはほぼ流用。Gemini の JSON スキーマ出力で堅牢化。env でプロバイダ切替可に。
   - 詳細は「開発判断のメモ」参照。
2. ✅ **済: TOEIC Part 5 の動作確認**（0004 実行済み・10問演習を通しで確認・2026-06-11）。`/history` の TOEIC 傾向分析・タイムラインもこのデータで表示される。
2. **APIキー登録後にまとめて実施（課金が本当に必要になった段階）**:
   - [0003_corrections.sql](../supabase/migrations/0003_corrections.sql) 実行 + `ANTHROPIC_API_KEY` 設定 → `/learn/typing`（Phase 3 タイピング添削）の動作確認
   - TOEIC 問題の Claude 生成（`toeic_questions` バンク + `/api/toeic/generate`）を追加
3. **TOEIC の横展開**: ~~Part 5 の問題数追加~~（2026-06-12 に 40 問へ拡充済み・さらなる追加も可）、Part 6/7、Listening（Web Speech API TTS）、TOEIC スコア推定。
4. **Phase 4 の残り**: 復習モード `/learn/review`（要APIキー）、`daily_stats` 集計＋直近7日グラフ（要 Cron）、英会話添削（corrections）の傾向分析（データが貯まってから）。
   - ※`/history`・TOEIC傾向分析・ダッシュボードの最近の学習/TOEIC演習回数は実装済み。

### ⚠️ 新しいPCで開発する際の注意
- **まず [scripts/setup.ps1](../scripts/setup.ps1) を1回実行する**（Windows / PowerShell・**管理者権限不要**）。
  これ1つで以下を自動化する:
  - **Node.js LTS を winget の user スコープで自動インストール**（未導入時のみ。バージョン管理ツール nvm/fnm は使わず Node を直接導入する方針＝2026-06-12 決定）
  - 導入した Node の場所を**現在のシェルの PATH に反映**（VS Code 再起動なしで続行可能）
  - `npm install`
  - `.env.local` が無ければ [.env.example](../.env.example) から雛形を作成
  - gitleaks が未導入なら winget の user スコープで導入（任意・失敗しても続行）
  - 実行ポリシーで止まる場合: `powershell -ExecutionPolicy Bypass -File ./scripts/setup.ps1`
- **`.env.local` は Git 管理外**なのでクローンには含まれない。無いと `Your project's URL and Key are required...` で起動失敗する。
  setup.ps1 が雛形を作るので、以下を貼り付ける（保存後は dev サーバー再起動。環境変数は起動時のみ読込）:
  - `NEXT_PUBLIC_SUPABASE_URL=https://sshauvkhsdpwkgagcvfi.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`（Supabase → Settings → API から取得）
  - `ANTHROPIC_API_KEY`（**当面は空でOK**。従量課金が必要な機能を使うときだけ設定）
- **git の user.name / user.email を設定**（未設定だと `unknown` 名でコミットされる）:
  `git config --global user.name "Orica256"` / `git config --global user.email "..."`
- **winget で Node を入れた直後の PATH 反映**: 別の新規ターミナルで `npm` が「認識されません」になる場合は、**VS Code を完全に再起動**するか、setup.ps1 を実行した同じシェルで続行する（winget の user スコープ PATH 更新は新規シェルの再起動が必要）。
- **PowerShell スクリプトは UTF-8 BOM 付きで保存すること**（日本語 Windows の PowerShell 5.1 は BOM 無し UTF-8 を cp932 と誤読し、日本語コメントの一部バイトが `{}"` と衝突してパースエラーになる）。setup.ps1 は BOM 付きで保存済み。

---

## 🔄 別PC・別セッションで再開する手順

```powershell
# 1. リポジトリをクローン（初回のみ）
git clone https://github.com/Orica256/lingua-coach.git
cd lingua-coach

# 2. 最新を取得
git pull

# 3. Claude Code を起動し、以下のメッセージを送る
#    「docs/PROJECT_STATUS.md と docs/CHAT_HISTORY.md を読んで、
#     プロジェクトの文脈を把握してください。続きから開発を進めます」
```

---

## 📝 開発判断のメモ

会話で決定された重要な判断:

- **音声入力は不採用**: Whisper API代を避けるため。記入式 + 選択式に絞る
- **音声出力は無料のみ**: Web Speech API（ブラウザ標準）。OpenAI TTS は不採用
- **Claude Pro/ChatGPT Plus は組込み不可**: WebUI利用権のみで、API利用は別課金と確認
- **Supabase + Vercel を選定**: 完全無料枠で運用可能なため
- **Next.js App Router 採用**: SSR + APIルートが1プロジェクトで完結し、初心者にも管理しやすい
- **ストリーク + バッジ採用**: ゲーミフィケーション要素は継続性のため必須
- **コミットに Claude の署名を付けない（2026-06-11）**: `Co-Authored-By: Claude ...` 等の AI 署名はコミットメッセージ・PR本文に付けない方針（GitHub 上に表示されるのを避けるため）。過去分は `git filter-branch` で除去済み。
- **変更・要望は必ず記録する（2026-06-11）**: コードの修正/追加やユーザーからの新しい要望が出た際は、その都度 `PROJECT_STATUS.md`（必要なら `CHAT_HISTORY.md`）に記録を残す運用とする。冒頭の「運用ルール」セクション参照。理由: 別PC・別チャットで再開しても文脈を失わないため。
- **Tailwind v4 を採用（2026-06-11）**: Phase 0 で導入された shadcn 4.x / base-ui / oklch / tw-animate-css は Tailwind v4 前提だが、初期化時に v3 が入っており不整合でビルドが壊れていた。v4 に統一して解消。今後 `npx shadcn add` で生成されるコードとも整合する。テーマ設定は JS config ではなく `globals.css` の `@theme inline` で管理する（v4 は CSS ファースト）。
- **TOEIC 学習機能の追加要望（2026-06-11）**: 本アプリを英会話添削だけでなく **TOEIC 学習にも使いたい**との要望。TOEIC 専用の学習機能（パート別の問題演習・スコア推定・傾向分析など）を今後のフェーズで追加する方針。
  - **問題ソースの注意（重要）**: ユーザーは「Web 上の過去問の流用も許可する」と述べたが、**TOEIC の公式過去問・実試験問題は ETS の著作権で保護され、商標「TOEIC」も ETS の登録商標**であり、第三者が流用を許可できる対象ではない。Web からの転載は著作権侵害リスクがあるため採用しない。
  - **決定した方針（2026-06-11）**: 上記 (a)(b) を**ハイブリッドで併用**する。すなわち **自作のオリジナル・シード問題バンク**（APIキー不要で即動作・品質が安定）を土台にしつつ、**Claude API で TOEIC 形式のオリジナル問題を追加生成**して同じ `toeic_questions` バンクに蓄積・再利用する。過去問の転載は不採用。
  - **最初に着手するパート（2026-06-11）**: **Part 5（短文穴埋め・文法/語彙、4択）**。既存の4択クイズ基盤を最小構成で縦に通す。
- **レスポンシブデザイン化の要望（2026-06-12）→ 実装完了（2026-06-13）**: 現状の UI を**スマホ／タブレットなど各画面幅に対応（レスポンシブ）**させてほしいとの要望。理由: PC 前提のレイアウトのままだと、Vercel デプロイ後にスマホで確認する際に崩れるため。**実装結果**: 既存ページは元々ブレークポイント対応済みで、唯一の致命的問題＝モバイルでサイドバーが消えナビ不能だった点を、共通ナビ（nav-items.ts）＋モバイルドロワー（mobile-nav.tsx）＋Topbar ハンバーガーで解消。詳細は「完了」セクション参照。
- **新規PCのセットアップを自動化（2026-06-12）**: 別PCで clone した直後に Node 未導入・`node_modules` 不在・`.env.local` 不在で起動できない問題が再発したため、[scripts/setup.ps1](../scripts/setup.ps1) を追加。**Node バージョン管理ツール（nvm/fnm）は使わず、winget の user スコープで Node.js LTS を直接導入する方式**をユーザーが選択（理由: nvm-windows はバージョン切替に管理者権限/開発者モードが必要で「管理者権限不要」の要件と相性が悪い。複数 Node バージョンの使い分け予定も無い）。スクリプトは Node 自動導入＋現在シェルへの PATH 反映＋`npm install`＋`.env.local` 雛形＋gitleaks 導入まで一括。管理者権限不要。
- **API（従量課金）の登録は本当に必要になるまで延期する（2026-06-11）**: Anthropic API キーの登録は契約＝従量課金の発生を伴うため、**機能が本当に必要になった段階で登録**する方針。それまでは **APIキー不要で動作する部分（自作シードバンク等）を優先して開発・動作確認**する。
  - 影響: **Phase 3（タイピング添削）の Claude 連携部分の動作確認はキー登録時まで保留**（コードは実装済み・APIキー未設定時は 503 を返す）。
  - **Phase 5（TOEIC Part 5）は自作シードバンクで先行実装**し、APIキー不要でテスト可能にする。Claude による問題追加生成（`/generate`）はキー登録後に有効化する。
  - **アプリ方針との整合**: Part 5/6/7（Reading）はテキストベースで「選択式＋記入式のみ」の方針に完全に合致し、既存の4択クイズ基盤（level-quiz）を流用できる。Part 1〜4（Listening）は音声が必要で、本アプリは音声出力が Web Speech API のみのため、スクリプトの TTS 読み上げで擬似対応する想定（実試験音声との品質差に注意）→ 優先度は後段。
- **英会話添削の AI を Anthropic → Gemini（無料枠）へ移行する提案（2026-06-13）**: 「Gemini API の無料枠を使えば添削を無料で行えるのでは」とのユーザー提案。プロジェクトの「追加費用が発生しない方針」に合致し、これまで課金懸念で保留していた Phase 3 添削を**無料で稼働できる**のが最大の利点。
  - **メリット**: 個人利用なら実質$0（Google AI Studio のキー・課金登録不要）。Flash 系モデルで添削品質は十分。既存設計は LLM 呼び出しが `src/lib/anthropic.ts` に分離されているため**差し替えは呼び出し部のみ**。Gemini は JSON スキーマ出力に対応し、手動パースより堅牢化できる。将来の TOEIC 問題自動生成も同じ無料枠で実現可。
  - **注意点（要確認）**: ① **無料枠は入力データが製品改善（学習）に使われる規約**（有料従量枠は使われない）。日本リージョンは対象になり得る → 自分の英作文を入力する個人利用なら許容範囲だが方針として明示。② 無料枠には RPM/RPD のレート制限あり（個人利用なら十分・アプリ側の1日200回制限と併用）。③ 無料枠の正確な上限・対象モデルは変動するため実装前に最新値を確認。
  - **進め方の合意**: **まずユーザーが Gemini 無料枠の最新スペック（モデル・上限・データ利用規約）を確認** → その後に実装着手。レスポンシブ化を先に終わらせてから本件に進む（→ レスポンシブは 2026-06-13 完了済み）。
  - **実装方針**: `CorrectionResponse` インターフェースを保ったまま Gemini 実装（`@google/generative-ai`・env `GEMINI_API_KEY`）を追加。`/api/correct`・DB保存・プロンプト/`<user_text>` デリミタはほぼ流用。env でプロバイダ切替（Anthropic も残す）。
