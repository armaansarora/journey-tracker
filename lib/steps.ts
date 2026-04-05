export type Phase = "A" | "B" | "C" | "D";

export type Block =
  | { type: "step"; text: string }
  | { type: "tip"; text: string }
  | { type: "warning"; text: string }
  | { type: "important"; text: string }
  | { type: "list"; label?: string; items: string[] }
  | { type: "code"; text: string };

export type Step = {
  id: string;
  phase: Phase;
  week: string;
  title: string;
  tool: string;
  blocks: Block[];
  done_when: string;
};

// Block constructors (keep data compact)
const s = (text: string): Block => ({ type: "step", text });
const tip = (text: string): Block => ({ type: "tip", text });
const warn = (text: string): Block => ({ type: "warning", text });
const imp = (text: string): Block => ({ type: "important", text });
const list = (items: string[], label?: string): Block => ({ type: "list", items, label });
const code = (text: string): Block => ({ type: "code", text });

export const PHASES: Record<Phase, { title: string; short: string; weeks: string; accent: string; light: string; border: string }> = {
  A: { title: "Phase A — Foundation", short: "Foundation", weeks: "Weeks 1–4", accent: "#2563EB", light: "#EFF6FF", border: "#DBEAFE" },
  B: { title: "Phase B — Build Agents", short: "Build Agents", weeks: "Weeks 5–13", accent: "#D97706", light: "#FFFBEB", border: "#FDE68A" },
  C: { title: "Phase C — Dashboard", short: "Dashboard", weeks: "Weeks 11–20", accent: "#059669", light: "#ECFDF5", border: "#A7F3D0" },
  D: { title: "Phase D — WhatsApp", short: "WhatsApp", weeks: "Later", accent: "#6B7280", light: "#F9FAFB", border: "#E5E7EB" },
};

