# Deployment Guide - Cost Engine

## Quick Start - GitHub Repository Setup

### 1. Create GitHub Repository

Go to https://github.com/new and create a new repository:
- Repository name: `cost-engine`
- Description: `Unified AI Token & Automation Cost Engine - Track costs across AI models, automations, and infrastructure`
- Visibility: Public (for GitHub Marketplace)
- Do NOT initialize with README (we already have one)

### 2. Push to GitHub

```bash
cd /home/josef/cost-engine

# Set your GitHub credentials (if not already set)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Add all files and commit
git add .
git commit -m "feat: Initial release - Unified AI Token & Automation Cost Engine MVP"

# Add remote (replace with your actual repository URL)
git remote add origin https://github.com/jozrftamson/cost-engine.git

# Push to GitHub
git push -u origin main
```

### 3. Create Release for GitHub Action

After pushing, create a release:

```bash
# Tag the release
git tag -a v1.0.0 -m "Release v1.0.0 - MVP"
git push origin v1.0.0
```

Or create via GitHub UI:
1. Go to your repository on GitHub
2. Click "Releases" → "Create a new release"
3. Tag: `v1.0.0`
4. Title: `v1.0.0 - Initial Release`
5. Description: Copy from README.md features section
6. Click "Publish release"

---

## GitHub Actions Marketplace

### Publishing the Action

1. **Ensure action.yml is correct**:
   - Located at: `actions/token-cost/action.yml`
   - Has proper branding (icon, color)
   - All inputs/outputs documented

2. **Build the Action** (when implemented):
   ```bash
   cd actions/token-cost
   npm install
   npm run build
   git add dist/
   git commit -m "build: compile action for release"
   git push
   ```

3. **Create Release with Action**:
   - Tag must start with `v` (e.g., `v1.0.0`)
   - GitHub automatically detects `action.yml`
   - Action appears in Marketplace after release

4. **Marketplace Listing**:
   - Go to repository → "Releases"
   - Your action will appear in GitHub Actions Marketplace
   - Users can find it by searching "AI Cost Tracking"

### Action Usage

Users can then use your action:

```yaml
- uses: jozrftamson/cost-engine-action@v1
  with:
    api-url: ${{ secrets.COST_ENGINE_URL }}
    api-key: ${{ secrets.COST_ENGINE_API_KEY }}
    project-id: ${{ vars.PROJECT_ID }}
```

---

## Docker Deployment

### Local Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Production Deployment

1. **Build Production Images**:
   ```bash
   docker build -f infrastructure/docker/Dockerfile.api -t cost-engine-api:latest .
   docker build -f infrastructure/docker/Dockerfile.worker -t cost-engine-worker:latest .
   ```

2. **Push to Registry**:
   ```bash
   docker tag cost-engine-api:latest your-registry/cost-engine-api:latest
   docker push your-registry/cost-engine-api:latest
   ```

3. **Deploy**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

---

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (1.24+)
- kubectl configured
- Helm 3+ (optional)

### Deploy with kubectl

```bash
# Create namespace
kubectl create namespace cost-engine

# Apply manifests
kubectl apply -f infrastructure/kubernetes/ -n cost-engine

# Check status
kubectl get pods -n cost-engine
```

### Deploy with Helm (when chart is created)

```bash
helm install cost-engine ./infrastructure/helm/cost-engine \
  --namespace cost-engine \
  --create-namespace \
  --set postgresql.enabled=true \
  --set api.replicas=3
```

---

## Environment Variables

### Required

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/cost_engine
JWT_SECRET=your-super-secret-jwt-key-change-this
```

### Optional

```bash
REDIS_URL=redis://localhost:6379
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
```

See `.env.example` for full list.

---

## Database Setup

### Migrations

```bash
# Run migrations
npm run db:migrate

# Rollback last migration
npm run db:migrate:rollback

# Reset database (CAUTION: deletes all data)
npm run db:reset
```

### Seed Data

```bash
# Seed with sample data
npm run db:seed

# Seed with production data
npm run db:seed:production
```

---

## Monitoring

### Health Checks

```bash
# API health
curl http://localhost:3000/health

# Database health
curl http://localhost:3000/health/db
```

### Metrics

Prometheus metrics available at:
```
http://localhost:3000/metrics
```

---

## Backup & Restore

### PostgreSQL Backup

```bash
# Backup
pg_dump -h localhost -U cost_engine cost_engine > backup.sql

# Restore
psql -h localhost -U cost_engine cost_engine < backup.sql
```

### Automated Backups

Set up automated backups with cron:

```bash
0 2 * * * pg_dump -h localhost -U cost_engine cost_engine | gzip > /backups/cost_engine_$(date +\%Y\%m\%d).sql.gz
```

---

## Scaling

### Horizontal Scaling

```bash
# Scale API pods
kubectl scale deployment cost-engine-api --replicas=5 -n cost-engine

# Scale worker pods
kubectl scale deployment cost-engine-worker --replicas=3 -n cost-engine
```

### Database Scaling

- Use PostgreSQL read replicas for queries
- Use connection pooling (PgBouncer)
- Consider partitioning large tables

---

## Security

### SSL/TLS

Use a reverse proxy (nginx, Traefik) with Let's Encrypt:

```nginx
server {
    listen 443 ssl http2;
    server_name api.cost-engine.example.com;
    
    ssl_certificate /etc/letsencrypt/live/api.cost-engine.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.cost-engine.example.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Secrets Management

Use Kubernetes Secrets or external secret managers:

```bash
# Create secret
kubectl create secret generic cost-engine-secrets \
  --from-literal=database-url='postgresql://...' \
  --from-literal=jwt-secret='...' \
  -n cost-engine
```

---

## Troubleshooting

### API not starting

1. Check logs: `docker-compose logs api`
2. Verify DATABASE_URL is correct
3. Ensure PostgreSQL is running
4. Check port 3000 is not in use

### Database connection errors

1. Verify PostgreSQL is running: `docker-compose ps postgres`
2. Check credentials in .env
3. Test connection: `psql $DATABASE_URL`

### High memory usage

1. Check connection pool settings
2. Review query performance
3. Add indexes to frequently queried columns
4. Consider caching with Redis

---

## Support

- 📧 Email: support@cost-engine.example.com
- 💬 Discord: https://discord.gg/cost-engine
- 🐛 Issues: https://github.com/jozrftamson/cost-engine/issues
- 📖 Docs: https://github.com/jozrftamson/cost-engine/tree/main/docs

---

## Next Steps

1. ✅ Push to GitHub
2. ✅ Create first release (v1.0.0)
3. ⏳ Implement API endpoints
4. ⏳ Build GitHub Action
5. ⏳ Deploy to production
6. ⏳ Publish to GitHub Marketplace

---

**Last Updated:** 2026-08-08
