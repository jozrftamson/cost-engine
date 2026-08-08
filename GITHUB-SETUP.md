# GitHub Repository Setup - Schritt für Schritt

## 1. Repository auf GitHub erstellen

1. Gehe zu: **https://github.com/new**

2. Fülle das Formular aus:
   - **Repository name:** `cost-engine`
   - **Description:** `Unified AI Token & Automation Cost Engine - Track costs across AI models, automations, and infrastructure`
   - **Visibility:** ✅ **Public** (erforderlich für GitHub Marketplace)
   - **Initialize repository:** ❌ **NICHT** ankreuzen (kein README, .gitignore, oder License)

3. Klicke auf **"Create repository"**

---

## 2. Repository-URL kopieren

Nach der Erstellung zeigt GitHub dir die Repository-URL:
```
https://github.com/jozrftamson/cost-engine.git
```

---

## 3. Code zu GitHub pushen

Führe diese Befehle in deinem Terminal aus:

```bash
cd /home/josef/cost-engine

# Remote hinzufügen (falls noch nicht geschehen)
git remote add origin https://github.com/jozrftamson/cost-engine.git

# Oder falls Remote bereits existiert, URL aktualisieren:
git remote set-url origin https://github.com/jozrftamson/cost-engine.git

# Push zu GitHub
git push -u origin main
```

**Hinweis:** Du wirst nach deinen GitHub-Credentials gefragt:
- Username: `jozrftamson`
- Password: Verwende ein **Personal Access Token** (nicht dein Passwort!)

### Personal Access Token erstellen (falls benötigt)

1. Gehe zu: https://github.com/settings/tokens
2. Klicke auf **"Generate new token"** → **"Generate new token (classic)"**
3. Name: `cost-engine-deployment`
4. Scopes auswählen:
   - ✅ `repo` (Full control of private repositories)
5. Klicke auf **"Generate token"**
6. **WICHTIG:** Kopiere das Token sofort (wird nur einmal angezeigt!)
7. Verwende dieses Token als Passwort beim `git push`

---

## 4. Ersten Release erstellen

Nach erfolgreichem Push:

```bash
# Tag erstellen
git tag -a v1.0.0 -m "Release v1.0.0 - Initial MVP"

# Tag zu GitHub pushen
git push origin v1.0.0
```

**Oder über GitHub UI:**

1. Gehe zu deinem Repository auf GitHub
2. Klicke auf **"Releases"** (rechte Sidebar)
3. Klicke auf **"Create a new release"**
4. Fülle das Formular aus:
   - **Tag:** `v1.0.0`
   - **Release title:** `v1.0.0 - Initial Release`
   - **Description:**
     ```markdown
     # Unified AI Token & Automation Cost Engine - MVP
     
     ## Features
     - 🤖 Multi-Provider AI Cost Tracking (OpenAI, Anthropic, Google AI)
     - 💰 Versioned Pricing Engine
     - 📊 PostgreSQL Database with Multi-Tenant Architecture
     - 🔐 Secure API with Authentication
     - 🎯 GitHub Action for Workflow Cost Tracking
     - 📈 Cost Aggregation and Reporting
     
     ## What's Included
     - Core packages with TypeScript types and interfaces
     - Database schema with Drizzle ORM
     - Pricing engine with historical accuracy
     - Provider adapter architecture
     - Docker Compose setup for local development
     - Comprehensive documentation
     
     ## Getting Started
     See [README.md](https://github.com/jozrftamson/cost-engine#readme) for installation and usage instructions.
     
     ## Documentation
     - [Architecture Decision Record](./docs/ADR-001-architecture-overview.md)
     - [Implementation Plan](./docs/IMPLEMENTATION-PLAN.md)
     - [Deployment Guide](./DEPLOYMENT.md)
     - [Contributing Guide](./CONTRIBUTING.md)
     ```
5. Klicke auf **"Publish release"**

---

## 5. GitHub Action im Marketplace veröffentlichen

Nach dem Release wird deine GitHub Action automatisch im Marketplace erscheinen!

**Überprüfen:**
1. Gehe zu: https://github.com/marketplace?type=actions
2. Suche nach "AI Cost Tracking" oder "cost-engine"
3. Deine Action sollte dort erscheinen

**Oder direkt:**
- https://github.com/marketplace/actions/ai-cost-tracking

---

## 6. Repository-Einstellungen optimieren

### Topics hinzufügen

1. Gehe zu deinem Repository
2. Klicke auf das Zahnrad-Symbol neben "About"
3. Füge Topics hinzu:
   - `ai`
   - `cost-tracking`
   - `finops`
   - `github-actions`
   - `openai`
   - `anthropic`
   - `automation`
   - `typescript`
   - `postgresql`

### README Badge hinzufügen

Füge am Anfang der README.md hinzu:

```markdown
[![GitHub release](https://img.shields.io/github/v/release/jozrftamson/cost-engine)](https://github.com/jozrftamson/cost-engine/releases)
[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-AI%20Cost%20Tracking-blue?logo=github)](https://github.com/marketplace/actions/ai-cost-tracking)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```

---

## 7. Nächste Schritte

Nach erfolgreichem Push und Release:

1. ✅ Repository ist öffentlich verfügbar
2. ✅ GitHub Action ist im Marketplace
3. ⏳ Implementiere die API (siehe IMPLEMENTATION-PLAN.md)
4. ⏳ Baue die GitHub Action (actions/token-cost/)
5. ⏳ Erstelle weitere Releases mit neuen Features

---

## Troubleshooting

### "Repository not found" beim Push

**Lösung:** Stelle sicher, dass:
1. Das Repository auf GitHub existiert
2. Du die richtige URL verwendest
3. Du Zugriff auf das Repository hast (Owner oder Collaborator)

### Authentication failed

**Lösung:**
1. Verwende ein Personal Access Token statt Passwort
2. Token muss `repo` Scope haben
3. Überprüfe Username und Token

### Permission denied

**Lösung:**
1. Überprüfe, ob du Owner des Repositories bist
2. Stelle sicher, dass das Repository public ist
3. Verwende HTTPS statt SSH (oder umgekehrt)

---

## Fertig! 🎉

Dein Cost Engine Repository ist jetzt:
- ✅ Auf GitHub verfügbar
- ✅ Im GitHub Marketplace (nach Release)
- ✅ Bereit für Contributions
- ✅ Bereit für weitere Entwicklung

**Repository URL:** https://github.com/jozrftamson/cost-engine

---

**Fragen?**
- 📧 Email: support@cost-engine.example.com
- 💬 Discord: https://discord.gg/cost-engine
- 🐛 Issues: https://github.com/jozrftamson/cost-engine/issues
