# Requires: gh CLI authenticated and in the correct repo directory

# Get all releases
$releases = gh release list --limit 1000 --json tagName,createdAt | ConvertFrom-Json

# Filter out releases with invalid or missing createdAt, and ensure it's a string
$releases = $releases | Where-Object { $_.createdAt -and ($_.createdAt -is [string]) }

# Now sort by creation date (oldest first)
$releases = $releases | Sort-Object { [datetime]$_.createdAt }

# Find the first release for each major version
$firstMajors = @{}
foreach ($release in $releases) {
    if ($release.tagName -match '^v?(\d+)\.') {
        $major = $matches[1]
        if (-not $firstMajors.ContainsKey($major)) {
            $firstMajors[$major] = $release
        }
    }
}
$firstMajorReleases = $firstMajors.Values

# Get the last 5 releases (newest)
$last5 = $releases | Select-Object -Last 5

# Combine tags to keep
$keepTags = @($firstMajorReleases | ForEach-Object { $_.tagName }) + ($last5 | ForEach-Object { $_.tagName }) | Select-Object -Unique

# Find releases to delete
$toDelete = $releases | Where-Object { $keepTags -notcontains $_.tagName }

if ($toDelete.Count -eq 0) {
    Write-Host "No releases to delete."
    exit
}

Write-Host "The following releases will be deleted:"
$toDelete | ForEach-Object { Write-Host $_.tagName }

$confirmation = Read-Host "Do you want to proceed with deleting these releases? (y/n)"
if ($confirmation -eq 'y') {
    foreach ($release in $toDelete) {
        Write-Host "Deleting $($release.tagName)..."
        gh release delete $release.tagName --yes
    }
    Write-Host "Deletion complete."
} else {
    Write-Host "Aborted. No releases were deleted."
}