export const STEPS: Step[] = [
  {
    id: "a1", phase: "A", week: "Week 1", title: "Buy Google Workspace Business Standard", tool: "Browser",
    blocks: [
      s("**Go to** `workspace.google.com`"),
      s("**Purchase Business Standard** for 3 users: Selim (operations partner), Najat (tenant communication partner), and Armaan (you)"),
      s("**Set up the company domain** — use an existing one or register a new one during signup"),
      tip("$14 per user/month = $42/month total. Includes Gmail, Drive, and Calendar under one admin console with enterprise controls."),
    ],
    done_when: "All 3 users can log in to Gmail and Google Drive with their company accounts.",
  },
  {
    id: "a2", phase: "A", week: "Week 1", title: "Create Google Shared Drive", tool: "Google Admin Console",
    blocks: [
      s("**In the Google Admin Console**, navigate to `Apps → Google Workspace → Drive and Docs → Sharing settings`"),
      s("**Enable Shared Drives** for your organization"),
      s("**Open Google Drive** and create a new Shared Drive named `Journey Realty Group`"),
      s("**Add Selim, Najat, and yourself** as managers"),
      tip("Shared Drives are company-owned — unlike personal My Drive folders, files persist even when someone leaves the company."),
    ],
    done_when: "All 3 users see \"Journey Realty Group\" in their Google Drive left sidebar under Shared Drives.",
  },
  {
    id: "a3", phase: "A", week: "Week 1", title: "Set up Google Cloud service account with Domain-Wide Delegation", tool: "Google Cloud Console",
    blocks: [
      s("**Go to** `console.cloud.google.com`"),
      s("**Create a new project** named `Journey Agent`"),
      list(["Google Drive API", "Gmail API", "Google Calendar API"], "Enable these three APIs:"),
      s("**Navigate to** `IAM & Admin → Service Accounts → Create Service Account`"),
      s("**Create a JSON key** — open the service account's Keys tab → Add Key → JSON → download and save securely"),
      s("**Enable Domain-Wide Delegation** on the service account"),
      s("**In the Admin Console** (`admin.google.com`), go to `Security → API Controls → Domain-wide Delegation` and add the service account's client ID"),
      list([
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/gmail.modify",
        "https://www.googleapis.com/auth/calendar.events",
      ], "Required OAuth scopes:"),
      tip("This is what lets the AI agent access Google services 24/7 without any human logging in."),
    ],
    done_when: "You can run a Python script using the service account JSON key that successfully lists files in the Google Shared Drive.",
  },
  {
    id: "a4", phase: "A", week: "Week 1", title: "Set up Google Cloud Pub/Sub for Gmail notifications", tool: "Google Cloud Console",
    blocks: [
      s("**In your Google Cloud project**, open Pub/Sub"),
      s("**Create a new topic** named `gmail-notifications`"),
      s("**Create a subscription** on that topic — pull type for now, push later when the server is ready"),
      s("**Grant Publisher role** to `gmail-api-push@system.gserviceaccount.com` on your topic"),
      s("**Call Gmail's** `watch()` **method** to register your topic"),
      tip("This tells Gmail to push a notification the moment a new email arrives — no polling required."),
    ],
    done_when: "You send a test email to one of the Google Workspace accounts and a notification message appears in your Pub/Sub subscription within seconds.",
  },
  {
    id: "a5", phase: "A", week: "Week 1", title: "Download OneDrive files and start organizing", tool: "Claude Code",
    blocks: [
      s("**Download** the ~266 MB of files from Selim's OneDrive to a single folder on your MacBook"),
      s("**Open Claude Code** and have it sort every file into the designed folder structure"),
      code("01_Properties/Brooklyn/The-Evergreen-Bushwick/01_Master-Lease/"),
      s("**Use numbered folders** (01–06) for property-level docs and `Unit-3A`, `Unit-3B` style for tenant files"),
      s("**Rename every file** to the convention `YYYY-MM-DD Description v1`"),
      warn("Never use \"final\", \"new\", or \"latest\" in filenames — always version numbers."),
      tip("If you're unsure where a file goes, put it in a \"To-Sort\" pile and ask Selim."),
    ],
    done_when: "Every file is in the correct folder with the correct name following the YYYY-MM-DD Description v# convention.",
  },
  {
    id: "a6", phase: "A", week: "Week 2", title: "Upload organized files to Google Shared Drive", tool: "Claude Code or rclone",
    blocks: [
      s("**Upload the organized folder structure** to the `Journey Realty Group` Shared Drive"),
      s("**Create** `Inbox-To-Sort` **at the root** — this is where Selim and Najat drop files going forward; the AI agent files them automatically"),
      s("**Write a short rules document** (one page) explaining the folder structure and naming convention; place it at the root of the Drive"),
    ],
    done_when: "Selim can open Google Drive, navigate the folder structure, and find any specific file in under 10 seconds.",
  },
  {
    id: "a7", phase: "A", week: "Week 2", title: "Walk Selim through the new folder structure", tool: "Screen share or in person",
    blocks: [
      s("**Sit down with Selim** (or screen share) and walk through the complete folder structure"),
      s("**Show him** where properties, vendors, and leases live"),
      s("**Demo the** `Inbox-To-Sort` **folder**: \"Just drop everything here. Don't worry about naming or organizing. The AI will handle it.\""),
      s("**Get honest feedback** — if a folder should be named or structured differently, adjust"),
      imp("This is a people step, not a tech step. His buy-in is critical. If he doesn't trust the system, he won't use it."),
    ],
    done_when: "Selim says \"I get it,\" successfully drops a test file in Inbox-To-Sort, and doesn't have questions about where things live.",
  },
  {
    id: "a8", phase: "A", week: "Week 2", title: "Provision Hetzner CX41 VPS", tool: "Hetzner Cloud Console",
    blocks: [
      s("**Go to** `console.hetzner.cloud` and create an account"),
      s("**Click \"Add Server\"**"),
      list([
        "Location: Falkenstein or Nuremberg (cheapest EU data centers)",
        "Type: CX41 — 8 vCPU, 16 GB RAM, 160 GB NVMe SSD",
        "Image: Ubuntu 24.04",
        "Cost: ~$16/month",
      ], "Config:"),
      s("**Add your public SSH key** during creation — run `ssh-keygen` on your Mac first if you don't have one"),
      s("**Click Create** — server is ready in ~60 seconds"),
    ],
    done_when: "You can run \"ssh root@your-server-ip\" from your terminal and land in a shell.",
  },
  {
    id: "a9", phase: "A", week: "Week 2", title: "Harden VPS security + install Coolify", tool: "SSH Terminal",
    blocks: [
      s("**SSH in and create a non-root user:** `adduser armaan && usermod -aG sudo armaan`"),
      s("**Copy your SSH key** to the new user"),
      s("**Edit** `/etc/ssh/sshd_config`: set `PermitRootLogin no`, `PasswordAuthentication no`, `Port 2222`, then restart SSH"),
      s("**Configure the UFW firewall:**"),
      code("ufw allow 2222/tcp\nufw allow 80/tcp\nufw allow 443/tcp\nufw enable"),
      s("**Log out and verify** you can SSH in as the new user on port 2222 before continuing"),
      s("**Install Coolify:**"),
      code("curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash"),
      tip("Coolify is a self-hosted platform that manages Docker containers, SSL certificates, and deployments through a web dashboard. Install takes ~5 minutes."),
    ],
    done_when: "Coolify dashboard loads at your-server-ip:8000, and SSH only works on port 2222 with your key (not root, not password).",
  },
  {
    id: "a10", phase: "A", week: "Week 3", title: "Set up Git repo + Docker Compose + deploy via Coolify", tool: "GitHub + Coolify",
    blocks: [
      s("**Create a private GitHub repository** for the agent project"),
      s("**Add** `docker-compose.yml` **defining all 10 services:**"),
      list([
        "PostgreSQL 16 (with pgvector + Apache AGE extensions)",
        "Redis (LiteLLM caching + Langfuse)",
        "ClickHouse (Langfuse analytics)",
        "MinIO (Langfuse blob storage)",
        "Langfuse web + worker containers",
        "LiteLLM proxy",
        "LightRAG server",
        "n8n (for prototyping)",
        "Journey Agent App",
      ]),
      s("**In Coolify's dashboard**, add your GitHub repo as a new resource"),
      s("**Enable auto-deploy** on push to the `main` branch"),
    ],
    done_when: "You push to GitHub, Coolify automatically builds and starts all containers, and all 10 show \"healthy\" in the Coolify dashboard.",
  },
  {
    id: "a11", phase: "A", week: "Week 3", title: "Configure LiteLLM with model routing", tool: "config/litellm_config.yaml",
    blocks: [
      s("**Create** `config/litellm_config.yaml` **defining your model routing**"),
      list([
        "Anthropic: `claude-sonnet-4-6` (default), `claude-opus-4-6` (complex reasoning, used rarely)",
        "OpenAI: `gpt-5.4` (fallback if Anthropic is down)",
        "Google: `gemini-2.5-flash` (second fallback)",
      ], "Providers:"),
      s("**Enable prompt caching** with a 1-hour TTL"),
      s("**Enable spend tracking** to PostgreSQL — every API call logged with cost"),
      tip("Prompt caching is critical for the filing agent's 20-min heartbeat — it keeps the system prompt warm between runs."),
    ],
    done_when: "You can POST to http://litellm:4000/chat/completions and get a Sonnet 4.6 response, with cost logged in LiteLLM's spend table.",
  },
  {
    id: "a12", phase: "A", week: "Week 3", title: "Verify Langfuse tracing works", tool: "Browser",
    blocks: [
      s("**Open** `langfuse.yourdomain.com` — SSL handled by Coolify's Traefik"),
      s("**Create an account** on your self-hosted Langfuse"),
      s("**Generate API keys**"),
      s("**Add the Langfuse callback** to your LiteLLM config"),
      s("**Send a test LLM request** through LiteLLM"),
      s("**Verify a trace appears** showing model, tokens, latency, and cost"),
      tip("If ClickHouse eats too much RAM, swap to Langfuse Cloud's free tier (50K observations/month) by changing one env var."),
    ],
    done_when: "You can see a complete trace in Langfuse's web UI with model name, token count, latency, and cost breakdown.",
  },
  {
    id: "a13", phase: "A", week: "Week 3", title: "Point domain + set up SSL certificates", tool: "DNS provider + Coolify",
    blocks: [
      s("**Create DNS A records** pointing to your VPS IP:"),
      list([
        "`agent.yourdomain.com`",
        "`n8n.yourdomain.com`",
        "`langfuse.yourdomain.com`",
      ]),
      s("**In Coolify**, configure each service with its subdomain"),
      tip("Traefik handles Let's Encrypt SSL certificates and HTTPS redirects automatically — no manual certificate management."),
    ],
    done_when: "All three subdomains load in your browser over HTTPS with valid SSL certificates (green lock icon).",
  },
  {
    id: "a14", phase: "A", week: "Week 4", title: "Deploy LightRAG and ingest all Google Drive files", tool: "LightRAG + Python",
    blocks: [
      s("**Configure LightRAG** with PostgreSQL + pgvector backend (same instance, separate database)"),
      s("**Set embedding model** to `text-embedding-3-small` ($0.02/MTok)"),
      s("**Run Presidio PII scanner** on every file before ingesting"),
      list([
        "**Tier 1** (passports, SSNs, bank statements, tax returns) — BLOCKED from RAG entirely",
        "**Tier 2** (leases, rent rolls, contracts) — PII redacted, then ingested",
        "**Tier 3** (invoices, permits, drawings) — ingested directly",
        "**Tier 4** (marketing, photos) — unrestricted",
      ], "Document tiers:"),
      tip("Total cost to embed the full 266 MB corpus: approximately $0.50."),
    ],
    done_when: "You can ask LightRAG \"what does Jean's lease say about pets?\" and get a relevant, accurate answer.",
  },
  {
    id: "a15", phase: "A", week: "Week 4", title: "Configure Mem0 inside the Journey Agent App", tool: "Python",
    blocks: [
      s("**Install inside the main app container:** `pip install mem0ai`"),
      warn("Mem0 is NOT a separate Docker service. It's a Python library inside the Journey Agent App."),
      s("**Point it at the** `journey` **PostgreSQL database** with pgvector for vector storage"),
      list([
        "`user_id` — per-person memories (Selim's prefs, Najat's prefs, tenant facts)",
        "`agent_id` — per-agent learnings (filing patterns, email patterns)",
      ], "Memory scoping:"),
      s("**Test the full cycle:**"),
      code("memory.add(\"Selim prefers Apex for plumbing\", user_id=\"selim\")\nmemory.search(\"who does Selim like for plumbing?\", user_id=\"selim\")"),
    ],
    done_when: "You can store facts about Selim and Najat, retrieve them by semantic search, and verify Selim's memories don't appear when you search Najat's.",
  },
  {
    id: "a16", phase: "A", week: "Week 4", title: "Create Telegram bot + wire up webhook", tool: "Telegram BotFather + Python",
    blocks: [
      s("**Message** `@BotFather` **on Telegram**"),
      s("**Send** `/newbot` — pick a display name (e.g. \"Journey Agent\") and username (e.g. `journey_agent_bot`)"),
      s("**Save the API token** securely"),
      s("**Add a FastAPI endpoint** `POST /webhook` in the Journey Agent App"),
      s("**Register the webhook with Telegram:**"),
      code("POST https://api.telegram.org/bot{token}/setWebhook?url=https://agent.yourdomain.com/webhook"),
      s("**Add an auth guard** — whitelist Telegram user IDs (Selim, Najat, Armaan); reject everyone else"),
      s("**Use HTML parse mode** and enable arbitrary callback data for inline keyboards"),
      warn("Don't use MarkdownV2 — it requires escaping 18 special characters and will bite you."),
    ],
    done_when: "You send \"hello\" to the bot and it responds; messages from unauthorized users get rejected.",
  },
  {
    id: "a17", phase: "A", week: "Week 4", title: "Set up nightly backups to Backblaze B2", tool: "Cron + B2 CLI",
    blocks: [
      s("**Create a Backblaze B2 account** (free) and a storage bucket"),
      s("**Install the B2 CLI** on your VPS"),
      list([
        "`pg_dump` each of 4 databases (journey, litellm, langfuse, n8n), gzipped",
        "tar + compress the ClickHouse data directory",
        "Upload everything with a date-stamped prefix",
      ], "Backup script does:"),
      s("**Schedule via cron** at 3:00 AM daily"),
      s("**Retention:** keep 7 daily + 4 weekly backups, delete older ones"),
      imp("TEST THE RESTORE. Download yesterday's backup, spin up a temporary PostgreSQL container, restore the dump into it, verify the data. A backup you've never tested is not a backup."),
      tip("Cost: approximately $0.50/month."),
    ],
    done_when: "You can download yesterday's backup from B2, restore it to a fresh PostgreSQL instance, and verify all 4 databases contain the correct data.",
  },

  {
    id: "b18", phase: "B", week: "Weeks 5–7", title: "Prototype filing workflow in n8n", tool: "n8n",
    blocks: [
      s("**Open** `n8n.yourdomain.com`"),
      s("**Build this workflow visually using drag-and-drop:**"),
      list([
        "Schedule trigger (every 20 minutes)",
        "Google Drive node: list files in `Inbox-To-Sort`",
        "IF node: any new files?",
        "Download file → LLM node (via LiteLLM) for classification",
        "Determine destination folder + filename",
      ]),
      s("**Classification categories:** lease, receipt, invoice, permit, photo, contractor quote, tenant document"),
      s("**Identify the related property/vendor/tenant** for each file"),
      s("**Test with 10–15 real files** from Selim — receipts, invoices, leases, random docs"),
      tip("This is your sandbox — mistakes here are free and fast to fix. Iterate on the classification prompt until it gets most files right."),
    ],
    done_when: "Drop a receipt in Inbox-To-Sort and the n8n workflow identifies it as a receipt, determines its property, and shows the correct destination path.",
  },
  {
    id: "b19", phase: "B", week: "Weeks 5–7", title: "Convert n8n filing workflow to Python with Claude Code", tool: "Claude Code + GSD",
    blocks: [
      s("**Export your working n8n workflow** as a JSON file (n8n has an export button)"),
      s("**Open Claude Code** in a clean session (start with `/gsd` if GSD is installed)"),
      s("**Feed it the JSON** with the prompt: *\"Convert this n8n workflow to a Python module using LangGraph as the state graph framework.\"*"),
      list([
        "`FilingState` TypedDict — file_id, file_name, file_bytes, classification, property_match, destination_path, confidence, needs_approval, approval_response, extracted_metadata",
        "Nodes: fetch_file → classify_and_extract → query_memory → decide_destination → move_and_rename",
        "Conditional edges based on confidence score",
        "`RetryPolicy` on each node for transient API failures",
        "Wrapper pattern isolating sub-graph state from parent orchestrator",
      ], "Claude Code will produce:"),
    ],
    done_when: "The Python module can classify a document, determine the correct folder, and move it — with full LangGraph checkpointing to PostgreSQL so it survives crashes.",
  },
  {
    id: "b20", phase: "B", week: "Weeks 5–7", title: "Add Mem0 + LightRAG disambiguation to filing agent", tool: "Python",
    blocks: [
      s("**In the** `classify_and_extract` **node, add two knowledge queries:**"),
      s("**Query LightRAG (hybrid mode):** \"Which property or vendor does this file relate to?\" — pass file name + extracted text"),
      s("**Query Mem0:** \"What was {user_id} recently discussing?\" — checks if Selim mentioned a specific property recently"),
      list([
        "confidence > 0.8 → auto-file without asking",
        "confidence ≤ 0.8 → call `interrupt()`, ask via Telegram",
      ], "Decision rule:"),
      s("**On completion**, write to Mem0: *\"Filed Amazon receipt ($247) to The Evergreen on 2026-04-05\"*"),
      tip("If Selim was chatting about The Evergreen's kitchen reno yesterday, Mem0 tips the balance toward filing an Amazon receipt there."),
    ],
    done_when: "The agent correctly attributes an ambiguous receipt to The Evergreen because Mem0 knows Selim was discussing that property's renovation yesterday.",
  },
  {
    id: "b21", phase: "B", week: "Weeks 5–7", title: "Build the heartbeat scheduler for filing agent", tool: "APScheduler",
    blocks: [
      s("**Add** `AsyncIOScheduler` (APScheduler) **to** `main.py`"),
      s("**Every 20 minutes**, list Drive files in `Inbox-To-Sort` (zero LLM tokens — just one API call)"),
      s("**Compare against** a `processed_files` **table** in PostgreSQL to find genuinely new files"),
      s("**If no new files:** return immediately — total cost is 1 API call, 0 LLM invocations"),
      s("**If new files found:** invoke the filing agent graph with a unique `thread_id` per file"),
      list([
        "`max_instances=1` — prevents overlapping runs if a filing takes longer than 20 min",
        "`coalesce=True` — if server was down for an hour, run ONE catch-up check, not three",
        "`misfire_grace_time=60` — tolerate 60s of scheduling jitter",
      ], "Critical APScheduler settings:"),
    ],
    done_when: "You drop a file in Inbox-To-Sort, do nothing, and within 20 minutes the file is automatically classified, renamed, and filed.",
  },
  {
    id: "b22", phase: "B", week: "Weeks 5–7", title: "Build Telegram approval flow for uncertain filings", tool: "python-telegram-bot",
    blocks: [
      s("**When confidence < 0.8**, the graph calls `interrupt()` — LangGraph freezes mid-node and saves full state to PostgreSQL"),
      s("**Bot sends a Telegram message** with inline keyboard buttons (e.g. \"Is this for The Evergreen or Carroll House?\")"),
      s("**Use arbitrary callback data** — pass full Python dicts (thread_id, file_name, options); PTB stores them server-side, Telegram only sees a UUID"),
      warn("Telegram's native callback_data limit is 64 bytes. Arbitrary callback data bypasses this."),
      s("**On button click**, the graph wakes from exactly where it paused:"),
      code("graph.invoke(\n  Command(resume=selected_option),\n  config={\"configurable\": {\"thread_id\": thread_id}}\n)"),
      s("**Enable PostgresPersistence** so the callback data cache survives bot restarts"),
    ],
    done_when: "Selim taps a property button in Telegram and the file gets filed to the correct location — without typing anything.",
  },
  {
    id: "b23", phase: "B", week: "Weeks 5–7", title: "Shadow deploy the filing agent", tool: "Production VPS",
    blocks: [
      s("**Deploy to production in shadow mode** — agent processes real files but does NOT move or rename them"),
      s("**Log what it WOULD have done** (classification, destination, filename, confidence) to PostgreSQL"),
      s("**Send Selim a daily summary** asking if each would-be action was correct"),
      s("**Run for 7 full days** tracking accuracy = (correct classifications) / (total files)"),
      s("**Examine every mistake** — was it bad classification, wrong property, or naming error? Fix the prompt for each failure pattern"),
      imp("Goal: >90% accuracy before turning off shadow mode."),
    ],
    done_when: "Agent has processed a full week of real files in shadow mode with >90% accuracy, and Selim trusts its judgment.",
  },
  {
    id: "b24", phase: "B", week: "Weeks 7–9", title: "Build email agent (n8n → Python)", tool: "n8n → Claude Code",
    blocks: [
      s("**Same two-stage process** as the filing agent — prototype in n8n, then convert to Python"),
      list([
        "Gmail Pub/Sub trigger receives new-email notification",
        "Fetch email via Gmail API",
        "Classify sender (contractor, tenant, lawyer, vendor, spam)",
        "Pull context from Mem0 (past interactions) + LightRAG (contracts/docs)",
        "Draft response via LLM with all context",
        "Present draft for human approval",
      ], "n8n workflow:"),
      s("**Convert to a Python LangGraph module** with Claude Code"),
      list([
        "sender_email, sender_name, subject, body",
        "classification",
        "context_from_mem0, context_from_lightrag",
        "draft_response, approval_status, sent_at",
      ], "EmailState TypedDict fields:"),
    ],
    done_when: "An email from Apex Construction about an invoice arrives, and the agent drafts a contextually appropriate response referencing the correct project and contract terms.",
  },
  {
    id: "b25", phase: "B", week: "Weeks 7–9", title: "Build email approval flow in Telegram", tool: "python-telegram-bot",
    blocks: [
      s("**Send Selim a Telegram message** showing: sender, subject, brief summary, full draft reply, and three buttons"),
      list([
        "**[Approve]** — send through Gmail immediately",
        "**[Edit]** — bot asks \"What would you like to change?\"",
        "**[Reject]** — discard the draft",
      ], "Buttons:"),
      list([
        "**Tier 2** (routine acks like \"Thanks, received\") — send automatically, notify after the fact",
        "**Tier 3** (money, commitments, legal, new vendors) — MUST wait for explicit approval via `interrupt()`",
      ], "Tier routing:"),
      s("**Edit flow:** Selim types his correction in natural language → agent revises the draft → re-presents with fresh buttons"),
    ],
    done_when: "Selim receives a draft email notification in Telegram, taps [Approve], and the email sends through Gmail without him opening an email client.",
  },
  {
    id: "b26", phase: "B", week: "Weeks 9–11", title: "Build expense agent", tool: "Claude Code",
    blocks: [
      s("**Triggered by the filing agent** via the `task_queue` pattern — when filing classifies a file as a receipt or invoice:"),
      code("{\"agent\": \"expense\", \"data\": {file_id, classification, property_match}}"),
      s("**Supervisor node picks it up** and dispatches the expense agent next loop"),
      s("**LLM extracts structured data** from the receipt: vendor, date, line items (description + amount), tax, total, payment method"),
      s("**Log the expense** to a PostgreSQL `expenses` table tagged with the correct `property_id`"),
      s("**Cross-reference Mem0 + LightRAG** for property attribution and vendor contract consistency"),
    ],
    done_when: "Selim drops a receipt photo → filing files it to The Evergreen's Finances folder → expense agent logs $247 → Selim gets one Telegram notification confirming both actions.",
  },
  {
    id: "b27", phase: "B", week: "Weeks 9–11", title: "Build archive agent", tool: "Claude Code",
    blocks: [
      s("**Triggered by natural-language command** via the orchestrator (e.g. *\"Jean-Dupont is moving out of Unit 3A end of July\"*)"),
      list([
        "Look up tenant's files in LightRAG + Drive structure",
        "Create archive folder: `06_Archive/2026/The-Evergreen-Bushwick/Unit-3A/Jean-Dupont-Jan-Jul-2026/`",
        "Present full plan to Najat via Telegram",
        "WAIT for explicit approval (always Tier 3 — archiving is destructive)",
        "On approval: move files",
        "Update Mem0: *\"Jean-Dupont moved out 2026-07-31, unit is vacant\"*",
        "Notify Najat: archiving complete",
      ], "Agent steps:"),
      tip("Leave the security deposit resolution file in the active folder until the next tenant moves in."),
    ],
    done_when: "Telegram message → plan presented → Najat approves → files archived → Mem0 updated → confirmation sent.",
  },
  {
    id: "b28", phase: "B", week: "Weeks 9–11", title: "Build orchestrator supervisor graph", tool: "Claude Code",
    blocks: [
      s("**This is the parent LangGraph graph** that ties everything together"),
      list([
        "`messages` (add_messages reducer)",
        "`user_id`, `chat_id`, `current_agent`",
        "`task_queue` (append reducer)",
        "`agent_output`, `iteration_count`, `workflow_status`",
        "`audit_log` (append reducer)",
      ], "OrchestratorState TypedDict:"),
      s("**The** `supervisor_node` **classifies intents** and returns `Command(goto=\"filing_wrapper\")`, etc."),
      s("**Wrapper pattern**: each `_wrapper` node transforms orchestrator state → agent sub-state → back"),
      tip("The wrapper pattern prevents sub-graph state (file bytes, email HTML) from bloating parent checkpoints."),
      s("**`task_queue` enables cross-agent triggers**: filing detects receipt → appends `{\"agent\": \"expense\"}` → supervisor dispatches next loop"),
      warn("Add an iteration guard (max 10 loops) to prevent infinite delegation between agents."),
    ],
    done_when: "\"file this receipt\" → orchestrator → filing → expense → notification, all in one flow with a single Telegram confirmation.",
  },
  {
    id: "b29", phase: "B", week: "Weeks 11–13", title: "Build morning digest", tool: "APScheduler + Telegram",
    blocks: [
      s("**Per-user APScheduler job** that fires at 8:00 AM local time (configurable)"),
      list([
        "Pending approvals with inline buttons to act immediately",
        "Overnight agent activity summary (files filed, emails drafted)",
        "Property expense snapshot — this week's spending per property",
        "Upcoming lease expirations within 30 days",
      ], "Selim's digest:"),
      list([
        "Tenant communication summary",
        "Lease expirations",
        "Upcoming move-outs",
      ], "Najat's digest:"),
      s("**Skip logic:** if nothing is actionable, send a minimal *\"Good morning — all clear today\"*"),
      tip("Skip logic prevents notification fatigue — if the digest always fires, it stops being read."),
    ],
    done_when: "Selim wakes at 8 AM, checks Telegram, sees a useful overnight summary with buttons to approve pending items — without opening any other app.",
  },
  {
    id: "b30", phase: "B", week: "Weeks 11–13", title: "Security hardening", tool: "Python + PostgreSQL",
    blocks: [
      list([
        "`filing_agent_role` — write `files` + `audit_log`, no access to `credentials`",
        "`email_agent_role` — read `emails`, no access to `tenant_pii`",
      ], "Layer 1 — PostgreSQL roles per agent:"),
      list([
        "Each row: SHA-256(prev_row_hash + current_row_data)",
        "App role has INSERT-only permission (no UPDATE, no DELETE)",
        "Daily cron verifies chain integrity",
      ], "Layer 2 — Hash-chain audit log:"),
      s("**Layer 3 — LLM Guard at proxy boundary**: scans every prompt + response for PII leakage"),
      s("**Layer 4 — PII scanner validation**: run Presidio on 50+ test docs, precision >85%, recall >95%"),
      s("**Layer 5 — Prompt injection testing**: 5 attack attempts per agent, verify all are blocked"),
      s("**Kill switch**: `/admin emergency` disables all agents and locks Inbox-To-Sort within 60 seconds"),
      imp("An audit log you can edit is not an audit log. The app's database role must have INSERT-only permission."),
    ],
    done_when: "Audit log tamper-proof, PII scanner catches SSNs with >95% recall, injection attempts blocked across all agents, kill switch works in <60s.",
  },
  {
    id: "b31", phase: "B", week: "Weeks 11–13", title: "Full production launch", tool: "Everything",
    blocks: [
      s("**Turn off shadow mode for all agents** — they now act for real"),
      list([
        "Move and rename files",
        "Send approved emails through Gmail",
        "Log real expenses to PostgreSQL",
        "Move real tenant files on archive",
      ], "Agents will:"),
      s("**Monitor intensively for week 1** via Langfuse traces — every LLM call, every decision, every tool invocation"),
      s("**Have Selim and Najat report** anything that looks wrong — bad classification, bad draft, incorrect amount"),
      s("**Fix issues via Git → Coolify auto-deploy** (30-90s downtime; LangGraph checkpointing resumes in-flight tasks)"),
      tip("After one clean week with no major issues, the system is officially live."),
    ],
    done_when: "All agents have run a full week handling real operations, with no human intervention beyond normal Tier 3 approvals. Selim and Najat confirm they're comfortable.",
  },

  {
    id: "c32", phase: "C", week: "Weeks 11–13", title: "Set up Next.js dashboard + deploy to Vercel", tool: "Claude Code",
    blocks: [
      s("**Start from a Next.js 15 admin template** with shadcn/ui + Prisma + Auth.js pre-configured"),
      s("**Add Tremor** for data visualization"),
      s("**Configure Prisma** to connect to the `journey` PostgreSQL DB on the Hetzner VPS"),
      s("**Implement Google OAuth** via Auth.js"),
      list([
        "**admin** (Armaan) — everything including system settings + costs",
        "**operator** (Selim) — expenses, vendors, files, approvals, activity",
        "**communications** (Najat) — tenants, properties, approvals, activity",
      ], "RBAC roles:"),
      s("**Bottom tab navigation** — 5 tabs: Home, Approvals, Properties, Search, More"),
      tip("Bottom tabs get 65% higher daily usage than hamburger menus on mobile."),
      s("**Deploy to Vercel's free tier** — dashboard runs on Vercel (zero VPS RAM), connects to Hetzner backend via API"),
    ],
    done_when: "Authenticated dashboard loads at dashboard.yourdomain.com, Selim and Najat log in via Google, bottom tab nav works on mobile.",
  },
  {
    id: "c33", phase: "C", week: "Weeks 14–17", title: "Build Dashboard V1: activity feed, approvals, expenses, tenants", tool: "Next.js + shadcn/ui",
    blocks: [
      list([
        "Real-time SSE timeline of all agent actions",
        "Shows: agent name, action summary, timestamp, affected property/person",
        "Filterable by agent type, property, date range",
      ], "Activity Feed:"),
      list([
        "Cards for each Tier 3 action awaiting a decision",
        "Approve / Edit / Reject buttons trigger the same `Command(resume=...)` the Telegram bot uses",
      ], "Pending Approvals:"),
      list([
        "BarChart — monthly spend by property",
        "DonutChart — category breakdown",
        "KPI cards — total spend, MoM change, largest expense",
      ], "Expense Dashboard (Tremor):"),
      list([
        "Card view on mobile — name, unit, lease end, status, tap to expand",
        "Table view on desktop — sortable columns + search",
      ], "Tenant Directory:"),
      imp("Mobile-first. Minimum 44px touch targets on ALL interactive elements."),
    ],
    done_when: "Selim can check activity, approve an email, see this month's Evergreen spend, and look up a tenant's lease end date — all from his phone.",
  },
  {
    id: "c34", phase: "C", week: "Weeks 18–20", title: "Build remaining 8 dashboard sections + PWA", tool: "Next.js",
    blocks: [
      list([
        "Vendor directory — W-9 + insurance badges, filter by trade",
        "Property overview — occupancy, expenses, renovation status",
        "File explorer — Drive tree + LightRAG search",
        "Knowledge search — Cmd+K, fans out to PostgreSQL + Mem0 + LightRAG, streaming results",
        "Agent status grid — running/paused/error, toggle switches",
        "Settings — behavior sliders, notifications, user management",
        "LLM costs — area chart + donut from Langfuse API",
        "Audit log — virtualized table, CSV/Excel export",
      ], "Sections:"),
      list([
        "PostgreSQL: <100ms",
        "Mem0: 200–500ms",
        "LightRAG: 3–8s",
      ], "Knowledge search latency:"),
      s("**Configure PWA** — web manifest + service worker for home-screen install"),
      tip("iOS supports PWA push notifications since 16.4."),
    ],
    done_when: "All 12 sections live, Najat searches \"when does Jean's lease end?\" and gets an answer, both partners have PWA installed, audit log exports a compliance report.",
  },
];

