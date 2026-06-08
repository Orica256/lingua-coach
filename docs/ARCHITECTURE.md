# アーキテクチャ設計書

## 1. システム全体構成

```
┌─────────────────────────────────────────────────────────────┐
│                      ユーザー (ブラウザ)                       │
│  - React UI (Next.js App Router)                            │
│  - Web Speech API (音声出力)                                 │
└─────────────────────────────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  Vercel (Next.js ホスティング)                │
│  ┌────────────────────────┐  ┌──────────────────────────┐   │
│  │  Pages / Components    │  │   API Routes (Server)    │   │
│  │  - 認証画面             │  │   - /api/chat            │   │
│  │  - ダッシュボード        │  │   - /api/level-test      │   │
│  │  - 学習画面             │  │   - /api/feedback        │   │
│  └────────────────────────┘  └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                  │                              │
                  │ Supabase JS SDK              │ HTTPS
                  ▼                              ▼
┌──────────────────────────────┐   ┌──────────────────────────┐
│      Supabase                │   │   Anthropic Claude API    │
│  - PostgreSQL (RLS有効)      │   │   - claude-sonnet-4-6    │
│  - Auth (Email/Password)     │   │   - 添削・対話・問題生成    │
│  - Realtime（必要時）         │   │                          │
└──────────────────────────────┘   └──────────────────────────┘
```

## 2. レイヤー構成

### 2.1 プレゼンテーション層（Client）
- **Next.js App Router** を使用
- **Server Components** をデフォルトとし、必要箇所のみ Client Components 化
- 状態管理は **Zustand**（軽量・初心者にも理解しやすい）
- スタイリングは **Tailwind CSS + shadcn/ui**

### 2.2 API層（Server）
- **Next.js API Routes** (`src/app/api/*`)
- すべてのClaude API呼び出しはサーバーサイドで実行（APIキー秘匿）
- レート制限ミドルウェアを共通実装

### 2.3 データ層
- **Supabase PostgreSQL**
- 全テーブルで **Row Level Security (RLS)** 有効
- マイグレーションは Supabase CLI で管理

## 3. データフロー例（学習セッション）

```
1. ユーザーがシーン選択
   → Client: 選択情報をZustand storeに保存

2. 学習画面で英文回答を入力
   → Client → POST /api/feedback (英文・コンテキスト送信)

3. API Route: 
   a. Supabase Auth でユーザー検証
   b. レート制限チェック
   c. 入力バリデーション (Zod)
   d. Claude APIにプロンプト送信
   e. レスポンスを構造化（JSON）
   f. Supabaseに会話ログ・添削結果を保存
   g. 使用トークン数を usage_log に記録

4. Client にレスポンス返却
   → 添削結果を表示
   → 音声出力ボタン (Web Speech API) で例文読み上げ可能
```

## 4. 主要画面構成

```
/                       … ランディング（未ログイン時）
/login                  … ログイン
/signup                 … 新規登録
/onboarding             … 初回レベル判定テスト
/dashboard              … ダッシュボード（ストリーク・統計）
/learn                  … 学習モード選択
/learn/typing           … タイピング対話モード
/learn/quiz             … 選択式クイズ
/learn/roleplay/[scene] … シーン別ロールプレイ
/learn/review           … 復習モード
/history                … 学習履歴
/badges                 … バッジ一覧
/settings               … 設定（パスワード変更等）
```

## 5. APIエンドポイント一覧

| メソッド | パス | 用途 |
|---|---|---|
| POST | `/api/auth/signup` | 新規登録（Supabase Auth経由） |
| POST | `/api/auth/login` | ログイン |
| POST | `/api/level-test/start` | レベル判定テスト開始 |
| POST | `/api/level-test/submit` | テスト回答送信・レベル判定 |
| POST | `/api/feedback` | 英文添削（Claude API呼び出し） |
| POST | `/api/quiz/generate` | 復習クイズ自動生成 |
| GET | `/api/history` | 学習履歴取得 |
| GET | `/api/stats` | 統計データ取得 |

## 6. Claude API 利用方針

### モデル選定
- **デフォルト**: `claude-sonnet-4-6`（品質とコストのバランス）
- レベル判定や復習クイズ生成など軽い処理: `claude-haiku-4-5-20251001` でコスト削減も検討

### プロンプト戦略
- 添削はJSON形式で構造化レスポンスを要求
- 例:
  ```json
  {
    "corrected": "...",
    "errors": [{"type": "grammar", "original": "...", "fix": "...", "explanation": "..."}],
    "natural_alternatives": ["...", "..."],
    "score": 75
  }
  ```
- **Prompt Caching** を活用（システムプロンプトをキャッシュしコスト削減）

### コスト管理
- ユーザーごとに1日のトークン使用量上限を設定
- 月次でAnthropicコンソール経由のアラート設定（$20で通知）

## 7. 開発環境

- **OS**: Windows 11
- **Node.js**: 20.x LTS
- **エディタ**: VSCode + Claude Code拡張
- **パッケージマネージャ**: npm
