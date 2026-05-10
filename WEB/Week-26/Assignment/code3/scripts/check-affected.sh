#!/usr/bin/env bash
# check-affected.sh
# Outputs the list of packages affected by changes since origin/main.
# Usage: bash scripts/check-affected.sh

set -euo pipefail

echo "=== Checking affected packages vs origin/main ==="

# Use turbo dry-run to get a JSON list of tasks that would run
# --filter=[origin/main] means: only packages with changes since main
OUTPUT=$(pnpm turbo build --filter='[origin/main]' --dry-run=json 2>/dev/null)

# Extract unique package names from the tasks list
PACKAGES=$(echo "$OUTPUT" | node -e "
  const data = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8'));
  const tasks = data.tasks ?? [];
  const names = [...new Set(tasks.map(t => t.package))].filter(Boolean);
  names.forEach(n => console.log(n));
")

if [ -z "$PACKAGES" ]; then
  echo "✅ No packages affected — nothing to rebuild."
else
  echo "📦 Affected packages:"
  echo "$PACKAGES" | while IFS= read -r pkg; do
    echo "  - $pkg"
  done
fi

echo ""
echo "Run 'pnpm turbo build --filter=[origin/main]' to rebuild affected packages only."