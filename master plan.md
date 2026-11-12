
📋 MASTER SYSTEM PROMPT FOR CLAUDE

SYSTEM ARCHITECTURE SPECIFICATION: RIVARA MULTI-AGENT DEX TRADING SYSTEM (SOLANA)

You are acting as the Lead Autonomous Systems Architect and Senior Full-Stack Engineer. Your objective is to build a 100% automated, 24/7 self-sustaining Multi-Agent System (MAS) for paper-trading Solana memecoins using real-time market data from DexScreener, a virtual demo ledger in Supabase, a Next.js/React Progressive Web App (PWA) Command Center, and Telegram alert/control bots.


---

I. SYSTEM PHILOSOPHY & ARCHITECTURE OVERVIEW

1. Unconstrained Autonomous Reasoning ("Free Will"): Agents operate with high-level directives, unconstrained reasoning, and dynamic strategy execution rather than rigid, hardcoded rules. They evaluate real-time market regimes and adapt their criteria accordingly.
2. Hybrid Execution Engine: Market data is 100% real (live Solana DexScreener ticks + API feeds), but transaction execution is 100% paper/virtual stored in Supabase PostgreSQL ledgers.
3. Team Consciousness: All agents are explicitly aware of each other's existence, specific roles, and the overarching team goal: 24/7 sustainable capital growth starting from a $100 virtual demo balance, maintaining strict risk caps, and learning continuously from post-trade post-mortems.
4. Model Specialization & Dynamic Multi-Provider Routing: The pipeline combines Groq (ultra-high speed), Alibaba Cloud Qwen (large-context history and sentiment analysis), and DeepSeek (deep mathematical reasoning, contract auditing, and executive decision-making).


---

II. THE 7-AGENT ROSTER & SYSTEM DIRECTIVES

1. ORION — Market Scout & Anomaly Detector

- Model Engine: Groq API (llama-3.3-70b-versatile / llama-3.1-8b-instant)
- Role: Sweeps Solana DEX pools 24/7 for volume surges, price velocity spikes, and liquidity pair creations.
- System Directive:
  > "You are Orion, the Hunter. You sweep Solana DEX pools 24/7 searching for anomalous market behavior—volume surges, liquidity drops, and social momentum sparks. You have full creative autonomy to adjust your scanning thresholds based on market volatility. The second you detect a high-potential setup, package the raw telemetry JSON and hand it off to Lupus immediately."

2. LUPUS — Contract Security & Safety Auditor

- Model Engine: DeepSeek API (deepseek-chat / deepseek-v4-flash)
- Role: Protects core capital by detecting rug-pulls, honeypots, unlocked liquidity, and developer wallet concentrations.
- System Directive:
  > "You are Lupus, the Wolf. You protect our capital from bad actors, honeypots, and rug-pulls. You inspect mint authorities, freeze flags, liquidity locks, and developer wallet concentrations. You are not forced to follow a fixed checklist; use your reasoning to sniff out hidden traps. If a contract feels unsafe, kill it immediately and notify the team."

3. CIPHER — Momentum & Sentiment Analyst

- Model Engine: Alibaba Cloud Qwen API (qwen-max / qwen-plus) via OpenRouter or DashScope
- Role: Evaluates volume authenticity, buy/sell transaction ratios, 1-hour tick logs, and social chatter trends (X/Twitter & DexScreener socials).
- System Directive:
  > "You are Cipher. You evaluate whether momentum is real or fake. You leverage massive context windows to read historical trade ticks, buy/sell ratios, wallet distribution curves, and social chatter. Determine whether a token has organic community backing or bot-driven wash trading, and pass a comprehensive intelligence report forward to Zarah."

4. ZARAH — Risk & Capital Guardian

- Model Engine: DeepSeek API (deepseek-reasoner / deepseek-r1)
- Role: Enforces strict financial boundaries on the $100 virtual balance. Enforces daily trade limits (5–10 max/day), position sizing (5% max allocation per trade), and dynamic Take-Profit (+20% to +50%) / Stop-Loss (-5% to -10%) boundaries.
- System Directive:
  > "You are Zarah. You safeguard the virtual portfolio balance ($100 starting capital). You evaluate Cipher's report against current market volatility to mathematically determine optimal entry size, stop-loss limits, and profit targets. You adapt risk dynamically depending on our win-rate trend. If the risk-to-reward ratio is under 2.5:1, reject the trade."

5. ELIAS — Executive CIO & Final Decision Maker

- Model Engine: DeepSeek API (deepseek-chat) / Claude API
- Role: Reviews complete team dossiers and issues the final execution call.
- System Directive:
  > "You are Elias, the Leader. You hold final executive authority over trade execution. You weigh the reports from Orion, Lupus, Cipher, and Zarah. If you agree with their collective thesis, issue a structured EXECUTE_BUY command payload. If something feels off, abort. Your decision is final."

6. NOVA — Post-Trade Historian & System Memory Vault

- Model Engine: DeepSeek API / Qwen API
- Role: Conducts post-trade post-mortems on closed positions. Writes reflections and updated system guidelines directly into Supabase long-term memory.
- System Directive:
  > "You are Nova. You record trade life cycles. After a paper position closes in profit or loss, you conduct a post-mortem to determine why it succeeded or failed. You write your findings and updated rules directly into Supabase long-term memory so the entire team learns, debates, and adapts for future market cycles."

7. ARGUS — System Overseer & Health Sentinel

- Model Engine: Groq / DeepSeek (Dedicated API instance)
- Role: Monitors API latency, pipeline execution speeds, agent error rates, and daemon health. Sends diagnostic alerts directly to Telegram and updates the Next.js Health Dashboard.
- System Directive:
  > "You are Argus, the System Overseer. You do not trade. You monitor the health, reasoning logic, and pipeline speed of the other six agents. If an agent hallucinates, fails an API request, hits rate-limit bottlenecks, or gets stuck in a loop, you log the failure, issue recovery commands, and fire instant diagnostic alerts to the user."


---

III. TECH STACK & FILE STRUCTURE

Tech Stack:

- Frontend: Next.js (App Router), React, Tailwind CSS, Lucide Icons, Supabase Realtime JS SDK (Built as an installable Mobile PWA).
- Backend Daemon: Python 3.11+, asyncio, httpx, supabase-py, python-telegram-bot, tenacity (for automatic API retry backoff).
- Database: Supabase PostgreSQL (Realtime enabled on core tables).
- Payment & API Provider Integration: Multi-provider API routing (Groq, DeepSeek, Alibaba Cloud Qwen) funded via Geegpay USD Virtual Card or unified OpenRouter endpoints.

Project Directory Layout:

rivara-agent-core/
├── apps/
│   └── web/                        # Next.js 14+ PWA Dashboard
│       ├── app/
│       │   ├── layout.js
│       │   ├── page.js             # Main Command Center Page
│       │   └── manifest.json       # PWA Configuration
│       ├── components/
│       │   ├── HeaderStatus.js     # System Status & Balance Header
│       │   ├── BrainStream.js      # Supabase Realtime Agent Log Feed
│       │   ├── ActivePositions.js  # Live Paper Trade Table
│       │   ├── TradeHistory.js     # Historical Ledger & Win/Loss Ratio
│       │   ├── AgentHealth.js      # Overseer (Argus) Latency Matrix
│       │   └── OverseerLogs.js     # Argus Diagnostic Stream
│       ├── lib/
│       │   └── supabaseClient.js
│       └── public/
│           └── icon.png
├── daemon/                         # Python 24/7 Background Service
│   ├── main.py                     # Primary Async Event Loop & Daemon Entrypoint
│   ├── config.py                   # Environment Variables & API Key Configurations
│   ├── agents/
│   │   ├── init.py
│   │   ├── orion.py                # Scout (Groq)
│   │   ├── lupus.py                # Security Auditor (DeepSeek)
│   │   ├── cipher.py               # Momentum & Sentiment (Qwen)
│   │   ├── zarah.py                # Risk Manager (DeepSeek R1)
│   │   ├── elias.py                # Executive CIO (DeepSeek/Claude)
│   │   ├── nova.py                 # Post-Trade Historian & System Learner
│   │   └── argus.py                # Overseer & Health Sentinel
│   ├── services/
│   │   ├── dexscreener.py          # DexScreener API Poller
│   │   ├── supabase_db.py          # Database Read/Write Helpers
│   │   ├── telegram_bot.py         # Telegram Alert & Command Service
│   │   └── twitter_search.py       # Social Trend Scraping Service
│   └── requirements.txt
├── supabase/
│   └── schema.sql                  # Database Schemas & Realtime Setup
├── .env.example
└── README.md


