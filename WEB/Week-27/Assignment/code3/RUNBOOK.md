# Operational Runbook

Quick reference for common production operations.

## Deploy a New Version

```bash
# Automated (via GitHub Actions on merge to main — recommended)
git push origin main   # CI/CD pipeline handles the rest

# Manual deploy
bash scripts/deploy.sh ghcr.io/yourname/myapp:sha-<commit-sha>
```

## Roll Back to a Previous Version

```bash
# Find the previous image tag in GitHub Packages
# Then redeploy that specific tag
bash scripts/deploy.sh ghcr.io/yourname/myapp:sha-<previous-commit-sha>

# Or roll back using docker compose:
docker compose up -d --no-deps app --image ghcr.io/yourname/myapp:sha-<previous-sha>
```

## View Application Logs

```bash
# Live logs
docker compose logs -f app

# Last 500 lines
docker compose logs --tail=500 app

# Filter for errors only
docker compose logs app 2>&1 | grep '"level":"error"'

# Parse JSON logs with jq (install: apt install jq)
docker compose logs app 2>&1 | grep '^{' | jq .
```

## Database Operations

```bash
# Run pending migrations
docker compose exec app npx prisma migrate deploy

# Open Prisma Studio (visual DB browser)
npx prisma studio

# Manual backup (run on the server)
docker compose exec db pg_dump -U postgres blogdb > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore a backup
docker compose exec -T db psql -U postgres blogdb < backup_20250615_120000.sql
```

## Redis Operations

```bash
# Redis CLI
docker compose exec redis redis-cli

# Check memory usage
docker compose exec redis redis-cli INFO memory | grep used_memory_human

# View all session keys
docker compose exec redis redis-cli KEYS "session:*"

# Flush all sessions (forces all users to log in again)
docker compose exec redis redis-cli DEL $(docker compose exec redis redis-cli KEYS "session:*")
```

## Incident Response

### App is down (502 Bad Gateway)

```bash
# Check app container status
docker compose ps

# Check app logs for errors
docker compose logs --tail=50 app

# Restart the app (graceful)
docker compose restart app

# Redeploy last known good image
bash scripts/deploy.sh <last-good-tag>
```

### High memory / CPU

```bash
# Check resource usage
docker stats

# Restart with increased memory limit
docker compose up -d --force-recreate app
```

### Database unreachable

```bash
# Check Postgres status
docker compose ps db
docker compose logs db

# Restart Postgres (causes brief downtime)
docker compose restart db

# Health check
curl http://localhost:3000/api/health
```

## Health Check

```bash
# Quick check
curl http://localhost:3000/api/health

# Detailed check with formatting
curl -s http://localhost:3000/api/health | jq .
```

## Analyse Bundle Size

```bash
bash scripts/analyze-bundle.sh
# Opens .next/analyze/client.html in your browser
# Look for unexpectedly large modules — common culprits:
#   - moment.js (use date-fns instead)
#   - lodash (import specific functions, not the whole library)
#   - large icon libraries (import only the icons you use)
```
