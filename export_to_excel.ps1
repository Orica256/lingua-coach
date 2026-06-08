# LinguaCoach ドキュメント Excel 出力スクリプト
# 全マークダウンドキュメントを1ファイルにシート分けして出力

$ErrorActionPreference = 'Stop'
$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$outputPath = Join-Path $baseDir 'LinguaCoach_Docs.xlsx'

# 既存ファイル削除
if (Test-Path $outputPath) { Remove-Item $outputPath -Force }

# 対象ドキュメントとシート名のマッピング
$docs = @(
    @{ File = 'README.md';            Sheet = 'README' },
    @{ File = 'docs\ARCHITECTURE.md'; Sheet = 'Architecture' },
    @{ File = 'docs\DATABASE.md';     Sheet = 'Database' },
    @{ File = 'docs\SECURITY.md';     Sheet = 'Security' },
    @{ File = 'docs\ROADMAP.md';      Sheet = 'Roadmap' }
)

Write-Output "Excel起動中..."
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

try {
    $workbook = $excel.Workbooks.Add()

    # デフォルトシート以外削除のため、最初のシートを最後に削除する
    while ($workbook.Sheets.Count -gt 1) {
        $workbook.Sheets.Item($workbook.Sheets.Count).Delete()
    }
    $defaultSheet = $workbook.Sheets.Item(1)

    $first = $true
    foreach ($doc in $docs) {
        $filePath = Join-Path $baseDir $doc.File
        if (-not (Test-Path $filePath)) {
            Write-Warning "File not found: $filePath"
            continue
        }

        Write-Output "処理中: $($doc.File) → シート [$($doc.Sheet)]"

        if ($first) {
            $sheet = $defaultSheet
            $sheet.Name = $doc.Sheet
            $first = $false
        } else {
            $sheet = $workbook.Sheets.Add([System.Reflection.Missing]::Value, $workbook.Sheets.Item($workbook.Sheets.Count))
            $sheet.Name = $doc.Sheet
        }

        # ヘッダー行
        $sheet.Cells.Item(1, 1) = "Line"
        $sheet.Cells.Item(1, 2) = $doc.File
        $headerRange = $sheet.Range("A1:B1")
        $headerRange.Font.Bold = $true
        $headerRange.Interior.Color = 4210752  # ダークグレー
        $headerRange.Font.Color = 16777215     # 白

        # ファイル内容を行単位で書き込み
        $lines = Get-Content -Path $filePath -Encoding UTF8
        $row = 2
        foreach ($line in $lines) {
            $sheet.Cells.Item($row, 1) = $row - 1
            # 先頭シングルクォートで数式扱いを回避
            $sheet.Cells.Item($row, 2) = "'" + $line
            $row++
        }

        # 列幅調整
        $sheet.Columns.Item(1).ColumnWidth = 6
        $sheet.Columns.Item(2).ColumnWidth = 120
        $sheet.Columns.Item(2).WrapText = $false

        # 行高さ自動
        $sheet.Rows.AutoFit() | Out-Null

        # 1行目固定
        $sheet.Application.ActiveWindow.SplitRow = 1
        $sheet.Application.ActiveWindow.FreezePanes = $true
    }

    # 最初のシートをアクティブに
    $workbook.Sheets.Item(1).Activate()

    # 保存 (xlsx形式 = 51)
    $workbook.SaveAs($outputPath, 51)
    $workbook.Close($false)
    Write-Output ""
    Write-Output "✓ 出力完了: $outputPath"
}
finally {
    $excel.Quit() | Out-Null
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
}
