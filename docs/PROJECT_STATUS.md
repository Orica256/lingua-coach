# プロジェクト現状サマリー

> このファイルは他PC・別セッションで作業を再開する際の引き継ぎ用ドキュメントです。
> Claude Code に「このファイルを読んで文脈を把握して」と一声かければ続きから作業可能です。
> **更新ルール**: 大きな決定や進捗があれば随時このファイルを更新してください。

最終更新: 2026-06-11（Phase 2 完了 / Vercel デプロイ進行中）

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

### 次のステップ（ROADMAP.md Phase 3: タイピング添削）
- Anthropic APIキー発行・`.env.local` に `ANTHROPIC_API_KEY` 追加
- 添削画面 `/learn/typing` 実装:
  - シーン選択（プリセット or 自由入力）
  - 英文入力フォーム → Claude API で添削（文法ミス・自然な表現・改善例）
  - 結果表示・`usage_log` 記録
- レート制限（Upstash Redis or メモリキャッシュ）

### ⚠️ 新しいPCで開発する際の注意
- `npm install` が必要（node_modules は Git 管理外）
- **`.env.local` の再作成が必要**（Git 管理外なのでクローンには含まれない）。
  これが無いと `Your project's URL and Key are required...` エラーで起動失敗する。
  [.env.example](../.env.example) をコピーして以下を設定:
  - `NEXT_PUBLIC_SUPABASE_URL=https://sshauvkhsdpwkgagcvfi.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`（Supabase → Settings → API から取得）
  - `ANTHROPIC_API_KEY`（Phase 3 から必要）
  - 保存後は開発サーバー再起動（環境変数は起動時のみ読込）
- **git の user.name / user.email を設定**（未設定だと `unknown` 名でコミットされる）:
  `git config --global user.name "Orica256"` / `git config --global user.email "..."`
- **gitleaks のインストールが別途必要**（pre-commit フックが利用）:
  `winget install --id Gitleaks.Gitleaks` → ターミナル再起動で PATH 反映
- 未インストールでもコミットは可能だが、その場合シークレット検査はスキップされる

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
- **Tailwind v4 を採用（2026-06-11）**: Phase 0 で導入された shadcn 4.x / base-ui / oklch / tw-animate-css は Tailwind v4 前提だが、初期化時に v3 が入っており不整合でビルドが壊れていた。v4 に統一して解消。今後 `npx shadcn add` で生成されるコードとも整合する。テーマ設定は JS config ではなく `globals.css` の `@theme inline` で管理する（v4 は CSS ファースト）。
