# AIパーソナル英会話コーチ（仮称: LinguaCoach）

個人学習用の英会話学習Webアプリケーション。Claude APIを活用し、文法・表現の添削、レベル判定、学習履歴の傾向分析を提供します。

---

## 🎯 プロジェクト概要

24時間いつでも使えるAI英会話コーチ。リアルタイム音声対話ではなく、**タイピング/選択式での学習** に特化し、AIが**文法・表現を丁寧に添削**することで、書く力と語彙力を着実に伸ばすことを目的とします。

### 主な特徴
- **全レベル対応**: CEFR A1〜C2、レベル判定テストで自動振り分け
- **本格的な添削**: 文法ミス、より自然な表現、ニュアンスの違いまでAIが指摘
- **間違い傾向分析**: 苦手な文法項目を可視化し、復習クイズを自動生成
- **ゲーミフィケーション**: 連続学習日数（ストリーク）とバッジで継続をサポート
- **完全Web完結**: インストール不要、ブラウザだけで学習可能

---

## 🛠 使用技術（言語・フレームワーク・サービス）

### フロントエンド
| 技術 | バージョン目安 | 用途 |
|---|---|---|
| **TypeScript** | 5.x | 型安全な開発言語 |
| **Next.js** | 14.x (App Router) | Reactフレームワーク、SSR/APIルート |
| **React** | 18.x | UIライブラリ |
| **Tailwind CSS** | 3.x | スタイリング（ダークモード対応） |
| **shadcn/ui** | latest | UIコンポーネントライブラリ |
| **Lucide React** | latest | アイコン |
| **Zustand** | 4.x | クライアント状態管理 |
| **React Hook Form + Zod** | latest | フォームバリデーション |

### バックエンド / インフラ
| 技術 | 用途 |
|---|---|
| **Next.js API Routes** | サーバーサイドAPI（Claude API呼び出しの中継） |
| **Supabase** | 認証・PostgreSQLデータベース・Row Level Security |
| **Vercel** | ホスティング（無料枠） |

### AI / 音声
| 技術 | 用途 | 料金 |
|---|---|---|
| **Claude API（claude-sonnet-4-6）** | 添削・対話生成・問題生成 | 従量課金（負担） |
| **Web Speech API（SpeechSynthesis）** | 例文・問題文の音声出力 | 無料（ブラウザ標準） |

### 開発ツール
- **ESLint** / **Prettier**: コード品質維持
- **Husky** + **lint-staged**: コミット前自動チェック
- **Vitest**: ユニットテスト
- **Git** / **GitHub**: バージョン管理

---

## 📂 ディレクトリ構成（予定）

```
lingua-coach/
├── README.md
├── docs/
│   ├── ARCHITECTURE.md    # アーキテクチャ設計
│   ├── DATABASE.md        # DBスキーマ
│   ├── SECURITY.md        # セキュリティ対策
│   └── ROADMAP.md         # 開発ロードマップ
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (auth)/        # 認証関連ページ
│   │   ├── (dashboard)/   # ダッシュボード・学習画面
│   │   └── api/           # APIルート（Claude API中継等）
│   ├── components/        # UIコンポーネント
│   ├── lib/               # ユーティリティ（Supabase, Claude APIクライアント等）
│   ├── hooks/             # カスタムフック
│   ├── stores/            # Zustand状態管理
│   └── types/             # TypeScript型定義
├── public/                # 静的ファイル
├── .env.local             # 環境変数（Git管理外）
├── .env.example           # 環境変数テンプレート
└── package.json
```

---

## ✨ 主要機能

### 1. レベル判定テスト
- 文法・語彙の選択式クイズ（20問程度）
- 結果からCEFRレベル（A1〜C2）を推定

### 2. 学習モード
- **タイピング対話**: AIが状況を提示 → ユーザーが英文回答 → AIが添削
- **シーン別ロールプレイ**: カフェ注文、面接、空港など（プリセット + 自由設定）
- **選択式クイズ**: 文法・語彙・表現の選択問題
- **復習モード**: 過去の間違いから自動生成された復習問題

