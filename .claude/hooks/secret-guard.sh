#!/usr/bin/env bash
# secret-guard — PreToolUse(Bash) hook. Blocks a `git commit` when staged files match
# secret/credential/private-doc patterns. Exit 2 = block + feed reason back to the agent.
#
# Reads the tool-call JSON from stdin; only acts on commands that contain "git commit".
set -euo pipefail

input="$(cat)"
cmd="$(printf '%s' "$input" | sed -n 's/.*"command"[[:space:]]*:[[:space:]]*"\(.*\)".*/\1/p')"

# Only guard commits.
case "$cmd" in
  *"git commit"*) : ;;
  *) exit 0 ;;
esac

# Names that must never be committed (public-repo rule, PLAYBOOK §5).
staged="$(git diff --cached --name-only 2>/dev/null || true)"
bad_names="$(printf '%s\n' "$staged" \
  | grep -iE '(^|/)\.env$|(^|/)\.env\.[^/]*$|(^|/)CLAUDE\.md$|(^|/)IMPLEMENTATION_PLAN\.md$|service-account|google-services\.json|GoogleService-Info\.plist|firebase.*\.json' \
  | grep -ivE '\.env\.example$' || true)"

# Obvious secret VALUES in the staged diff (defense in depth).
bad_values="$(git diff --cached -U0 2>/dev/null \
  | grep -E '^\+' \
  | grep -iE 'AIza[0-9A-Za-z_-]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|"private_key"[[:space:]]*:' || true)"

if [ -n "$bad_names" ] || [ -n "$bad_values" ]; then
  {
    echo "secret-guard BLOCKED this commit."
    [ -n "$bad_names" ]  && { echo "Forbidden files staged:"; printf '%s\n' "$bad_names"; }
    [ -n "$bad_values" ] && echo "Secret-looking values found in the staged diff."
    echo "Unstage them (git restore --staged <file>) or add to .gitignore. Real secrets live in .env / CLAUDE.md (gitignored), never tracked."
  } 1>&2
  exit 2
fi
exit 0
