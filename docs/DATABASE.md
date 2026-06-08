# データベース設計書

Supabase (PostgreSQL) を使用。すべてのテーブルで **Row Level Security (RLS) を有効化** し、ユーザーは自身のデータのみアクセス可能とする。

## テーブル一覧

### 1. `profiles` - ユーザープロファイル
| カラム | 型 | 説明 |
|---|---|---|
| `id` | uuid (PK) | Supabase Auth の user.id と一致 |
| `email` | text | メールアドレス |
| `display_name` | text | 表示名 |
| `cefr_level` | text | CEFR レベル (A1/A2/B1/B2/C1/C2) |
| `streak_days` | int | 連続学習日数 |
| `last_active_at` | timestamptz | 最終アクティブ日時 |
| `created_at` | timestamptz | 作成日時 |
| `updated_at` | timestamptz | 更新日時 |

### 2. `level_tests` - レベル判定テスト履歴
| カラム | 型 | 説明 |
|---|---|---|
| `id` | uuid (PK) | |
| `user_id` | uuid (FK → profiles.id) | |
| `total_questions` | int | 出題数 |
| `correct_answers` | int | 正解数 |
| `estimated_level` | text | 推定CEFRレベル |
| `details` | jsonb | 問題別正誤・カテゴリ別正答率 |
| `taken_at` | timestamptz | |

### 3. `learning_sessions` - 学習セッション
| カラム | 型 | 説明 |
|---|---|---|
| `id` | uuid (PK) | |
| `user_id` | uuid (FK) | |
| `mode` | text | typing / quiz / roleplay / review |
| `scene` | text | シーン名（roleplayの場合） |
| `started_at` | timestamptz | |
| `ended_at` | timestamptz | |
| `total_messages` | int | 総やりとり数 |

### 4. `messages` - 会話メッセージ
| カラム | 型 | 説明 |
|---|---|---|
| `id` | uuid (PK) | |
| `session_id` | uuid (FK → learning_sessions.id) | |
| `user_id` | uuid (FK) | |
| `role` | text | user / assistant |
| `content` | text | メッセージ本文 |
| `feedback` | jsonb | 添削結果（user発話の場合） |
| `created_at` | timestamptz | |

### 5. `mistakes` - 間違い記録（傾向分析用）
| カラム | 型 | 説明 |
|---|---|---|
| `id` | uuid (PK) | |
| `user_id` | uuid (FK) | |
| `message_id` | uuid (FK → messages.id) | |
| `category` | text | 文法カテゴリ（時制/前置詞/冠詞/語順 等） |
| `original` | text | 元の表現 |
| `corrected` | text | 修正後 |
| `explanation` | text | 解説 |
| `reviewed` | boolean | 復習済みフラグ |
| `created_at` | timestamptz | |

### 6. `badges` - 獲得バッジ
| カラム | 型 | 説明 |
|---|---|---|
| `id` | uuid (PK) | |
| `user_id` | uuid (FK) | |
| `badge_key` | text | バッジ識別子 (streak_7 / first_interview 等) |
| `earned_at` | timestamptz | |

### 7. `usage_log` - API使用量記録（コスト管理・濫用検知）
| カラム | 型 | 説明 |
|---|---|---|
| `id` | uuid (PK) | |
| `user_id` | uuid (FK) | |
| `endpoint` | text | 呼び出されたAPIエンドポイント |
| `input_tokens` | int | Claude API 入力トークン数 |
| `output_tokens` | int | 出力トークン数 |
| `model` | text | 使用モデル |
| `created_at` | timestamptz | |

### 8. `daily_stats` - 日別集計（パフォーマンス向上のための事前集計）
| カラム | 型 | 説明 |
|---|---|---|
| `user_id` | uuid (FK) | |
| `date` | date | |
| `sessions_count` | int | |
| `messages_count` | int | |
| `mistakes_count` | int | |
| `study_minutes` | int | |

PRIMARY KEY: (`user_id`, `date`)

## RLS ポリシー例

すべてのテーブルに以下のようなポリシーを設定：

```sql
-- profiles テーブルの例
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- messages テーブル例
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## インデックス設計

- `messages(user_id, created_at DESC)` - 履歴表示の高速化
- `mistakes(user_id, category, reviewed)` - 傾向分析・復習生成の高速化
- `usage_log(user_id, created_at DESC)` - 使用量集計の高速化
- `daily_stats(user_id, date DESC)` - ダッシュボード表示の高速化
