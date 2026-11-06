---
name: open-pr
description: Create a pull request from the current feature branch to dev with a conventional-commit title and a standard checklist body. Load when the user asks to open, create, raise, or finish a PR.
user-invocable: true
allowed-tools: bash
---

# Open a pull request

This project uses a two-tier branch model (see AGENTS.md): `dev` is the default
working branch, `main` is production-only. Feature branches are cut from `dev`
and pull requests target `dev`.

Steps:

1. `git branch --show-current` — if the result is `dev` or `main`, stop and tell
   the user there is nothing to open a PR from.
2. `git status --porcelain` — if there are uncommitted changes, stop and ask
   whether to commit them first (conventional commits, one concern per commit).
3. `git fetch origin`, then check the branch is pushed:
   `git rev-parse --abbrev-ref --symbolic-full-name @{upstream}` — if it fails,
   run `git push -u origin <branch>`.
4. Check for an existing PR first: `gh pr view --json url -q .url` — if one
   exists, print its URL and stop.
5. Derive the title from the branch name or recent commits, following
   conventional commits: `<type>(<scope>): <description>`, lowercase, imperative,
   max 72 characters.
6. Create the PR targeting `dev`:

   ```bash
   gh pr create --base dev --title "<title>" --body "$(cat <<'EOF'
   ## What does this PR do?

   ## Why is this change needed?

   ## Testing

   - [ ] `npm run lint`
   - [ ] `npx tsc --noEmit`
   - [ ] `npm test -- --ci`
   - [ ] `npm run build`
   EOF
   )"
   ```

7. Print the new PR URL.
