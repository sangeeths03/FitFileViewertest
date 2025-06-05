param(
    [int]$keepLast,
    [switch]$deleteTags
)

# Requires: gh CLI authenticated and in the correct repo directory

# Configurable parameters
$KeepLastReleases = 5  # Default number of most recent releases to keep

if ($keepLast) {
    $KeepLastReleases = $keepLast
}

# Get all releases
$json = gh release list --limit 1000 --json tagName,publishedAt
Write-Host "RAW JSON OUTPUT:"
Write-Host $json
$releases = $json | ConvertFrom-Json
Write-Host "RELEASE COUNT: $($releases.Count)"

# Remove empty array case
if (-not $releases -or $releases.Count -eq 0) {
    Write-Host "No releases found after JSON parse."
    exit
}

# Filter out releases with invalid or missing publishedAt
$releases = $releases | Where-Object { $_.publishedAt }
Write-Host "RELEASE COUNT after filter: $($releases.Count)"

# Now sort by publish date (oldest first)
$releases = $releases | Sort-Object { [datetime]$_.publishedAt }
Write-Host "RELEASES after sort: $($releases | ForEach-Object { $_.tagName + ' ' + $_.publishedAt } | Out-String)"

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

# Get the last X releases (newest)
$lastX = $releases | Select-Object -Last $KeepLastReleases

# Combine tags to keep
$keepTags = @($firstMajorReleases | ForEach-Object { $_.tagName }) + ($lastX | ForEach-Object { $_.tagName }) | Select-Object -Unique

# Find releases to delete
$toDelete = $releases | Where-Object { $keepTags -notcontains $_.tagName }

Write-Host "DEBUG: Total releases: $($releases.Count)"
Write-Host "DEBUG: Keep tags: $($keepTags -join ', ')"
Write-Host ("DEBUG: To delete: " + ((($toDelete | ForEach-Object { $_.tagName }) -join ', ')))

if ($toDelete.Count -eq 0) {
    Write-Host "No releases to delete."
    exit
}

Write-Host "The following releases will be deleted:"
$toDelete | ForEach-Object { Write-Host $_.tagName }

$confirmation = Read-Host "Do you want to proceed with deleting these releases? (y/n)"
if ($confirmation -eq 'y') {
    Write-Host "DEBUG: Git tags before deletion:"
    git tag | ForEach-Object { Write-Host $_ }
    foreach ($release in $toDelete) {
        Write-Host "Deleting $($release.tagName)..."
        gh release delete $release.tagName --yes
        if ($deleteTags) {
            Write-Host "Deleting tag $($release.tagName)..."
            git tag -d $release.tagName 2>$null
            git push origin :refs/tags/$($release.tagName)
        }
    }
    Write-Host "DEBUG: Git tags after release/tag deletion:"
    git tag | ForEach-Object { Write-Host $_ }
    # Also check for tags that exist but have no release (orphans)
    if ($deleteTags) {
        # Re-fetch releases after deletion to get the current state
        $jsonAfter = gh release list --limit 1000 --json tagName,publishedAt
        $releasesAfter = $jsonAfter | ConvertFrom-Json
        $releaseTagsAfter = $releasesAfter | ForEach-Object { $_.tagName.Trim().ToLower() }
        $releaseTagsNoV = $releaseTagsAfter | ForEach-Object { $_.TrimStart('v') }
        $allTags = git tag | Where-Object { $_ -ne '' } | ForEach-Object { $_.Trim().ToLower() }
        Write-Host "DEBUG: All tags: $($allTags -join ', ')"
        Write-Host "DEBUG: Release tags after: $($releaseTagsAfter -join ', ')"
        Write-Host "DEBUG: Release tags no v: $($releaseTagsNoV -join ', ')"
        $orphanTags = @()
        foreach ($tag in $allTags) {
            $tagNoV = $tag.TrimStart('v')
            if (($releaseTagsAfter -notcontains $tag) -and ($releaseTagsNoV -notcontains $tagNoV)) {
                $orphanTags += $tag
            }
        }
        if ($orphanTags) {
            Write-Host "Deleting orphan tags with no release:"
            $orphanTags | ForEach-Object { Write-Host $_ }
            foreach ($tag in $orphanTags) {
                git tag -d $tag 2>$null
                git push origin :refs/tags/$tag
            }
        } else {
            Write-Host "No orphan tags found."
        }
    }
    Write-Host "Deletion complete."
}
else {
    Write-Host "Aborted. No releases were deleted."
}