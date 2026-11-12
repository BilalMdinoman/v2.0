<div align="center">

```
██╗   ██╗    ██████╗      ██████╗
██║   ██║   ╚════██╗    ██╔═████╗
██║   ██║    █████╔╝    ██║██╔██║
╚██╗ ██╔╝   ██╔═══╝     ████╔╝██║
 ╚████╔╝    ███████╗    ╚██████╔╝
  ╚═══╝     ╚══════╝     ╚═════╝
```

# V.2.0 — Multi-Agent Trading Intelligence

**A seven-agent autonomous AI system for trading Solana memecoins**  
**powered by real-time market data, multi-provider AI routing, and a deterministic risk engine.**

<br/>

![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js&logoColor=white)
![Python](https://img.shields.io/badge/Python_3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

<br/>

> *Seven minds. One strategy. Relentless execution.*

</div>

---

## 🧠 What is V.2.0?

V.2.0 is a **fully autonomous, 24/7 self-sustaining Multi-Agent System (MAS)** built to trade Solana memecoins with real-time market intelligence. It combines the speed of Groq, the analytical depth of Alibaba Cloud Qwen, and the mathematical reasoning of DeepSeek — routing between them dynamically depending on each task.

Seven specialized AI agents operate as a single cohesive team:

- **Market data is 100% real** — live Solana DEX ticks from DexScreener
- **Execution engine** — connects to real Solana DEX infrastructure for live trade execution
- **Currently in development** — actively being built, tested, and improved before full live deployment

The system targets sustainable, compounding growth through disciplined risk management, real-time sentiment analysis, and continuous learning from post-trade post-mortems.

---

## 👥 The Seven-Agent Roster

| Agent | Role | Model Engine | Directive |
|-------|------|-------------|-----------|
| 🔭 **ORION** | Market Scout & Anomaly Detector | Groq — `llama-3.3-70b-versatile` | Sweeps Solana DEX pools 24/7 for volume surges, price velocity spikes, and liquidity pair creations |
| 🐺 **LUPUS** | Contract Security & Safety Auditor | DeepSeek — `deepseek-chat` | Detects rug-pulls, honeypots, unlocked liquidity, and malicious developer wallet concentrations |
| 🔐 **CIPHER** | Momentum & Sentiment Analyst | Qwen — `qwen-max` via OpenRouter | Evaluates volume authenticity, buy/sell ratios, and social chatter to separate organic growth from wash trading |
| ⚖️ **ZARAH** | Risk & Capital Guardian | DeepSeek — `deepseek-reasoner` | Enforces strict position sizing (5% max), Stop-Loss (−5% to −10%), Take-Profit (+20% to +50%), and rejects any trade below 2.5:1 risk-to-reward |
| 👁️ **ELIAS** | Executive CIO & Final Decision Maker | DeepSeek — `deepseek-chat` / Claude | Reviews full team dossiers and issues the final `EXECUTE_BUY` or `ABORT` command — no override possible |
| 📚 **NOVA** | Post-Trade Historian & Memory Vault | DeepSeek / Qwen | Conducts post-mortems, writes learnings to Supabase long-term memory, and evolves the team's collective strategy |
| 🛡️ **ARGUS** | System Overseer & Health Sentinel | Groq / DeepSeek | Monitors API latency, pipeline speed, agent error rates; fires instant Telegram diagnostic alerts on any anomaly |

---

## ⚙️ The Three Infrastructure Systems

V.2.0 is built on three powerful infrastructure layers that keep everything fast, resilient, and observable:

### 🔧 System 01 — API Performance Engine
> Rate limiting, token buckets, priority queues, concurrency control, exponential backoff with jitter, and Retry-After header compliance. Every API call is metered and throttled to prevent provider blocks.

### 🧭 System 02 — Intelligent Model Router
> A model registry with dynamic capability matching, provider health checks, automatic failover, and cost control. The router directs each task to the best-fit model at that moment, with no single point of failure.

### 👀 System 03 — Watcher (Observability Layer)
> Distributed tracing, anomaly detection, and controlled self-correction. The Watcher watches the watchers — logging every agent action, flagging hallucinations, and triggering recovery workflows autonomously.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    V.2.0 SYSTEM                         │
│                                                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────┐  │
│  │  ORION   │───▶│  LUPUS   │───▶│     CIPHER       │  │
│  │ (Scout)  │    │ (Audit)  │    │  (Sentiment)     │  │
│  └──────────┘    └──────────┘    └────────┬─────────┘  │
│                                           │             │
│  ┌──────────┐    ┌──────────┐    ┌────────▼─────────┐  │
│  │   NOVA   │◀───│  ELIAS   │◀───│     ZARAH        │  │
│  │ (Memory) │    │  (CIO)   │    │  (Risk Guard)    │  │
│  └──────────┘    └──────────┘    └──────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ARGUS — System Overseer (monitors all above)   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ════════════ Infrastructure ═══════════════════════    │
│  [Sys 01: API Perf] [Sys 02: Model Router] [Sys 03: 👁] │
└─────────────────────────────────────────────────────────┘
         │                                    │
    ┌────▼──────┐                    ┌────────▼──────┐
    │ Supabase  │                    │  Next.js PWA  │
    │ PostgreSQL│                    │  Dashboard    │
    └───────────┘                    └───────────────┘
```

---

## 📁 Project Structure

```
V.2.0/
├── apps/
│   └── web/                        # Next.js 15 + TypeScript PWA Dashboard
│       ├── app/
│       │   ├── layout.tsx          # Root layout & metadata
│       │   └── (dashboard)/        # Command Center & Watcher pages
│       ├── components/
│       │   ├── HeaderStatus.tsx    # System status & portfolio balance
│       │   ├── BrainStream.tsx     # Supabase Realtime agent log feed
│       │   ├── ActivePositions.tsx # Live trade positions table
│       │   ├── TradeHistory.tsx    # Historical ledger & win/loss ratio
│       │   ├── AgentHealth.tsx     # Argus latency matrix
│       │   ├── EquityChart.tsx     # Portfolio equity curve
│       │   ├── TopBar.tsx          # Navigation & system controls
│       │   └── ...                 # 17 total components
│       └── lib/                    # Supabase client, utils
│
├── backend/                        # Python 3.11+ Autonomous Daemon
│   ├── agents/                     # 7 agent modules (Orion, Lupus, ...)
│   ├── systems/                    # System 01, 02, 03 implementations
│   ├── execution/                  # Trade execution engine
│   ├── risk/                       # Deterministic risk engine
│   ├── services/                   # DexScreener, Telegram, Supabase clients
│   ├── orchestrator.py             # Multi-agent pipeline coordinator
│   ├── daemon.py                   # 24/7 background daemon
│   └── requirements.txt
│
├── supabase/                       # PostgreSQL migrations & schema
├── docs/                           # Architecture specs & build plan
├── Systems.md                      # Full infrastructure system specs
└── master plan.md                  # Complete system architecture document
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- A [Supabase](https://supabase.com) project
- API keys: Groq, DeepSeek, Alibaba Cloud Qwen (or OpenRouter)
- Telegram Bot Token (for alerts)

### 1. Clone the Repository

```bash
git clone https://github.com/bilalmuhammadd1b1-design/v2.0.git
cd v2.0
```

### 2. Set Up the Dashboard (Next.js)

```bash
cd apps/web
npm install
cp ../../.env.example .env.local
# Fill in your Supabase credentials in .env.local
npm run dev
```

Then open **http://localhost:3000** in your browser.

### 3. Set Up the Backend Daemon (Python)

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env
# Fill in all API keys in .env
python run.py
```

### 4. Set Up Supabase

Apply all migrations in the `supabase/` directory via the Supabase CLI or dashboard.

---

## 🔐 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# AI Model Providers
GROQ_API_KEY=your_groq_key
DEEPSEEK_API_KEY=your_deepseek_key
OPENROUTER_API_KEY=your_openrouter_key

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

See [`.env.example`](.env.example) for the full list.

---

## 🛡️ Risk Management Rules (Enforced by Code)

These rules are enforced at the **code level** and cannot be overridden by any AI agent, in both paper and live modes:

```
✅  Deterministic risk engine — an LLM can never override a stop-loss
✅  Elias cannot execute without passing all authorization checks
✅  No model fallback may authorize a trade
✅  Max position size: 5% of portfolio per trade
✅  Max daily trades: 10
✅  Minimum risk-to-reward ratio: 2.5:1 (enforced by Zarah)
✅  Stop-Loss: −5% to −10% per position
✅  Take-Profit: +20% to +50% per position
✅  Simulation mode available for safe development and backtesting
```

---

## 📊 Dashboard Features

The **Command Center** (Next.js PWA) provides:

| Feature | Description |
|---------|-------------|
| 🏦 Portfolio Balance | Live P&L and equity curve |
| 🤖 Agent Brain Stream | Real-time Supabase feed of all agent thoughts and decisions |
| 📈 Active Positions | Live trade table with entry price, current price, PnL |
| 📜 Trade History | Full historical ledger with win rate and performance stats |
| ❤️ Agent Health Matrix | Argus-powered latency and error rate dashboard for all 7 agents |
| 🔔 Overseer Logs | Live Argus diagnostic stream with alert severity levels |

---

## 🧪 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS, Lucide Icons |
| **Realtime** | Supabase Realtime JS SDK |
| **Backend** | Python 3.11+, asyncio, httpx, tenacity |
| **Database** | Supabase PostgreSQL |
| **AI Providers** | Groq, DeepSeek, Alibaba Cloud Qwen (via OpenRouter) |
| **Alerts** | Telegram Bot API |
| **Market Data** | DexScreener API (live Solana DEX data) |

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

**Built with 🧠 by Bilal Muhammad**

*V.2.0 — Seven minds. One goal. Unstoppable execution.*

</div>
