#!/usr/bin/env bash
# analyze-bundle.sh — Build with bundle analyser and open the report
# Usage: bash scripts/analyze-bundle.sh

set -euo pipefail

# Install @next/bundle-analyzer if not present
if ! npm list @next/bundle-analyzer --depth=0 2>/dev/null | grep -q bundle-analyzer; then
  echo "📦 Installing @next/bundle-analyzer..."
  npm install --save-dev @next/bundle-analyzer
fi

echo "🔍 Building with bundle analyser..."
ANALYZE=true npm run build

echo ""
echo "✅ Bundle analysis complete."
echo "   Reports are in: .next/analyze/"
echo ""

# Open the client-side bundle report
if command -v open &>/dev/null; then
  open .next/analyze/client.html
elif command -v xdg-open &>/dev/null; then
  xdg-open .next/analyze/client.html
else
  echo "   Open manually: .next/analyze/client.html"
fi