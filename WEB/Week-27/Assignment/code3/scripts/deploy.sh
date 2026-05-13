#!/usr/bin/env bash
# deploy.sh — Zero-downtime deployment script
# Usage: bash scripts/deploy.sh <image-tag>
# Example: bash scripts/deploy.sh ghcr.io/yourname/myapp:abc1234

set -euo pipefail

IMAGE=${1:-""}
if [ -z "$IMAGE" ]; then
  echo "❌ Usage: $0 <image-tag>"
  exit 1
fi

echo "🚀 Deploying $IMAGE"

# 1. Pull the new image
echo "📦 Pulling image..."
docker pull "$IMAGE"

# 2. Run database migrations BEFORE swapping the app container
# This ensures the schema is updated before new code starts serving requests
echo "🗄️  Running database migrations..."
docker run --rm \
  --network "$(docker compose ps -q db | head -1 | xargs docker inspect --format '{{range .NetworkSettings.Networks}}{{.NetworkID}}{{end}}')" \
  -e DATABASE_URL="$DATABASE_URL" \
  "$IMAGE" \
  npx prisma migrate deploy

echo "✅ Migrations complete"

# 3. Update the app service to use the new image (no downtime — compose recreates gracefully)
echo "🔄 Updating app container..."
IMAGE="$IMAGE" docker compose up -d --no-deps app

# 4. Health check loop — wait until the new container is healthy
echo "⏳ Waiting for health check..."
RETRIES=12
for i in $(seq 1 $RETRIES); do
  if curl -sf http://localhost:3000/api/health | grep -q '"status":"ok"'; then
    echo "✅ App is healthy! Deployment complete."
    exit 0
  fi
  echo "   Attempt $i/$RETRIES — waiting 5s..."
  sleep 5
done

# 5. Health check failed — roll back
echo "❌ Health check failed after ${RETRIES} attempts. Rolling back..."
docker compose up -d --no-deps app  # compose will use the previous image if available
echo "⚠️  Rollback attempted. Check logs: docker compose logs app"
exit 1