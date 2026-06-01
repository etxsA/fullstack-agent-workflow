#!/usr/bin/env bash
# init-workspace bootstrap — create per-repo folders seeded with the workflow's .claude/.
# Usage: bootstrap.sh <WORKSPACE_DIR> <WORKFLOW_REPO_DIR> <repo1> [repo2 ...]
# Idempotent: re-running skips existing git repos and refreshes .claude/.
set -euo pipefail

WS="${1:?workspace dir required}"
WF="${2:?workflow repo dir required}"
shift 2
[ "$#" -ge 1 ] || { echo "need at least one repo name" >&2; exit 1; }
[ -d "$WF/.claude/skills" ] || { echo "workflow repo not found at $WF (no .claude/skills)" >&2; exit 1; }

mkdir -p "$WS"
for repo in "$@"; do
  dir="$WS/$repo"
  mkdir -p "$dir"
  # seed the slash-commands + secret-guard hook (refresh on re-run)
  rm -rf "$dir/.claude"
  cp -R "$WF/.claude" "$dir/.claude"
  # git + gitflow (don't clobber an existing repo)
  if ! git -C "$dir" rev-parse --git-dir >/dev/null 2>&1; then
    git -C "$dir" init -q
    git -C "$dir" checkout -q -b develop 2>/dev/null || true
  fi
  echo "seeded: $dir"
done
echo "workflow library: $WF"
