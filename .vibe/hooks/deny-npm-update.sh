#!/bin/sh
# pre_tool hook for Vibe: receives the tool-call JSON on stdin and denies
# `npm update` / `npm upgrade` (see AGENTS.md, "Updating Dependencies").
# Exit 0 with a JSON object on stdout to signal; anything else fails open.

input=$(cat)
command=$(printf '%s' "$input" | grep -o '"command": *"[^"]*"' | head -n 1 | sed 's/^"command": *"//; s/"$//')

case "$command" in
  *"npm update"*|*"npm upgrade"*)
    printf '%s' '{"decision":"deny","reason":"npm update/upgrade is not allowed in this repo. Bump the version in package.json manually, then run npm install (see AGENTS.md, Updating Dependencies)."}'
    ;;
esac

exit 0
