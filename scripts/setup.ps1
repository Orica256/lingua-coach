# ============================================================
# LinguaCoach 開発環境セットアップ（管理者権限・不要）
# ------------------------------------------------------------
# 新しい PC で clone した直後に一度だけ実行する想定。
#   - Node.js LTS を winget の user スコープで自動インストール
#     （管理者権限なし。バージョン管理ツール nvm/fnm は使わず Node を直接導入）
#   - 現在のシェルに PATH を反映（VS Code 再起動なしで続行できる）
#   - npm install
#   - .env.local が無ければ .env.example から雛形を作成
#   - gitleaks が未導入なら winget の user スコープで導入（任意・失敗しても続行）
#
# 使い方（PowerShell）:
#   ./scripts/setup.ps1
#
# 実行ポリシーで止まる場合は次で一時的に許可して実行:
#   powershell -ExecutionPolicy Bypass -File ./scripts/setup.ps1
# ============================================================

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

function Write-Step($msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }

# --- Node.exe を探す（PATH → winget user スコープ → 既定の nodejs フォルダ） ---
function Find-NodeDir {
    $cmd = Get-Command node -ErrorAction SilentlyContinue
    if ($cmd) { return (Split-Path -Parent $cmd.Source) }

    $wingetPkgs = Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Packages"
    $node = Get-ChildItem -Path $wingetPkgs -Recurse -Filter node.exe -ErrorAction SilentlyContinue |
        Select-Object -First 1
    if ($node) { return $node.DirectoryName }

    foreach ($p in @("$env:ProgramFiles\nodejs", "$env:LOCALAPPDATA\Programs\nodejs")) {
        if (Test-Path (Join-Path $p "node.exe")) { return $p }
    }
    return $null
}

Write-Step "Node.js を確認"
$nodeDir = Find-NodeDir
if (-not $nodeDir) {
    Write-Host "Node.js が見つかりません。winget の user スコープでインストールします（管理者権限不要）..." -ForegroundColor Yellow
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        Write-Host "winget が見つかりません。Microsoft Store の『アプリ インストーラー』を導入してから再実行してください。" -ForegroundColor Red
        exit 1
    }
    winget install --id OpenJS.NodeJS.LTS --scope user --silent --accept-package-agreements --accept-source-agreements
    $nodeDir = Find-NodeDir
    if (-not $nodeDir) {
        Write-Host "インストール後も Node.js を検出できませんでした。手動でご確認ください。" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Node.js を検出: $nodeDir" -ForegroundColor Green
}

# --- 現在のシェルに PATH を反映（VS Code/ターミナル再起動なしで続行できる） ---
if (($env:Path -split ';') -notcontains $nodeDir) {
    $env:Path = "$nodeDir;$env:Path"
}

$nodeVersion = (& node --version)
$npmVersion  = (& npm --version)
Write-Host "node $nodeVersion / npm $npmVersion" -ForegroundColor Green

Write-Step "依存パッケージをインストール (npm install)"
npm install

Write-Step ".env.local を確認"
if (Test-Path ".env.local") {
    Write-Host ".env.local は既に存在します（上書きしません）。" -ForegroundColor Green
} else {
    Copy-Item ".env.example" ".env.local"
    Write-Host ".env.example から .env.local を作成しました。" -ForegroundColor Yellow
    Write-Host "→ Supabase の anon / service_role キーを .env.local に貼り付けてください。" -ForegroundColor Yellow
    Write-Host "   取得先: Supabase Dashboard → Settings → API" -ForegroundColor Yellow
}

Write-Step "gitleaks を確認（任意・pre-commit フックで使用）"
if (Get-Command gitleaks -ErrorAction SilentlyContinue) {
    Write-Host "gitleaks は導入済みです。" -ForegroundColor Green
} else {
    Write-Host "gitleaks が未導入です。winget の user スコープで導入を試みます（失敗しても続行）..." -ForegroundColor Yellow
    try {
        winget install --id Gitleaks.Gitleaks --scope user --silent --accept-package-agreements --accept-source-agreements
        Write-Host "gitleaks を導入しました（PATH 反映には新しいターミナルが必要な場合あり）。" -ForegroundColor Green
    } catch {
        Write-Host "gitleaks の自動導入に失敗しました。コミットは可能ですがシークレット検査はスキップされます。" -ForegroundColor Yellow
    }
}

Write-Step "完了"
Write-Host "次のステップ:" -ForegroundColor Cyan
Write-Host "  1. .env.local に Supabase キーを設定（未設定の場合）"
Write-Host "  2. このシェルでそのまま: npm run dev"
Write-Host "  3. 別の新規ターミナルからは VS Code 再起動後に node が PATH に乗ります"
Write-Host "  → http://localhost:3000"