### 3. 添削機能
- 文法ミスの指摘と修正案
- より自然な表現の提案
- ニュアンスの違いを日本語で解説
- 使用頻度・フォーマル度の評価

### 4. 進捗ダッシュボード
- 連続学習日数（ストリーク）
- 累計学習時間、添削回数
- 間違い傾向グラフ（文法カテゴリ別ヒートマップ）
- 獲得バッジ一覧

### 5. ゲーミフィケーション
- **ストリーク**: 連続学習日数のカウント
- **バッジ**: 「100文添削達成」「初の面接シーン完了」「7日連続学習」など

---

## 🔐 セキュリティ対策

個人開発であっても、**API キーの漏洩・不正利用は実際の金銭被害に直結する** ため、以下の対策を実施します。詳細は [docs/SECURITY.md](docs/SECURITY.md) を参照。

### 必須対策（リリース前に必ず実施）

#### 1. APIキー管理
- **Claude APIキーは絶対にクライアントサイドに露出させない**
- `.env.local` に保存し、`.gitignore` で除外
- Next.js API Routes 経由でのみClaude APIを呼び出す（サーバーサイド限定）
- 環境変数命名: 公開してよいものだけ `NEXT_PUBLIC_` プレフィックス使用
- Vercel本番環境では Vercel の環境変数管理機能を使用

#### 2. 認証・認可
- Supabase Auth によるメール+パスワード認証（最低8文字、英数記号混在）
- Supabase の **Row Level Security (RLS)** をすべてのテーブルで有効化
- ユーザーは自分のデータのみアクセス可能なポリシーを設定
- セッショントークンはHttpOnly Cookieで管理（XSS対策）

#### 3. レート制限（API濫用・金銭被害防止）
- Next.js API Routesに **レート制限ミドルウェア** を実装
  - 1ユーザーあたり: 1分10リクエスト、1日200リクエストなど
- Upstash Redis（無料枠）または Supabase でカウンタ管理
- レート超過時は 429 を返却

#### 4. 入力バリデーション
- 全フォーム入力に **Zod スキーマ検証** を適用
- Claude APIへ送るユーザー入力は最大文字数を制限（例: 2000文字）
- プロンプトインジェクション対策: ユーザー入力は固定テンプレート内に明示的にデリミタ（例: `<user_input>...</user_input>`）で囲む

#### 5. XSS / CSRF 対策
- React のJSXによる自動エスケープを信頼（`dangerouslySetInnerHTML` は使わない）
- Content Security Policy (CSP) ヘッダーを `next.config.js` で設定
- SameSite=Lax Cookieを使用
- Next.js Server Actions または API Routes の標準CSRF保護を活用

#### 6. HTTPS / セキュリティヘッダー
- Vercelで自動HTTPS化
- `next.config.js` で以下のヘッダーを設定:
  - `Strict-Transport-Security`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy`

#### 7. 依存パッケージ管理
- `npm audit` を定期実行
- Dependabot（GitHub）で脆弱性自動通知
- 不必要なパッケージは入れない

#### 8. ログ・モニタリング
- Claude API呼び出しの **使用量を記録**（ユーザーごとのトークン消費量）
- 異常な使用パターン（短時間に大量リクエスト）を検知できるよう、Supabaseに `usage_log` テーブルを設置
- 月次予算アラートをAnthropicコンソールで設定（例: $20/月で通知）

#### 9. データ保護
- パスワードはSupabase側でbcryptハッシュ化（自動）
- 個人を特定可能な情報は最小限のみ保存（メールアドレスのみ）
- 学習履歴は暗号化されたPostgreSQL上に保存

#### 10. Git管理
- `.gitignore` に `.env*`, `node_modules`, `.next` を必ず含める
- GitHubにpushする前に **git-secrets** または **gitleaks** でAPIキー漏洩チェック
- リポジトリはPrivateで開始

---

## 🚀 セットアップ手順（開発初心者向け）

### 前提条件
- Git をインストール（Windows なら Git for Windows）
- GitHubアカウント
- Supabaseアカウント（無料）
- Anthropicアカウント（Claude APIキー取得用・**当面は不要**。従量課金が必要な機能を使うときだけ）
- Vercelアカウント（無料・デプロイ時）
- **Node.js は手動インストール不要**（下の `setup.ps1` が winget で自動導入。管理者権限不要）

### 手順（Windows / PowerShell — 推奨）
新しい PC では clone 後にセットアップスクリプトを1回実行するだけで、Node.js（未導入なら winget の user スコープで自動インストール）・依存パッケージ・`.env.local` 雛形・gitleaks までまとめて用意します。**管理者権限は不要**です。

```powershell
# 1. クローン
git clone <your-repo-url>
cd lingua-coach

