<#
  SessionStart hook (Windows / PowerShell). Whatever this prints to stdout is injected into the
  Claude Code session, so it reliably surfaces repo state every session. Inform, never block; exit 0.
  POSIX contributors: use session-start.sh and switch the command in .claude/settings.json.
#>
$ErrorActionPreference = "Continue"
Write-Output "==================== SESSION START ===================="

try {
  if ((& git rev-parse --is-inside-work-tree 2>$null) -eq "true") {
    Write-Output "Branch: $(& git rev-parse --abbrev-ref HEAD 2>$null)"
    $dirty = (& git status --porcelain 2>$null)
    if ($dirty) {
      Write-Output "  !!  UNCOMMITTED CHANGES — commit/stash before starting new work:"
      $dirty -split "`n" | Select-Object -First 15 | ForEach-Object { Write-Output "      $_" }
    } else {
      Write-Output "Working tree: clean"
    }
    & git fetch --quiet 2>$null
    $counts = (& git rev-list --left-right --count "HEAD...@{u}" 2>$null)
    if ($counts) {
      $behind = ($counts -split "\s+")[1]
      if ([int]$behind -gt 0) { Write-Output "  >> $behind commit(s) behind origin — pull before changes." }
    }
  }
} catch { Write-Output "Git check skipped: $($_.Exception.Message)" }

# Next roadmap step (first unchecked item in docs/roadmap.md)
if (Test-Path "docs/roadmap.md") {
  $next = Get-Content "docs/roadmap.md" | Where-Object { $_ -match "^\s*-\s*\[ \]" } | Select-Object -First 1
  if ($next) { Write-Output "Next roadmap step:$next" }
}

Write-Output "Reminder: typecheck + test before committing; plan-first for non-trivial changes; ask before pushing."
Write-Output "======================================================="
exit 0
