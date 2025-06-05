# Requires: gh CLI authenticated and in the correct repo directory

$totalSize = 0

# Get all releases (up to 1000)
$releases = gh release list --limit 1000 --json tagName | ConvertFrom-Json

$releaseCount = $releases.Count
$index = 0

# Table header with colors
Write-Host ("{0,-30} {1,15} {2,15}" -f 'Release Tag', 'Size (MB)', 'Size (GB)') -ForegroundColor Cyan
Write-Host ("{0,-30} {1,15} {2,15}" -f ('-'*20), ('-'*10), ('-'*10)) -ForegroundColor DarkCyan

foreach ($release in $releases) {
    $index++
    Write-Progress -Activity "Calculating asset sizes" -Status "Processing release $index of $releaseCount ($($release.tagName))" -PercentComplete (($index / $releaseCount) * 100)
    $assets = gh release view $release.tagName --json assets | ConvertFrom-Json
    $releaseSize = 0
    foreach ($asset in $assets.assets) {
        $releaseSize += $asset.size
        $totalSize += $asset.size
    }
    $releaseSizeMB = [math]::Round($releaseSize / 1MB, 2)
    $releaseSizeGB = [math]::Round($releaseSize / 1GB, 3)
    $rowColor = if ($index % 2 -eq 0) { 'Gray' } else { 'White' }
    Write-Host ("{0,-30} {1,15} {2,15}" -f $release.tagName, $releaseSizeMB, $releaseSizeGB) -ForegroundColor $rowColor
}

Write-Progress -Activity "Calculating asset sizes" -Completed

# Convert bytes to MB and GB for readability
$totalSizeMB = [math]::Round($totalSize / 1MB, 2)
$totalSizeGB = [math]::Round($totalSize / 1GB, 3)
Write-Host ("\nTotal asset size across all releases: $totalSize bytes ($totalSizeMB MB, $totalSizeGB GB)") -ForegroundColor Magenta