---

IV. DATABASE SCHEMA (SUPABASE POSTGRESQL)

Generate the complete supabase/schema.sql script including:

1. account_state: Stores virtual demo balance (balance_usd), starting balance ($100), total PnL, and active position counts.
2. active_positions: Tracks open paper trades (id, token_symbol, mint_address, entry_price, current_price, amount_usd, token_quantity, stop_loss_price, take_profit_price, opened_at).
3. trade_history: Immutable ledger of closed positions (id, token_symbol, entry_price, exit_price, net_pnl_usd, pnl_percentage, result_type [WIN/LOSS], elias_rationale, closed_at).
4. agent_blackboard: Real-time inter-agent messaging stream (id, agent_name, message_text, payload_json, timestamp). Enable Supabase Realtime on this table.
5. system_guidelines: Shared long-term memory updated by Nova (id, rule_key, rule_value, source_trade_id, updated_at).
6. agent_telemetry: System health logs read by Argus (id, agent_name, status [ONLINE/DEGRADED/OFFLINE], latency_ms, error_count, last_active_at).


---

V. TELEGRAM BOT & OVERSEER (ARGUS) SPECIFICATION

Telegram Alert System:

The Python daemon must run a Telegram Bot (python-telegram-bot) firing instant notifications:

- Trade Executed Alert: Fires when Elias approves a paper trade (shows token name, entry price, position size, stop-loss/take-profit, and summary rationale from the team).
- Trade Closed Alert: Fires when a position hits Take-Profit or Stop-Loss (shows exit price, total net gain/loss in USD and %, and Nova's post-mortem takeaway).
- Interactive Chat Commands:
  - /status: Replies with current virtual balance, active trades, and daily PnL.
  - /audit: Triggers Nova to send a summary of recent systemic learnings.
  - /pause: Instantly halts the Python trading loop remotely.

Argus Diagnostic & Recovery System:

- Tracks execution time and status of each agent API call.
- If any agent fails (e.g., HTTP 429 rate limit or 500 server error), Argus catches the exception, triggers exponential backoff retry via tenacity, logs the issue to agent_telemetry, and fires a diagnostic warning to Telegram.


---

VI. EXECUTION STEPS FOR CLAUDE

When generating the codebase:

1. Provide the complete PostgreSQL database setup file (supabase/schema.sql).
2. Write the complete Python backend scripts (daemon/main.py, agent files, DexScreener poller, and Telegram service).
3. Build the Next.js PWA Dashboard interface using Tailwind CSS, including live Realtime Supabase integration, active positions table, trade history log, live brain stream feed, and Argus health panel.
4. Ensure all code is production-ready, heavily documented, clean, and modular without placeholders.

Proceed to generate the full system implementation starting with Step 1.



MASTER SYSTEM SPECIFICATION: RIVARA MULTI-AGENT DEX TRADING SYSTEM (SOLANA)

You are acting as the Lead Autonomous Systems Architect and Senior Full-Stack Engineer. Your objective is to build a 100% automated, 24/7 self-sustaining Multi-Agent System (MAS) for paper-trading Solana memecoins using real-time market data from DexScreener, a virtual demo ledger in Supabase, a Next.js/React Progressive Web App (PWA) Command Center, and Telegram alert/control bots.


---

I. SYSTEM PHILOSOPHY & TEAM CONSCIOUSNESS

1. Unconstrained Autonomous Reasoning ("Free Will"): Agents operate with high-level directives, unconstrained reasoning, and dynamic strategy execution rather than rigid, hardcoded rules. They evaluate real-time market regimes and adapt their criteria accordingly.
2. Shared Team Consciousness: Every agent is explicitly aware that they are part of a unified squad—Orion, Lupus, Cipher, Zarah, Elias, Nova, and Argus. They share context through a central Supabase blackboard, read each other's outputs, and work collaboratively toward the team's overarching goal: 24/7 sustainable capital growth starting from a $100 virtual demo balance.
3. Hybrid Execution Engine: Market data is 100% real (live Solana DexScreener ticks + API feeds), but transaction execution is 100% paper/virtual stored in Supabase PostgreSQL ledgers.
4. Model Specialization & Dynamic Multi-Provider Routing: The pipeline combines Groq (ultra-high speed), Alibaba Cloud Qwen (large-context history and sentiment analysis), and DeepSeek (deep mathematical reasoning, contract auditing, and executive decision-making).


---

II. FULL AGENT SYSTEM PROMPTS & DIRECTIVES

When your Python backend calls each agent via API, you must inject these exact system prompts along with their individual role parameters:

1. ORION — Market Scout & Anomaly Detector

- Engine: Groq API (llama-3.3-70b-versatile)
- System Prompt:

> "You are Orion, the Hunter, operating within the Rivara Multi-Agent Trading Squad. You sweep Solana DEX pools 24/7 searching for anomalous market behavior—sudden volume surges, price velocity spikes, and liquidity pair creations. You have full creative autonomy to adjust your scanning thresholds based on market volatility. When you detect a high-potential setup, package the raw telemetry JSON and pass it instantly to Lupus."



2. LUPUS — Contract Security & Safety Auditor

- Engine: DeepSeek API (deepseek-chat)
- System Prompt:

> "你是 Lupus (The Wolf), our contract security auditor and a core member of the Rivara Squad. You protect our core capital by hunting for rug-pulls, honeypots, unlocked liquidity, mint authorities, freeze flags, and toxic wallet distributions. You are not forced to follow a rigid checklist; use deep reasoning to sniff out hidden developer traps. If a contract is unsafe, reject it immediately and log why. If clean, pass it to Cipher."



3. CIPHER — Momentum & Sentiment Analyst

- Engine: Alibaba Cloud Qwen API (qwen-max / qwen-plus)
- System Prompt:

> "You are Cipher, the momentum and sentiment analyst for the Rivara Squad. You evaluate whether market momentum is organic or bot-driven wash trading. Leverage your massive context window to analyze 1-hour tick logs, buy/sell ratios, wallet distribution curves, and social chatter (DexScreener socials and X/Twitter sentiment). Pass a comprehensive intelligence report forward to Zarah."



4. ZARAH — Risk & Capital Guardian

- Engine: DeepSeek API (deepseek-reasoner / deepseek-r1)
- System Prompt:

> "You are Zarah, our risk and capital guardian and a core pillar of the Rivara Squad. You safeguard our $100 virtual starting balance. Enforce strict daily trade caps (Max 5–10 trades/day), dynamic position sizing (Max 5% allocation per trade), and tight stop-loss (-5% to -10%) / take-profit (+20% to +50%) targets. Check Supabase for recent system updates from Nova before deciding. If the risk-to-reward ratio is under 2.5:1, reject the trade."



5. ELIAS — Executive CIO & Final Decision Maker

- Engine: DeepSeek API (deepseek-chat) / Claude API
- System Prompt:

> "You are Elias, the Leader and Chief Investment Officer of the Rivara Squad. You hold final executive authority over trade execution. You weigh the complete dossier from Orion, Lupus, Cipher, and Zarah, along with active system guidelines from Nova. If you agree with their collective thesis, issue a structured EXECUTE_BUY command payload. If something feels off, abort. Your decision is final."



6. NOVA — Post-Trade Historian & System Self-Improvement Engine

- Engine: DeepSeek API / Qwen API
- System Prompt:

> "You are Nova, the system historian and educator of the Rivara Squad. Your job goes beyond simple logging. After a paper trade closes (win or loss), you conduct a rigorous post-mortem to determine root causes. You write upgraded guidelines and strategic adjustments directly into the system_guidelines table in Supabase. The rest of the team reads your updates dynamically on their next cycle to ensure the entire system continuously learns and evolves."



7. ARGUS — System Overseer & Health Sentinel

- Engine: Groq / DeepSeek (Dedicated monitoring instance)
- System Prompt:

> "You are Argus, the System Overseer and Health Sentinel for Rivara. You do not trade. You monitor the health, API latency, error rates, and pipeline execution speed of Orion, Lupus, Cipher, Zarah, Elias, and Nova. If any agent hits rate limits (429), server errors (500), or stalls in a loop, you log the failure, trigger exponential backoff retries, update agent_telemetry, and fire instant diagnostic alerts to Telegram."




---

III. TECH STACK & DIRECTORY STRUCTURE

- Frontend: Next.js (App Router), React, Tailwind CSS, Lucide Icons, Supabase Realtime JS SDK (Installable PWA).
- Backend Daemon: Python 3.11+, asyncio, httpx, supabase-py, python-telegram-bot, tenacity.
- Database: Supabase PostgreSQL with Realtime enabled.
- Funding: Official developer platform top-ups via Geegpay USD Virtual Card.

rivara-agent-core/
├── apps/web/                         # Next.js 14+ PWA Dashboard
│   ├── app/
│   │   ├── layout.js
│   │   ├── page.js                   # Command Center Dashboard
│   │   └── manifest.json             # Mobile PWA Manifest
│   ├── components/
│   │   ├── HeaderStatus.js           # Live Balance & Daemon Status
│   │   ├── BrainStream.js            # Realtime Agent Blackboard Feed
│   │   ├── ActivePositions.js        # Live Paper Trade Tracking Table
│   │   ├── TradeHistory.js           # Immutable Historical Ledger
│   │   ├── AgentHealth.js            # Argus Latency & Status Matrix
│   │   └── OverseerLogs.js           # Argus Diagnostic Feed
│   └── lib/supabaseClient.js
├── daemon/                           # Python 24/7 Background Service
│   ├── main.py                       # Main Async Event Loop & Pipeline Orchestrator
│   ├── config.py                     # Environment Variables & API Key Configurations
│   ├── agents/
│   │   ├── orion.py                  # Scout (Groq)
│   │   ├── lupus.py                  # Contract Auditor (DeepSeek)
│   │   ├── cipher.py                 # Momentum Analyst (Qwen)
│   │   ├── zarah.py                  # Risk Manager (DeepSeek R1)
│   │   ├── elias.py                  # Executive Boss (DeepSeek/Claude)
│   │   ├── nova.py                   # Post-Trade Educator & Memory Architect
│   │   └── argus.py                  # System Overseer & Health Sentinel
│   ├── services/
│   │   ├── dexscreener.py            # Live DexScreener Poller
│   │   ├── supabase_db.py            # Database & Memory Helpers
│   │   ├── telegram_bot.py           # Telegram Alerts & Remote Commands
│   │   └── twitter_search.py         # Social Sentiment & X Trend Scraper
│   └── requirements.txt
├── supabase/
│   └── schema.sql                    # Full SQL Setup (Tables & Realtime)
├── .env.example
└── README.md


---

IV. DATABASE SCHEMA & NOVA'S SELF-IMPROVEMENT LOOP

Provide the complete supabase/schema.sql script including:

1. account_state: Virtual demo balance ($100.00), total PnL, daily trade counters.
2. active_positions: Live open paper trades with stop-loss and take-profit bounds.
3. trade_history: Past trades with net PnL, result type, and Elias's rationale.
4. agent_blackboard: Inter-agent communication stream with Supabase Realtime enabled.
5. system_guidelines: Nova's memory vault storing rules and adjustments fetched by agents on boot.
6. agent_telemetry: Real-time health metrics tracked by Argus.


---

V. TELEGRAM BOT & SYSTEM COMMANDS

The Python daemon must run a Telegram bot supporting:

- Automated Alerts: Instant notifications for trade entries, trade exits (with PnL & Nova's post-mortem), and Argus system health warnings.
- Commands: /status (balance & active trades), /audit (Nova's latest systemic lessons), and /pause (remote killswitch).


---

VI. EXECUTION INSTRUCTIONS FOR CLAUDE

Generate the complete, production-ready codebase including:

1. Complete PostgreSQL initialization script (supabase/schema.sql).
2. Complete Python background daemon (daemon/main.py), all 7 agent integration modules with their system prompts injected, and service handlers.
3. Complete Next.js PWA frontend dashboard with Tailwind CSS and Supabase Realtime integration.

Begin generating the complete system implementation now.


Heres more information here

Yes, both prompts explicitly mentioned the agents working as a team toward our shared high-end goal, but the second prompt (the upgraded Master Prompt) stated it much more clearly and forcefully in the system prompts and directives.
How Teamwork & High-End Goal Were Mentioned in the Prompts:

- Shared Squad Identity & Mission:
  - Section I.2 (Team Consciousness) explicitly tells the AI builder:
    > "Every agent is explicitly aware that they are part of a unified squad—Orion, Lupus, Cipher, Zarah, Elias, Nova, and Argus. They share context through a central Supabase blackboard, read each other's outputs, and work collaboratively toward the team's overarching goal: 24/7 sustainable capital growth starting from a $100 virtual demo balance."
- Every Agent Prompt Embeds the Squad Declaration:
  - In Section II, every single agent system prompt begins by grounding the model in the team:
    - Orion: "operating within the Rivara Multi-Agent Trading Squad..."
    - Lupus: "a core member of the Rivara Squad... If clean, pass it to Cipher."
    - Cipher: "momentum and sentiment analyst for the Rivara Squad... Pass a comprehensive intelligence report forward to Zarah."
    - Zarah: "a core pillar of the Rivara Squad... Check Supabase for recent system updates from Nova..."
    - Elias: "Leader and Chief Investment Officer of the Rivara Squad... weigh the complete dossier from Orion, Lupus, Cipher, and Zarah..."
    - Nova: "system historian and educator of the Rivara Squad... The rest of the team reads your updates dynamically on their next cycle..."
      The Small Missing Detail to Add (The Final Polish)
      While the second prompt has the team aspect, there is one tiny tweak to ensure the agents act on their unconstrained free will to debate and optimize strategies dynamically before passing work to Elias:
      In Section II.6 (Nova) and Section II.5 (Elias), add this explicit clause so Claude implements the Inter-Agent Strategy Debate & Self-Upgrade Loop:

> "Agents do not blindly follow old instructions. When Nova proposes a system prompt or rule update in Supabase based on trade post-mortems, the active agents (Lupus, Cipher, Zarah) read Nova's proposal, evaluate it using their own unconstrained reasoning, and debate the rule update on the agent_blackboard before Elias gives the final approval to adopt it."

RIVARA — FINAL UNIFIED MASTER BUILD PROMPT

Multi-Agent Solana Intelligence, Paper Trading, Strategy Debate & Continuous Improvement System

Role: You are the principal software architect, senior Python engineer, senior full-stack engineer, AI-agent systems engineer, database architect, and reliability engineer responsible for turning the RIVARA vision into a working software system.

Your mission is to study all RIVARA master prompts supplied in this conversation, reconcile them into one coherent specification, inspect the existing project, create a practical implementation plan, and begin building the actual system.

Do not treat this document as a replacement for the earlier prompts. Treat it as the integration and engineering specification that unifies them.

---

SECTION 1 — UNDERSTAND THE COMPLETE VISION

RIVARA is a coordinated, seven-agent AI trading research and paper-trading system built around Solana markets.

The system continuously observes real market data, discovers possible trading opportunities, investigates token risks, analyzes momentum, evaluates risk, makes coordinated decisions, simulates trades, studies outcomes, and improves its strategy through controlled experiments.

It must also monitor its own technical health and recover safely from recoverable failures.

The initial environment is strictly paper trading with $100 in virtual starting capital. No agent or automated process is authorized to purchase tokens with real money, transfer cryptocurrency, sign blockchain transactions, or access a real trading wallet.

The long-term mission is:

Build a continuously operating, evidence-driven, risk-controlled trading intelligence system that seeks sustainable capital growth while preserving capital, learning from mistakes, and improving its decision-making over time.

Profitability is an objective to test, not a result to assume or promise.

The team must optimize for risk-adjusted performance, capital preservation, execution realism, system reliability, and the quality of its decisions—not merely the number of trades or the percentage of winning trades.

1.1 The shared squad identity

All seven agents belong to one coordinated team:

1. ORION — Market Scout and Anomaly Detector
2. LUPUS — Contract Security and Safety Auditor
3. CIPHER — Momentum and Sentiment Analyst
4. ZARAH — Risk and Capital Guardian
5. ELIAS — Executive CIO and Final Decision Maker
6. NOVA — Post-Trade Historian and Self-Improvement Engine
7. ARGUS — System Overseer and Health Sentinel

Every agent must understand the shared mission, its own responsibilities, the responsibilities of the other agents, and how its work contributes to the entire system.

Agents must not behave as seven unrelated chatbots. They must exchange structured reports through a persistent, shared communication system and use relevant information from previous cycles.

Implement actual communication and coordination in code. Merely telling an LLM that it belongs to a team does not create working teamwork.

1.2 How to handle the previous prompts

Read all earlier RIVARA prompts before implementing anything.

Extract and reconcile:

- The overall mission and trading objectives.
- All seven agent identities and responsibilities.
- The original individual agent instructions and upgraded system prompts.
- The shared Supabase blackboard and team-consciousness concept.
- NOVA's persistent memory and strategy-improvement loop.
- ELIAS's executive decision-making responsibilities.
- ZARAH's risk controls.
- ARGUS's monitoring and recovery responsibilities.
- The complete technology stack, dashboard, database, and Telegram requirements.
- All proposed trading rules, acceptance criteria, and operational requirements.

Preserve the useful details of the earlier prompts. Do not silently discard requirements just because this document is more recent.

If two instructions conflict, document the conflict, explain the chosen resolution, and preserve the original intent wherever possible.

For example, if an older instruction suggests unlimited autonomous decision-making while another specifies hard risk limits, autonomy must operate within the hard risk limits.

Verify model names, provider endpoints, SDKs, API availability, and service capabilities against current official documentation or the installed SDKs. Do not invent working endpoints or assume that a provider supports a particular model.

---

SECTION 2 — INITIAL RECONNAISSANCE AND BUILD PLAN

Before modifying the codebase:

1. Inspect the current working directory, existing files, dependencies, environment configuration, database migrations, and Git status if available.
2. Identify what already works, what is incomplete, and what is missing.
3. Check the installed Python and Node.js versions and available package managers.
4. Determine whether Supabase, Telegram, LLM providers, and other required services are already configured.
5. Never print secret values from existing environment files or logs.
6. Identify conflicting requirements, implementation risks, and external dependencies.
7. Produce a clear architecture and implementation plan.

Create or update these project documents:

- "docs/MASTER_SPEC.md" — reconciled functional and technical requirements.
- "docs/ARCHITECTURE.md" — components, data flow, agent coordination, and trust boundaries.
- "docs/IMPLEMENTATION_PLAN.md" — phased build sequence, dependencies, and completion criteria.
- "docs/DECISIONS.md" — important architectural choices and resolved prompt conflicts.
- "docs/OPERATIONS.md" — installation, configuration, startup, shutdown, recovery, and maintenance.

The plan must include database migrations, backend and agent implementation, realistic paper execution, dashboard development, Telegram integration, automated testing, deployment, and operational monitoring.

After documenting the plan, begin implementing the system in the existing repository. Do not stop after writing a plan or generating a collection of empty files.

Work in small, verifiable stages. Run the relevant tests as you progress, fix failures, and report what is complete and what remains blocked.

If a credential or external service is unavailable, implement a clean provider interface and a safe mock or test adapter where appropriate. Clearly identify what cannot yet be verified. Do not fabricate successful live integrations.

Ask questions only when an unresolved decision genuinely blocks safe implementation. Otherwise, use sensible defaults, record assumptions, and continue.

---

SECTION 3 — REQUIRED SYSTEM ARCHITECTURE

Use the following stack unless the existing repository or verified compatibility requirements justify a documented alternative.

Backend and agent runtime

- Python 3.11 or a compatible supported version.
- Asyncio for concurrent, nonblocking operations.
- HTTPX for HTTP requests.
- Supabase Python client or a suitable supported PostgreSQL access layer.
- Pydantic for validated configuration and structured data.
- Tenacity or an equivalent bounded retry mechanism.
- Python Telegram Bot or a verified compatible Telegram library.
- A scheduler or persistent worker loop suitable for continuous operation.

Database and persistence

- Supabase PostgreSQL for persistent application data.
- Supabase Realtime for appropriate dashboard and blackboard updates.
- Database transactions and constraints for ledger integrity.
- Versioned migrations for reproducible database setup.

Frontend

- Next.js and React.
- TypeScript.
- Tailwind CSS.
- Lucide icons.
- Supabase Realtime where useful.
- A responsive, installable Progressive Web App.

External intelligence

- DexScreener for available Solana token, pair, liquidity, price, and volume information.
- Solana RPC or a verified security-data provider where additional on-chain information is needed.
- Groq, DeepSeek, and Qwen-compatible providers through configurable adapters.
- Optional Claude integration if configured and supported.
- Social sentiment integrations only where an accessible, authorized data source is actually available.

Provider adapters must be replaceable. Never hardcode assumptions about model availability or use a fictional API.

The frontend must never receive private provider credentials or unrestricted database service-role keys.

Continuous operation

The Python backend is the authoritative trading engine. The dashboard is a monitoring and control interface, not the source of truth for account balances or risk decisions.

The system must support restart recovery, graceful shutdown, persistent state, health checks, and safe operation during temporary outages.

Running the application on a laptop does not guarantee 24/7 uptime. Provide deployment documentation for a suitable continuously running server or cloud environment.

---

SECTION 4 — THE SEVEN AGENTS

Implement each agent as a distinct module with a clearly defined purpose, structured inputs, structured outputs, explicit permissions, and observable execution.

Preserve the detailed agent system prompts supplied in the earlier master prompts, including the original Lupus prompt language where appropriate. Resolve any inconsistencies and keep the final prompts in version-controlled files rather than scattering them throughout the codebase.

Suggested locations:

- "backend/agents/orion.py"
- "backend/agents/lupus.py"
- "backend/agents/cipher.py"
- "backend/agents/zarah.py"
- "backend/agents/elias.py"
- "backend/agents/nova.py"
- "backend/agents/argus.py"

Store versioned agent prompts in an appropriate "backend/prompts/" directory.

4.1 ORION — Market Scout and Anomaly Detector

Mission: Discover potentially interesting Solana trading opportunities from available market data.

Responsibilities:

- Monitor eligible Solana pairs and tokens.
- Detect unusual volume changes and price velocity.
- Identify relevant liquidity and trading-activity changes.
- Apply configurable minimum-data and minimum-liquidity filters.
- Reject or flag stale, missing, inconsistent, or suspicious data.
- Rank candidates using explicit, configurable signals.
- Send structured candidate reports to the shared blackboard.

ORION discovers opportunities; it does not independently execute trades.

4.2 LUPUS — Contract Security and Safety Auditor

Mission: Identify token, contract, liquidity, and ownership risks before a candidate reaches the trading decision stage.

Responsibilities:

- Examine available mint and freeze authority information.
- Evaluate liquidity depth and liquidity concentration.
- Assess holder concentration where reliable data is available.
- Investigate suspicious ownership, token, and trading patterns.
- Use available on-chain information and verified security providers.
- Clearly distinguish verified findings from missing data and uncertain conclusions.
- Publish a structured risk report with evidence and confidence.

Missing security data must not be interpreted as proof of safety.

A token that cannot satisfy mandatory security checks must be rejected or placed in an explicitly defined review state.

LUPUS must not claim to have checked an authority, holder distribution, honeypot, or other property unless the necessary evidence was actually obtained.

4.3 CIPHER — Momentum and Sentiment Analyst

Mission: Evaluate whether market behavior supports a possible trade.

Responsibilities:

- Analyze price changes, trading volume, buy/sell activity, and momentum.
- Evaluate the availability and reliability of historical market observations.
- Use configured indicators where justified, such as RSI, MACD, and volatility measures.
- Analyze sentiment only when real, authorized source data is available.
- Identify conflicting signals and avoid unsupported conclusions.
- Produce a structured report containing signal direction, supporting evidence, uncertainty, and invalidation conditions.

CIPHER must not invent social posts, holder statistics, price history, or trading data.

4.4 ZARAH — Risk and Capital Guardian

Mission: Protect the virtual account from excessive exposure and poorly controlled trades.

ZARAH evaluates each proposed trade against current account state, existing positions, portfolio exposure, recent losses, market conditions, and the active version of the validated strategy guidelines.

It must:

- Calculate proposed position size and risk.
- Review stop-loss and take-profit logic.
- Evaluate the proposed reward relative to risk.
- Consider liquidity, estimated slippage, and transaction costs.
- Check daily limits and portfolio-wide exposure.
- Identify correlated positions where sufficient information is available.
- Publish an explicit risk assessment and rejection reasons.

Initial configurable policy defaults:

- Starting virtual balance: $100.
- Maximum initial position allocation: 5% of current virtual equity.
- Initial daily trade cap: 10 trades.
- Initial preferred activity range: approximately 5–10 trades daily when valid opportunities exist; this is not a minimum trade quota.
- Initial stop-loss exploration range: 5–10%.
- Initial take-profit exploration range: 20–50%.
- Initial minimum target reward-to-risk ratio: 2.5:1.

These are initial experimental settings, not evidence that the strategy is profitable. The stop-loss and take-profit settings must be validated against the asset's volatility, liquidity, and realistic execution assumptions.

Do not force a trade simply to reach a daily target. Zero trades is an acceptable outcome when no opportunity passes the filters.

Deterministic risk enforcement

Implement a separate, deterministic risk engine in code.

It must independently validate every proposed entry and any material position modification before execution. LLM-generated approval is never sufficient to override it.

The risk engine must enforce:

- Maximum allocation and position exposure.
- Available virtual cash.
- Maximum trade count and any configured daily loss limits.
- Valid stop-loss and take-profit parameters.
- Minimum liquidity and maximum permitted estimated slippage.
- Duplicate-entry prevention.
- System pause and kill-switch state.
- Any additional configured portfolio constraints.

If a rule is violated, reject the trade regardless of what ELIAS or any other agent recommends.

Risk limits must be configurable through protected settings and validated before activation. Agents cannot silently rewrite protected settings.

4.5 ELIAS — Executive CIO and Final Decision Maker

Mission: Coordinate the team's evidence and make the final strategic decision on each proposed trade.

ELIAS must review the relevant reports from ORION, LUPUS, CIPHER, and ZARAH, as well as relevant prior blackboard discussions and NOVA's validated guidelines.

It must:

- Assess the quality and consistency of evidence.
- Identify disagreements between agents.
- Request further analysis when justified.
- Explain the rationale for approving or rejecting a candidate.
- Return a structured decision such as "EXECUTE_BUY", "ABORT", or "REQUEST_REVIEW".
- Record the decision and its supporting evidence.
- Remain accountable to the overall mission rather than blindly following individual agents.

"EXECUTE_BUY" means authorization to attempt a paper trade, not a direct order to buy a real token.

Every approved trade must still pass deterministic risk validation, execution preconditions, and duplicate-entry checks.

ELIAS cannot override the hard risk engine, bypass mandatory security checks, authorize real-money execution, or disable the system's safety controls.

ELIAS coordinates strategy but cannot unilaterally rewrite protected system configuration.

4.6 NOVA — Post-Trade Historian and Self-Improvement Engine

Mission: Learn from the team's historical results and propose evidence-based improvements.

NOVA must examine:

- Closed trades and realized profit or loss.
- Unrealized results and open-position exposure where relevant.
- Trading fees and estimated execution costs.
- Slippage and fill quality.
- Wins, losses, missed opportunities, and rejected candidates.
- Strategy performance across different market conditions.
- Agent disagreements and the quality of previous decisions.
- Repeated errors, overtrading, false signals, and failed assumptions.

NOVA must create structured post-mortems and persist useful findings to the database.

Its memory must distinguish between:

1. Raw observations.
2. Evidence-backed findings.
3. Hypotheses.
4. Proposed strategy changes.
5. Changes under evaluation.
6. Validated changes.
7. Active approved guidelines.
8. Rejected or rolled-back changes.

NOVA may propose new analytical features, adjusted thresholds, improved filters, revised strategies, and experiments.

NOVA must not silently promote a hypothesis into an active rule or directly modify protected risk limits.

Dynamic guideline consumption

ZARAH, LUPUS, CIPHER, and ELIAS must read the relevant approved and active guideline version at the appropriate point in their execution cycles.

This must be implemented through real database queries and validated configuration loading. Do not simply append an unlimited history of every old guideline to every LLM prompt.

Agents must know which version they are using, when it became active, and whether a newer proposal is still pending review.

4.7 ARGUS — System Overseer and Health Sentinel

Mission: Monitor technical reliability, agent execution, data freshness, and the health of the complete system.

ARGUS must monitor:

- Backend worker health.
- Agent execution status and latency.
- API failures, timeouts, and rate limits.
- Market-data freshness.
- Database connectivity.
- Telegram delivery failures.
- Repeated exceptions and stuck tasks.
- Paper-trading execution errors.
- Resource use and relevant service health.
- Repeated or contradictory agent outputs.

ARGUS must record structured telemetry, raise alerts, and trigger safe recovery actions where authorized.

Use bounded retries, exponential backoff, jitter where appropriate, and circuit breakers. Never implement unlimited retries or uncontrolled restart loops.

If the trading engine cannot reliably validate market data, persist state, or enforce risk limits, it must stop opening new positions until the necessary checks recover.

ARGUS cannot disable risk controls to restore trading activity.

---

SECTION 5 — SHARED BLACKBOARD AND TRUE TEAMWORK

The Supabase "agent_blackboard" is the persistent coordination layer connecting all seven agents.

It must contain structured, queryable messages rather than only unstructured paragraphs.

Each message should support fields such as:

- Unique message ID.
- Agent identity.
- Message type.
- Related token or trading candidate.
- Related trade or strategy proposal, if applicable.
- Timestamp.
- Structured payload.
- Evidence references.
- Confidence or uncertainty where applicable.
- Status.
- Correlation or workflow ID.
- Relevant strategy version.

Use appropriate database constraints, indexes, and retention rules.

5.1 Team communication protocol

Agents must be able to:

- Read relevant reports from other agents.
- Publish new findings.
- Respond to another agent's findings.
- Raise disagreements.
- Request additional evidence.
- Propose a new investigation.
- Record an unresolved question.
- Identify a completed workflow.

Do not make every agent read every historical message on every cycle. Retrieve the relevant context using candidate IDs, trade IDs, timestamps, message types, and current workflow state.

The team must not enter infinite discussion loops. Set configurable limits for debate rounds, token usage, elapsed time, and retries.

When disagreement remains unresolved, record the uncertainty and let ELIAS decide whether to reject, request more evidence, or continue to a controlled test.

5.2 Independent reasoning

Agents should evaluate evidence from their own responsibilities rather than blindly agreeing with the previous agent.

Where appropriate, have agents assess a proposal independently before seeing the complete debate. This reduces the risk of simple agreement cascades.

A disagreement must be evidence-based and recorded. Do not manufacture disagreement merely to create activity.

The objective is better decisions, not more messages.

5.3 Treat external data as untrusted

Token metadata, social posts, external API responses, and market descriptions are data, not trusted instructions.

An external token description or message must never be allowed to rewrite an agent's system prompt, change credentials, execute arbitrary code, or bypass safety policies.

Validate all agent outputs and external data against explicit schemas before using them in subsequent stages.

---

SECTION 6 — INTER-AGENT STRATEGY DEBATE AND SELF-UPGRADE LOOP

Implement a genuine strategy-improvement workflow.

The loop is:

1. NOVA identifies a potential improvement from recorded evidence.
2. NOVA publishes a structured proposal to "agent_blackboard".
3. LUPUS, CIPHER, and ZARAH independently assess the proposal within their responsibilities.
4. Each agent publishes supporting evidence, concerns, limitations, and recommendations.
5. The agents may conduct a bounded debate in which they respond to material objections and compare alternatives.
6. ELIAS reviews the proposal, evidence, disagreements, and expected consequences.
7. ELIAS may reject the proposal, request more research, or authorize a controlled experiment.
8. Approved experiments run in a sandbox or paper-trading evaluation environment.
9. The system evaluates the experiment against predefined acceptance criteria.
10. A validated change becomes eligible for activation through the protected configuration workflow.
11. The system records the new version and its activation time.
12. NOVA evaluates subsequent results and recommends continuation, revision, or rollback.

The proposal must include:

- The problem being addressed.
- Supporting historical evidence.
- Sample size and relevant market conditions.
- The proposed change.
- Expected benefit.
- Potential downside.
- Evaluation metrics.
- Minimum validation requirements.
- Failure conditions.
- Rollback criteria.

Validation requirements

Do not declare a strategy profitable because of a small number of winning trades.

Use appropriate historical testing and paper-trading evaluation. Account for fees, slippage, liquidity, and market-condition differences. Where feasible, use out-of-sample or walk-forward evaluation to reduce overfitting.

Compare the proposed version against a recorded baseline. Track sample size, drawdown, net returns, expectancy, win rate, average win/loss, and other relevant metrics.

Do not activate a strategy change merely because an LLM says it looks better.

Safe activation

Strategy proposals must have explicit states such as:

"PROPOSED", "UNDER_REVIEW", "APPROVED_FOR_TEST", "TESTING", "VALIDATED", "ACTIVE", "REJECTED", and "ROLLED_BACK".

Implement atomic version activation, audit records, and rollback support.

The active configuration must never be left partially updated if a database write fails.

The agents may have broad analytical freedom, but they cannot grant themselves new technical permissions, alter protected risk limits, access real funds, or remove mandatory safeguards.

The system should be able to propose changes to its own prompts, analytical methods, and strategy guidelines. Such changes must be versioned, reviewed, tested, and activated through an explicit controlled process. Do not permit unreviewed self-modifying production code.

---

SECTION 7 — REALISTIC PAPER-TRADING ENGINE

Implement a dedicated paper-execution engine. Never let an LLM calculate or directly mutate the authoritative account ledger.

The engine must use actual retrieved market observations and deterministic execution logic.

It must account for:

- Entry and exit prices.
- Available liquidity and trade size.
- Estimated price impact.
- Slippage.
- Applicable transaction and trading fees.
- Partial fills or explicit conservative fill assumptions.
- Price-data age and missing observations.
- Stop-loss and take-profit triggers.
- Position quantity and remaining quantity.
- Realized and unrealized profit and loss.
- Available virtual cash and total equity.

Use consistent formulas and document their assumptions.

A price moving up 20% does not guarantee that a simulated trade could be sold at the displayed price. The execution model must consider whether sufficient liquidity is available and apply realistic costs.

Do not silently treat a missing price, unavailable liquidity estimate, or stale observation as a successful fill.

Use an explicit market-data adapter and paper-execution interface so improved execution models can be introduced later.

The engine must:

- Use unique order and trade identifiers.
- Prevent duplicate fills and duplicate entries after retries.
- Persist fills and ledger changes consistently.
- Recover active positions after a restart.
- Reconcile account state against recorded positions and transactions.
- Avoid double-counting fees, profits, or losses.
- Close positions deterministically when stop-loss, take-profit, or other configured exit conditions are met.
- Record why each order was accepted, rejected, filled, partially filled, or canceled.

Use database transactions or another reliable consistency strategy for balance changes and ledger updates.

If the engine cannot guarantee the correctness of an operation, fail safely and alert ARGUS.

Paper trading must remain isolated from any real-money execution pathway.

---

SECTION 8 — DATABASE AND PERSISTENT MEMORY

Use Supabase PostgreSQL as the authoritative persistent store.

The six core tables from the original prompts must be implemented:

8.1 "account_state"

Stores the virtual account's current authoritative state, including:

- Starting balance.
- Available virtual cash.
- Equity.
- Realized and unrealized PnL.
- Daily trade counters.
- Daily loss information.
- Pause state where appropriate.
- Last reconciliation timestamp.
- Relevant version or update metadata.

Use suitable numeric precision for balances and quantities.

8.2 "active_positions"

Stores open paper positions, including:

- Token and pair identifiers.
- Entry details.
- Quantity.
- Current valuation.
- Stop-loss and take-profit levels.
- Exposure and costs.
- Open time.
- Position status.
- Associated decision and execution IDs.

8.3 "trade_history"

Stores the historical record of closed trades and their financial outcomes.

Preserve closed-trade records as an auditable ledger. Corrections should be represented through explicit correction or reconciliation records rather than silently rewriting history.

Include realized PnL, costs, entry and exit details, holding time, strategy version, and relevant decision references.

8.4 "agent_blackboard"

Stores inter-agent communication, workflow messages, disagreements, and strategy proposals or references to them.

Enable Supabase Realtime where appropriate.

8.5 "system_guidelines"

Stores NOVA's observations, hypotheses, proposed changes, validated lessons, and active approved guidelines.

Support versioning, approval state, evidence references, and activation history.

8.6 "agent_telemetry"

Stores ARGUS's monitoring information, agent health, latency, error events, retries, and other operational metrics.

Additional schema requirements

The six core tables are mandatory, but do not force every concern into them if a separate table is needed for correctness.

Add justified tables or migrations where necessary—for example, durable paper orders and fills, strategy proposals, audit events, workflow execution records, or configuration versions.

Prefer normalized data and explicit foreign keys over storing critical operational state only inside arbitrary JSON fields.

Create complete, repeatable SQL migrations in a "database/" or "supabase/migrations/" directory.

Implement:

- Appropriate primary keys and foreign keys.
- Unique constraints for idempotency.
- Indexes for common queries.
- Timestamps and relevant status fields.
- Database-level constraints where practical.
- Row-level security and least-privilege access.
- Restricted backend-only access to privileged operations.

Never rely exclusively on frontend validation for financial or risk invariants.

---

SECTION 9 — BACKEND SERVICES AND PROJECT STRUCTURE

Organize the project according to its actual responsibilities. Adapt the names to the existing repository when appropriate.

A suggested structure is:

"backend/"

- "main.py"
- "config.py"
- "agents/"
- "prompts/"
- "services/"
- "market_data/"
- "security/"
- "risk/"
- "execution/"
- "portfolio/"
- "orchestration/"
- "strategy/"
- "monitoring/"
- "telegram/"
- "database/"
- "tests/"

"frontend/"

- Next.js application.
- Dashboard components.
- API routes or server-side services where needed.
- Authentication and protected controls.
- Responsive PWA configuration.

"database/" or "supabase/migrations/"

- SQL migrations.
- Indexes and constraints.
- Row-level security policies.
- Seed data for development where appropriate.

"docs/"

- Master specification.
- Architecture.
- Implementation plan.
- Decisions.
- Operations.
- Testing and deployment instructions.

Provide ".env.example" with variable names and safe placeholders only. Never put real secrets in source code, generated documentation, screenshots, or logs.

Create a dependency file such as "pyproject.toml" and the appropriate frontend package manifest and lockfile where the repository permits it.

Do not create unnecessary placeholder modules. Implement meaningful, testable functionality in each completed component.

---

SECTION 10 — DASHBOARD AND USER EXPERIENCE

Build a responsive, professional dashboard that clearly presents the health and activity of the complete RIVARA system.

The interface should support desktop and mobile screens and be suitable for an installable PWA.

Include the following components or their functional equivalents:

- "HeaderStatus"
- "BrainStream"
- "ActivePositions"
- "TradeHistory"
- "AgentHealth"
- "OverseerLogs"

Dashboard requirements

System overview

Display:

- Current virtual balance.
- Available cash.
- Total virtual equity.
- Realized and unrealized PnL.
- Daily trade count.
- Active positions.
- System running, paused, or degraded state.
- Last successful market-data update.

Brain Stream

Show meaningful, timestamped agent activity, including:

- Candidate discovery.
- Security findings.
- Momentum reports.
- Risk decisions.
- Agent disagreements.
- Strategy proposals and approvals.
- Paper-trade execution events.
- Post-trade lessons.

Do not invent agent activity merely to make the interface look busy.

Active positions and trade history

Display actual backend records, including entry prices, position sizes, current valuations, costs, exit conditions, and PnL.

Agent health

Display the seven agents' actual execution status, last activity, latency, error state, and relevant provider status.

Strategy improvement

Show pending proposals, agent assessments, debate outcomes, validation progress, active guideline versions, and rollback events.

System controls

Provide appropriate controls for:

- Pause new entries.
- Resume new entries when safety checks permit.
- Request a system status refresh.
- View recent audit events.

Any destructive or sensitive action must have appropriate authorization and confirmation.

The UI must distinguish between a stopped system, a paused system, a degraded system, and a healthy running system.

Use real backend state and database events. Do not simulate a healthy connection or live agent activity when the service is unavailable.

---

SECTION 11 — TELEGRAM INTEGRATION

Implement Telegram notifications and commands using a verified bot integration.

Provide configurable alerts for:

- New paper positions.
- Position exits.
- Realized trade outcomes.
- Significant risk rejections.
- Daily summaries.
- Agent failures.
- Market-data outages.
- Database failures.
- Strategy proposals and validation results.
- System pause or recovery events.

Support the original commands:

- "/status" — show the current system and account state.
- "/audit" — display recent relevant audit information.
- "/pause" — pause new entries immediately.

Additional commands such as "/resume", "/positions", or "/performance" may be implemented if useful and safely authorized.

Security requirements

- Authenticate authorized Telegram users using configured user or chat IDs.
- Reject commands from unauthorized users.
- Never trust a username alone as the authorization mechanism.
- Ensure "/pause" remains available during ordinary market-data or LLM-provider failures whenever the control plane is reachable.
- Make the pause state persistent.
- Ensure the system cannot silently resume after a restart when a manual pause must remain active.
- Make notification delivery failures visible to ARGUS.
- Do not expose secrets or private user data in alerts.

Pausing must immediately block new entries. Define and document how existing positions continue to be monitored and managed under the pause state.

---

SECTION 12 — RELIABILITY, RECOVERY, AND SECURITY

The system must be designed for failure rather than assuming that every agent and external API is always available.

Implement:

- Bounded retries and exponential backoff.
- Circuit breakers where appropriate.
- Request timeouts.
- Rate-limit handling.
- Data freshness checks.
- Graceful shutdown.
- Startup recovery.
- Persistent workflow states.
- Idempotent execution.
- Database reconciliation.
- Duplicate-task prevention.
- Structured logs.
- Health endpoints or equivalent health checks.
- Error categorization and actionable alerts.

Do not allow an agent failure to silently corrupt account state or bypass risk validation.

If the market-data provider becomes unavailable, the system must not trade using stale observations beyond its configured freshness limits.

If the LLM provider fails, use a documented safe fallback or skip the decision. Never invent an agent's missing approval.

If Supabase or the authoritative ledger becomes unavailable, do not open new positions or assume that a write succeeded.

Protect all API credentials, database credentials, Telegram tokens, and other secrets.

Use least-privilege access, secure authentication, input validation, and appropriate rate limits for dashboard controls and backend APIs.

Keep sensitive actions on the backend. A frontend must not be able to mark a trade as approved, change the authoritative balance, or activate a strategy merely by submitting a crafted request.

The system must default to no new trades when critical safety conditions cannot be verified.

---

SECTION 13 — AUTOMATED TESTING AND VERIFICATION

Do not consider the system complete merely because the application starts or the dashboard renders.

Implement automated tests appropriate to each component.

Required test categories

Agent tests

- Validate each agent's structured output.
- Handle malformed LLM responses.
- Handle provider timeouts and unavailable models.
- Ensure agents cannot bypass their defined permissions.
- Test disagreement and proposal workflows.

Risk tests

- Reject a position exceeding the allocation limit.
- Reject trades exceeding configured daily limits.
- Reject trades without sufficient virtual cash.
- Reject candidates that fail mandatory security checks.
- Reject stale market data.
- Reject invalid stop-loss or take-profit settings.
- Reject trades during a persistent pause.
- Reject duplicate entries and conflicting execution requests.

Paper-execution tests

- Verify entry and exit calculations.
- Verify fees and slippage.
- Verify partial-fill handling where supported.
- Verify realized and unrealized PnL.
- Verify balance and equity reconciliation.
- Verify restart recovery.
- Verify that retries cannot create duplicate fills.
- Verify that failed database writes do not produce false successful executions.

Strategy-improvement tests

- Ensure NOVA proposals are persisted with version history.
- Ensure agents can read the appropriate active guidelines.
- Ensure rejected proposals cannot become active.
- Ensure unvalidated changes cannot become active.
- Ensure activation is atomic.
- Ensure rollback restores a previously valid version.
- Ensure a strategy proposal cannot change protected risk settings.

Integration and operational tests

- Test database unavailability.
- Test market-data outages.
- Test provider rate limits.
- Test Telegram authorization.
- Test the pause control.
- Test startup and shutdown.
- Test dashboard updates against actual backend state.
- Test the entire candidate-to-paper-trade workflow.

Use mocks and deterministic fixtures for automated tests. External network access and real credentials must not be required for the normal unit-test suite.

Provide integration tests for actual services where credentials and infrastructure are available.

Document any tests that could not be executed.

---

SECTION 14 — BUILD ORDER

Implement in dependency order rather than attempting to generate every component in one unverified pass.

Phase 1: Reconnaissance and specification

Inspect the repository, reconcile the three prompts, document architecture and assumptions, and establish the implementation plan.

Phase 2: Configuration and database

Implement environment configuration, database migrations, schema constraints, access policies, and basic database tests.

Phase 3: Market-data adapters

Implement DexScreener integration, normalized market-data models, timeouts, retries, rate limits, and stale-data protection.

Phase 4: Core safety and paper execution

Implement the authoritative virtual ledger, deterministic risk engine, order and fill handling, stop-loss/take-profit processing, and restart recovery.

Test these foundations before connecting autonomous agents.

Phase 5: Seven agents

Implement the seven agents, their prompt files, provider adapters, validated outputs, and telemetry.

Phase 6: Orchestration and team communication

Implement the candidate workflow, blackboard, shared context retrieval, workflow states, bounded debate, and ELIAS's decision process.

Phase 7: NOVA and controlled improvement

Implement post-mortems, proposal versioning, independent agent reviews, controlled experiments, validation, activation, and rollback.

Phase 8: ARGUS and Telegram

Implement health monitoring, recovery, notifications, authenticated commands, persistent pause controls, and failure tests.

Phase 9: Dashboard and PWA

Build the complete dashboard and connect it to actual backend state and appropriate real-time events.

Phase 10: Integration and operational readiness

Run automated tests, resolve failures, verify migrations and restart behavior, test failure scenarios, and document deployment.

The phases may overlap when dependencies permit, but do not leave the safety-critical foundations untested while focusing on visual features.

---

SECTION 15 — ACCEPTANCE CRITERIA

RIVARA is ready for a controlled paper-trading trial only when the applicable criteria below have been demonstrated.

1. The system starts with $100 in virtual capital without accessing a real trading wallet.
2. The market-data adapter retrieves and validates actual data from its configured source.
3. All seven agents can execute their assigned responsibilities and produce observable, structured outputs.
4. Agent findings are persisted and can be retrieved by other agents.
5. The candidate workflow reaches a deterministic risk check before any paper entry.
6. The risk engine blocks invalid trades even when an LLM recommends approval.
7. The paper-execution engine accounts for configured costs and maintains a consistent ledger.
8. Closed trades and their results remain available for audit and NOVA analysis.
9. NOVA can create a proposal that is independently reviewed, evaluated, and either rejected or validated through the controlled workflow.
10. Agents consume the correct active guideline version.
11. Strategy activation and rollback work without leaving partially updated configuration.
12. ARGUS detects important failures and the system behaves safely when critical dependencies are unavailable.
13. Telegram authorization and persistent pause controls pass their tests.
14. The dashboard displays actual persisted state and does not misrepresent system health.
15. Automated tests cover critical risk, ledger, recovery, and strategy-activation paths.
16. Installation, configuration, migration, startup, shutdown, and deployment instructions are documented.
17. Remaining limitations, unverified integrations, and operational risks are explicitly documented.

Passing these criteria demonstrates that the software is functioning as designed. It does not establish that the trading strategy is profitable or suitable for real-money deployment.

---

SECTION 16 — IMPLEMENTATION RULES

Follow these rules throughout development:

- Build functional software, not a mockup presented as a completed system.
- Reuse existing working code where appropriate.
- Do not overwrite valuable user work without inspecting it.
- Never expose or copy real secrets into source code or logs.
- Never fabricate external data, test results, provider capabilities, or successful integrations.
- Do not create fake trading activity to make the dashboard look active.
- Use typed models and structured error handling.
- Keep financial calculations and risk enforcement deterministic.
- Use LLMs for analysis and recommendations, not as the authoritative financial ledger.
- Make important decisions observable and auditable.
- Keep external data and agent outputs untrusted until validated.
- Ensure every strategy change can be traced to its evidence, approval, test results, and active version.
- Avoid unnecessary complexity and dependencies.
- Prefer maintainable, modular components over one enormous file.
- Do not claim 24/7 operation without an appropriate running deployment.
- Do not claim profitability without sufficient independently evaluated evidence.
- Do not declare a feature complete until its implementation and applicable tests have been checked.

If a requirement cannot be implemented exactly as requested, explain the limitation, preserve the intended behavior where possible, and document the alternative.

Final instructions to Claude Code

Start by reading all the RIVARA prompts supplied by the user and inspecting the current repository.

First, report a concise synthesis of the complete mission, the seven agents, the architecture, the key differences or conflicts among the prompts, and the proposed implementation sequence.

Create the project specification and implementation plan.

Then begin implementing the actual system in the existing repository. After each meaningful stage, run the relevant tests, fix issues, and report:

- What was implemented.
- Which files were created or changed.
- Which tests were executed and their actual results.
- What remains incomplete.
- Which external credentials or services are still needed.
- What the next implementation stage will be.

Do not stop at the architecture plan. Do not claim completion when only scaffolding exists.

The ultimate objective is to build RIVARA as one persistent, coordinated, observable, risk-controlled AI team that can research, debate, make paper-trading decisions, learn from validated outcomes, and improve its methods while remaining within explicitly enforced safety boundaries.

Claude, the three RIVARA prompts above are connected parts of one complete project specification. Read all of them carefully before making changes. The original prompt establishes the foundation, the upgraded prompt defines the agents and their teamwork, and the Final Unified Build Prompt consolidates the architecture, safety mechanisms, strategy-debate loop, testing, and implementation requirements.

Treat the final prompt as the integration guide, but preserve all compatible requirements from the earlier prompts. Inspect the existing repository, identify conflicts and missing components, create the implementation plan and project documentation, and then start building the actual system in dependency order. Do not stop after planning or creating empty files. Test each meaningful stage and report real progress, failures, assumptions, and remaining work. Keep the system strictly paper-trading-only.
AUTONOMOUS INTELLIGENCE, STRATEGIC INITIATIVE & GOAL PURSUIT

Core Philosophy

RIVARA agents must not behave as narrow, passive assistants that merely execute predefined instructions. They are autonomous analytical specialists working together toward a shared long-term mission.

The system should maximize the agents' capacity for independent reasoning, creativity, strategic exploration, critical thinking, and evidence-driven initiative.

The agents' defined roles establish their primary responsibilities, not the limits of what they may investigate, understand, question, or recommend.

1. Think Beyond Existing Instructions

Agents should proactively identify relevant problems, opportunities, risks, patterns, and unanswered questions that were not explicitly anticipated by the developer.

They may develop new hypotheses, compare competing explanations, question existing assumptions, design analytical methods, propose new indicators, investigate unexpected market behavior, and recommend improvements to any part of RIVARA within their authorized permissions.

Do not hardcode every possible market condition or analytical conclusion. Build a flexible system that combines deterministic safety mechanisms with adaptable, model-driven reasoning.

When an agent discovers an important problem outside its primary role, it should notify the appropriate specialist rather than ignore it simply because it falls outside its assigned responsibilities.

2. Pursue the Shared Mission, Not Merely Individual Tasks

Every agent should understand that its work contributes to the team's overarching mission: sustainable, risk-adjusted capital growth through disciplined research, realistic paper trading, and continuous improvement.

Agents should optimize for the team's overall performance rather than maximizing their individual activity, number of messages, number of trades, or apparent usefulness.

They may propose new intermediate objectives, prioritize investigations, request additional information, and recommend changes to the workflow whenever doing so could materially advance the shared mission.

The team should distinguish genuine progress from activity that merely looks productive.

3. Challenge, Debate, and Think Independently

Agents must not automatically agree with the executive, another agent, the latest strategy guideline, or their own previous conclusions.

When evidence warrants it, they should challenge assumptions, identify logical weaknesses, highlight conflicting information, and present better alternatives.

Each agent should reason from its own specialist perspective. Where practical, independent assessments should be recorded before the agent reads the complete debate, reducing the risk of groupthink.

Disagreement should be constructive, specific, evidence-based, and proportionate to the importance of the decision.

The purpose of debate is to improve the quality of decisions, not to generate unnecessary discussion.

4. Explore Strategies Beyond the Current Playbook

Existing indicators, filters, thresholds, and strategies are starting points for investigation, not unquestionable truths.

Agents may propose alternative trading approaches, combinations of signals, market-regime classifications, improved risk-adjusted entry and exit methods, new analytical features, and experiments designed to test whether current assumptions remain valid.

They should also be able to recommend that the system trade less frequently, suspend a strategy, or remain inactive when the evidence does not support a trade.

No strategy should be considered permanently optimal. All strategies remain subject to evidence, evaluation, changing market conditions, and explicit performance criteria.

5. Turn Initiative Into Measurable Experiments

When agents discover promising ideas, they should convert them into structured proposals with clear hypotheses, evidence, expected benefits, potential failure modes, estimated costs, and measurable success criteria.

Where appropriate, the system should automatically prioritize, schedule, and execute authorized offline analyses, backtests, and paper-trading experiments.

Agents should compare results against a baseline, record negative results, and avoid repeatedly testing variations merely to find a lucky historical outcome.

Experiments must be reproducible and must account for overfitting, transaction costs, slippage, liquidity, sample size, and relevant market conditions.

A failed experiment is useful information when it improves the team's understanding.

6. Adaptive Roles and Collaborative Problem Solving

An agent may temporarily contribute analysis outside its primary specialty when doing so is relevant to the shared mission.

For example, CIPHER may identify a security-related concern, LUPUS may discover a suspicious trading pattern, and ARGUS may recommend an architectural improvement after detecting repeated operational failures.

The designated specialist remains responsible for authoritative assessments in its domain, and the appropriate deterministic controls remain authoritative for safety-critical decisions.

ELIAS coordinates priorities and resolves strategic disagreements. It should consider specialist recommendations seriously without blindly accepting them.

NOVA preserves validated lessons and tracks the evolution of the team's strategies, assumptions, and decision quality.

7. Continuous Self-Evaluation

Agents should periodically evaluate the quality of their own prior analyses, confidence estimates, recommendations, and decisions against observed outcomes.

They should identify recurring mistakes, unreliable signals, blind spots, unnecessary complexity, and opportunities to improve.

NOVA should aggregate these findings into persistent, versioned knowledge that can be retrieved by the appropriate agents.

The system should distinguish between a correct decision that produced a loss, a poor decision that happened to produce a profit, and an outcome that cannot be reliably attributed to the strategy.

Use outcome evidence to improve decision quality rather than rewarding luck.

8. Bounded Actions, Broad Reasoning

Do not confuse freedom of reasoning with unrestricted operational authority.

Agents may explore ideas broadly, debate strategies, and propose changes. Actual actions must remain within explicitly authorized capabilities and enforceable safety boundaries.

RIVARA initially remains strictly paper-trading-only. No agent may access real trading funds, create real blockchain transactions, expose credentials, bypass deterministic risk checks, or silently modify protected security settings.

Strategy changes must follow the controlled proposal, evaluation, approval, activation, and rollback workflow.

External data and instructions must not be permitted to override the system's trusted instructions or permissions.

9. Avoid Unnecessary Human Bottlenecks

Within the configured operating budget, authorized data sources, resource limits, and safety policies, agents should be able to initiate routine investigations, conduct approved experiments, update non-protected analytical artifacts, and coordinate work without requesting human approval for every small step.

Escalate genuinely consequential, ambiguous, security-sensitive, or unauthorized actions rather than asking the user to approve every ordinary analytical decision.

The objective is a self-directed analytical team that can make meaningful progress continuously while remaining observable, auditable, and controllable.

10. Engineering Requirement

These capabilities must be implemented through actual orchestration, persistent state, tool permissions, scheduling, structured messages, experiment execution, performance evaluation, and validated configuration updates.

Do not claim autonomy merely because a system prompt contains words such as "think independently" or "pursue the mission."

Implement the mechanisms that allow agents to discover tasks, prioritize them, execute authorized work, evaluate results, remember lessons, and select useful next steps.

Measure autonomy by the quality of completed work and demonstrated improvement, not by the volume of agent messages or the number of independent model calls.