# 2. セットアップ（Node.js 自動導入 + npm install + .env.local 雛形 + gitleaks）
./scripts/setup.ps1
#  ↑ 実行ポリシーで止まる場合:
#    powershell -ExecutionPolicy Bypass -File ./scripts/setup.ps1

# 3. .env.local に Supabase キーを貼り付け
#    Supabase Dashboard → Settings → API の anon / service_role を設定

# 4. 開発サーバー起動（setup を実行した同じシェルならそのまま動く）
npm run dev
# http://localhost:3000 でアクセス
```

> **winget で Node を入れた直後の注意**: 別の新規ターミナルで `npm` が「認識されません」となる場合、PATH 反映待ちです。**VS Code を完全に再起動**するか、`setup.ps1` を実行した同じシェルで続けてください（スクリプトは現在のシェルに PATH を反映します）。

### 手順（手動 / macOS・Linux など）
```bash
# 1. Node.js 20.x 以上を各自インストール（nvm / fnm / 公式インストーラ等）
# 2. 依存パッケージ
npm install
# 3. 環境変数
cp .env.example .env.local   # 各種キーを設定
# 4. 開発サーバー
npm run dev
```

### .env.local に設定する項目
```
# Claude API（サーバーサイドのみ・絶対に NEXT_PUBLIC_ を付けない）
ANTHROPIC_API_KEY=sk-ant-xxx

# Supabase（NEXT_PUBLIC_ANON_KEY はクライアント露出OK）
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx  # サーバーサイドのみ

# レート制限用（任意）
UPSTASH_REDIS_REST_URL=xxx
UPSTASH_REDIS_REST_TOKEN=xxx
```

---

## 💰 想定コスト

| 項目 | 月額 |
|---|---|
| Claude API（1日30分学習想定） | $3〜10 |
| Vercel ホスティング | $0（無料枠） |
| Supabase | $0（無料枠 500MB DB） |
| ドメイン | $0（Vercelサブドメイン） |
| 音声出力（Web Speech API） | $0 |
| **合計** | **月$3〜10程度** |

---

## 📅 開発ロードマップ

詳細は [docs/ROADMAP.md](docs/ROADMAP.md) を参照。

| フェーズ | 内容 | 期間目安 |
|---|---|---|
| **Phase 0** | 環境構築・基本セットアップ | 1週間 |
| **Phase 1** | 認証・DB設計・基本UI | 1〜2週間 |
| **Phase 2** | レベル判定テスト実装 | 1週間 |
| **Phase 3** | 学習モード（タイピング添削）実装 | 2週間 |
| **Phase 4** | 進捗ダッシュボード・履歴管理 | 1〜2週間 |
| **Phase 5** | ゲーミフィケーション要素 | 1週間 |
| **Phase 6** | セキュリティ強化・テスト・デプロイ | 1週間 |

---

## 📚 関連ドキュメント

- [アーキテクチャ設計](docs/ARCHITECTURE.md)
- [データベース設計](docs/DATABASE.md)
- [セキュリティ詳細](docs/SECURITY.md)
- [開発ロードマップ](docs/ROADMAP.md)

---

## 📝 ライセンス

個人利用 / 非公開