// Tool category → color mapping
export function toolCategory(tool: string): "cloud" | "code" | "terminal" | "browser" | "people" | "workflow" | "messaging" | "system" {
  const t = tool.toLowerCase();
  if (t.includes("cloud") || t.includes("hetzner") || t.includes("admin") || t.includes("dns") || t.includes("coolify") || t.includes("github")) return "cloud";
  if (t.includes("claude code") || t.includes("python") || t.includes("rclone") || t.includes("config/")) return "code";
  if (t.includes("ssh") || t.includes("terminal") || t.includes("cron")) return "terminal";
  if (t.includes("browser")) return "browser";
  if (t.includes("screen share") || t.includes("person")) return "people";
  if (t.includes("n8n") || t.includes("apscheduler") || t.includes("workflow")) return "workflow";
  if (t.includes("telegram") || t.includes("bot")) return "messaging";
  return "system";
}

export const TOOL_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  cloud: { color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
  code: { color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  terminal: { color: "#111827", bg: "#F3F4F6", border: "#D1D5DB" },
  browser: { color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
  people: { color: "#BE185D", bg: "#FDF2F8", border: "#FBCFE8" },
  workflow: { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  messaging: { color: "#0284C7", bg: "#F0F9FF", border: "#BAE6FD" },
  system: { color: "#475569", bg: "#F8FAFC", border: "#E2E8F0" },
};
