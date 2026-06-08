#!/usr/bin/env bash
# SessionStart hook (POSIX: macOS/Linux, or Windows + Git Bash). Stdout is injected into the Claude
# Code session, surfacing repo state every session. Inform, never block; exit 0.
# To use this instead of the PowerShell version, set the SessionStart command in
# .claude/settings.json to: "${CLAUDE_PROJECT_DIR}/.claude/hooks/session-start.sh" (drop the shell key).
set -u
echo "==================== SESSION START ===================="

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
  if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
    echo "  !!  UNCOMMITTED CHANGES — commit/stash before starting new work:"
    git status --porcelain 2>/dev/null | head -n 15 | sed 's/^/      /'
  else
    echo "Working tree: clean"
  fi
  git fetch --quiet 2>/dev/null || true
  counts="$(git rev-list --left-right --count 'HEAD...@{u}' 2>/dev/null || true)"
  if [ -n "$counts" ]; then
    behind="$(echo "$counts" | awk '{print $2}')"
    [ "${behind:-0}" -gt 0 ] 2>/dev/null && echo "  >> ${behind} commit(s) behind origin — pull before changes."
  fi
fi

if [ -f docs/roadmap.md ]; then
  next="$(grep -m1 -E '^\s*-\s*\[ \]' docs/roadmap.md 2>/dev/null || true)"
  [ -n "$next" ] && echo "Next roadmap step:${next}"
fi

echo "Reminder: typecheck + test before committing; plan-first for non-trivial changes; ask before pushing."
echo "======================================================="
exit 0
