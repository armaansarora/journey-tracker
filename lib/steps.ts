export type Phase = "A" | "B" | "C" | "D";

export type Step = {
  id: string;
  phase: Phase;
  week: string;
  title: string;
  tool: string;
  details: string;
  done_when: string;
};

export const PHASES: Record<Phase, { title: string; short: string; weeks: string; accent: string; light: string; border: string }> = {
  A: { title: "Phase A — Foundation", short: "Foundation", weeks: "Weeks 1–4", accent: "#2563EB", light: "#EFF6FF", border: "#DBEAFE" },
  B: { title: "Phase B — Build Agents", short: "Build Agents", weeks: "Weeks 5–13", accent: "#D97706", light: "#FFFBEB", border: "#FDE68A" },
  C: { title: "Phase C — Dashboard", short: "Dashboard", weeks: "Weeks 11–20", accent: "#059669", light: "#ECFDF5", border: "#A7F3D0" },
  D: { title: "Phase D — WhatsApp", short: "WhatsApp", weeks: "Later", accent: "#6B7280", light: "#F9FAFB", border: "#E5E7EB" },
};

export const STEPS: Step[] = [
  {
    id: "a1", phase: "A", week: "Week 1", title: "Buy Google Workspace Business Standard", tool: "Browser",
    details: "Go to workspace.google.com. Purchase Business Standard plan for 3 users: Selim (operations partner), Najat (tenant communication partner), and Armaan (you). It costs $14 per user per month ($42/month total). This gives you Gmail, Google Drive, Google Calendar all under one company domain with enterprise admin controls. Use a company domain if you have one, or set one up.",
    done_when: "All 3 users can log in to Gmail and Google Drive with their company accounts.",
  },
  {
    id: "a2", phase: "A", week: "Week 1", title: "Create Google Shared Drive", tool: "Google Admin Console",
    details: "In the Google Admin Console, go to Apps → Google Workspace → Drive and Docs → Sharing settings and enable Shared Drives for your organization. Then go to Google Drive and create a new Shared Drive called \"Journey Realty Group.\" Shared Drives are company-owned — unlike personal My Drive folders, files in a Shared Drive persist even when someone leaves the company. Add Selim, Najat, and yourself as managers.",
    done_when: "All 3 users see \"Journey Realty Group\" in their Google Drive left sidebar under Shared Drives.",
  },
  {
    id: "a3", phase: "A", week: "Week 1", title: "Set up Google Cloud service account with Domain-Wide Delegation", tool: "Google Cloud Console",
    details: "Go to console.cloud.google.com. Create a new project (name it \"Journey Agent\"). Enable three APIs: Google Drive API, Gmail API, and Google Calendar API. Go to IAM & Admin → Service Accounts → Create Service Account. After creation, go to the service account's Keys tab and create a JSON key (download and save this securely). Then enable Domain-Wide Delegation on the service account. Finally, in the Google Admin Console (admin.google.com), go to Security → API Controls → Domain-wide Delegation and add the service account's client ID with these scopes: https://www.googleapis.com/auth/drive, https://www.googleapis.com/auth/gmail.modify, https://www.googleapis.com/auth/calendar.events. This is what lets the AI agent access Google services 24/7 without any human logging in.",
    done_when: "You can run a Python script using the service account JSON key that successfully lists files in the Google Shared Drive.",
  },
  {
    id: "a4", phase: "A", week: "Week 1", title: "Set up Google Cloud Pub/Sub for Gmail notifications", tool: "Google Cloud Console",
    details: "In the same Google Cloud project, go to Pub/Sub and create a new topic called \"gmail-notifications.\" Create a subscription on that topic (pull type for now, push later when the server is ready). Then grant the Gmail API service account (gmail-api-push@system.gserviceaccount.com) the Pub/Sub Publisher role on your topic. Finally, call the Gmail API's watch() method to register your topic — this tells Gmail to push a notification to your Pub/Sub topic every time a new email arrives, instead of you having to poll Gmail every few minutes.",
    done_when: "You send a test email to one of the Google Workspace accounts and a notification message appears in your Pub/Sub subscription within seconds.",
  },
  {
    id: "a5", phase: "A", week: "Week 1", title: "Download OneDrive files and start organizing", tool: "Claude Code",
    details: "Get the ~266 MB of files from Selim's OneDrive. Download everything to a single folder on your MacBook. Open Claude Code and use it to sort every file into the designed folder structure. The structure follows this pattern: 01_Properties/Brooklyn/The-Evergreen-Bushwick/01_Master-Lease/, with numbered folders (01 through 06) for property-level docs and Unit folders (Unit-3A, Unit-3B) for tenant files. Every file gets renamed to the naming convention: YYYY-MM-DD Description v1 (never use \"final,\" \"new,\" or \"latest\" — always version numbers). If you're unsure where a file goes, put it in a \"To-Sort\" pile and ask Selim.",
    done_when: "Every file is in the correct folder with the correct name following the YYYY-MM-DD Description v# convention.",
  },
  {
    id: "a6", phase: "A", week: "Week 2", title: "Upload organized files to Google Shared Drive", tool: "Claude Code or rclone",
    details: "Upload the entire organized folder structure to the Journey Realty Group Shared Drive. Create an \"Inbox-To-Sort\" folder at the root of the Shared Drive — this is where Selim and Najat will drop files going forward, and the AI agent will file them automatically. Write a short rules document (one page explaining the folder structure and naming convention) and place it at the root of the Drive so anyone can understand the system.",
    done_when: "Selim can open Google Drive, navigate the folder structure, and find any specific file (like \"The Evergreen master lease\" or \"Apex Construction's latest invoice\") in under 10 seconds.",
  },
  {
    id: "a7", phase: "A", week: "Week 2", title: "Walk Selim through the new folder structure", tool: "Screen share or in person",
    details: "This is a people step, not a tech step. Sit down with Selim (or screen share) and walk him through the complete folder structure. Show him where his properties live, where vendor files go, where to find leases. Most importantly, show him the Inbox-To-Sort folder and explain: \"Just drop everything here. Don't worry about naming or organizing. The AI will handle it.\" Get his honest feedback — if he thinks a folder should be named differently or structured differently, adjust. His buy-in is critical. If he doesn't trust the system, he won't use it.",
    done_when: "Selim says \"I get it,\" successfully drops a test file in Inbox-To-Sort, and doesn't have questions about where things live.",
  },
  {
    id: "a8", phase: "A", week: "Week 2", title: "Provision Hetzner CX41 VPS", tool: "Hetzner Cloud Console",
    details: "Go to console.hetzner.cloud and create an account. Click \"Add Server.\" Choose location: Falkenstein or Nuremberg (cheapest European data centers). Choose type: CX41 — this gives you 8 vCPU, 16 GB RAM, 160 GB NVMe SSD for ~$16/month. Choose image: Ubuntu 24.04. Under SSH Keys, add your public SSH key (if you don't have one, run ssh-keygen on your Mac first). Click Create. The server will be ready in about 60 seconds.",
    done_when: "You can run \"ssh root@your-server-ip\" from your terminal and land in a shell.",
  },
  {
    id: "a9", phase: "A", week: "Week 2", title: "Harden VPS security + install Coolify", tool: "SSH Terminal",
    details: "SSH into your new server. First, create a non-root user: adduser armaan, then usermod -aG sudo armaan. Copy your SSH key to the new user. Edit /etc/ssh/sshd_config: set PermitRootLogin no, PasswordAuthentication no, Port 2222, then restart SSH. Set up the firewall: ufw allow 2222/tcp (SSH), ufw allow 80/tcp (HTTP), ufw allow 443/tcp (HTTPS), ufw enable. Log out and verify you can SSH in as your new user on port 2222. Then install Coolify: curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash. This takes about 5 minutes. Coolify is a self-hosted platform that manages your Docker containers, SSL certificates, and deployments through a web dashboard.",
    done_when: "Coolify dashboard loads in your browser at your-server-ip:8000, and SSH only works on port 2222 with your key (not root, not password).",
  },
  {
    id: "a10", phase: "A", week: "Week 3", title: "Set up Git repo + Docker Compose + deploy via Coolify", tool: "GitHub + Coolify",
    details: "Create a private GitHub repository for the agent project. Add a docker-compose.yml file that defines all 10 services: PostgreSQL 16 (with pgvector and Apache AGE extensions), Redis (for LiteLLM caching and Langfuse), ClickHouse (for Langfuse analytics), MinIO (for Langfuse blob storage), Langfuse web and worker containers, LiteLLM proxy, LightRAG server, n8n (for prototyping), and the Journey Agent App itself. In Coolify's dashboard, add your GitHub repo as a new resource. Configure it to auto-deploy whenever you push to the main branch.",
    done_when: "You push to GitHub, Coolify automatically builds and starts all containers, and all 10 show \"healthy\" in the Coolify dashboard.",
  },
  {
    id: "a11", phase: "A", week: "Week 3", title: "Configure LiteLLM with model routing", tool: "config/litellm_config.yaml",
    details: "Create a LiteLLM configuration file that defines your model routing. Add your Anthropic API key with claude-sonnet-4-6 as the default model for all tasks, and claude-opus-4-6 available for complex multi-step reasoning (used rarely). Add your OpenAI API key with gpt-5.4 as a fallback if Anthropic is down. Add your Google API key with gemini-2.5-flash as a second fallback. Enable prompt caching with a 1-hour TTL (critical for the filing agent's 20-minute heartbeat — keeps the system prompt cached between runs). Enable spend tracking so every API call gets logged with its cost to PostgreSQL.",
    done_when: "You can send a request to http://litellm:4000/chat/completions and get a response back from Sonnet 4.6, and the cost appears in LiteLLM's spend logs.",
  },
  {
    id: "a12", phase: "A", week: "Week 3", title: "Verify Langfuse tracing works", tool: "Browser",
    details: "Open langfuse.yourdomain.com in your browser (Coolify should have set up SSL automatically). Create an account on your self-hosted Langfuse instance. Generate API keys. Configure LiteLLM to send traces to Langfuse (add the Langfuse callback in the LiteLLM config). Send a test LLM request through LiteLLM. Check that a trace appears in Langfuse showing: which model was used, how many tokens were consumed, the latency, and the cost. Langfuse is your window into everything the AI agents do — every LLM call, every decision, every cost. If Langfuse uses too much RAM (ClickHouse is hungry), you can swap to Langfuse Cloud's free tier (50K observations/month) by changing one environment variable.",
    done_when: "You can see a complete trace in Langfuse's web UI with model name, token count, latency, and cost breakdown.",
  },
  {
    id: "a13", phase: "A", week: "Week 3", title: "Point domain + set up SSL certificates", tool: "DNS provider + Coolify",
    details: "Go to your domain registrar (wherever you bought your domain) and create DNS A records pointing to your VPS IP address: agent.yourdomain.com, n8n.yourdomain.com, and langfuse.yourdomain.com. In Coolify, configure each service with its subdomain. Coolify's built-in Traefik reverse proxy handles Let's Encrypt SSL certificates automatically — you don't need to manually manage certificates. It also handles HTTPS redirect (HTTP → HTTPS).",
    done_when: "All three subdomains load in your browser over HTTPS with valid SSL certificates (green lock icon).",
  },
  {
    id: "a14", phase: "A", week: "Week 4", title: "Deploy LightRAG and ingest all Google Drive files", tool: "LightRAG + Python",
    details: "Configure the LightRAG container with the PostgreSQL + pgvector backend (same PostgreSQL instance, separate database). Set the embedding model to OpenAI text-embedding-3-small at $0.02 per million tokens. Before ingesting any documents, run the Presidio PII scanner on every file. Documents are classified into 4 tiers: Tier 1 (passports, SSNs, bank statements, tax returns) are BLOCKED from RAG entirely — they never get embedded. Tier 2 (leases, rent rolls, contracts) get PII redacted (SSNs replaced with [REDACTED], bank numbers stripped) then ingested. Tier 3 (invoices, permits, renovation drawings) go in directly. Tier 4 (marketing materials, photos) go in unrestricted. Total cost to embed the entire 266 MB corpus: approximately $0.50.",
    done_when: "You can query LightRAG with \"what does Jean's lease say about pets?\" or \"what permits were filed for The Evergreen?\" and get relevant, accurate answers.",
  },
  {
    id: "a15", phase: "A", week: "Week 4", title: "Configure Mem0 inside the Journey Agent App", tool: "Python",
    details: "Mem0 runs as a Python library inside the main Journey Agent App container — it's NOT a separate Docker service. Install it with pip install mem0ai. Configure it to use the same PostgreSQL instance (journey database) with pgvector for vector storage. Set up the memory scoping: user_id for per-person memories (Selim's preferences, Najat's preferences, tenant facts), and agent_id for per-agent learnings (filing agent's patterns, email agent's patterns). Test the full cycle: memory.add(\"Selim prefers Apex Construction for plumbing work\", user_id=\"selim\"), then memory.search(\"who does Selim like for plumbing?\", user_id=\"selim\") — it should return the stored fact.",
    done_when: "You can store facts about Selim and Najat, retrieve them by semantic search, and verify that Selim's memories don't appear when you search Najat's.",
  },
  {
    id: "a16", phase: "A", week: "Week 4", title: "Create Telegram bot + wire up webhook", tool: "Telegram BotFather + Python",
    details: "Open Telegram and message @BotFather. Send /newbot, choose a display name (like \"Journey Agent\"), and choose a username (like journey_agent_bot). BotFather gives you an API token — save this securely. In the Journey Agent App, create a FastAPI endpoint at POST /webhook that receives Telegram updates. Register your webhook URL with Telegram: POST https://api.telegram.org/bot{token}/setWebhook?url=https://agent.yourdomain.com/webhook. Set up the authentication guard: create a whitelist of authorized Telegram user IDs (Selim, Najat, Armaan) and reject messages from anyone else. Use HTML parse mode for message formatting (not MarkdownV2, which requires escaping 18 special characters). Enable python-telegram-bot's arbitrary callback data feature for inline keyboards.",
    done_when: "You send \"hello\" to the bot in Telegram and it responds with a greeting, and messages from unauthorized users get rejected.",
  },
  {
    id: "a17", phase: "A", week: "Week 4", title: "Set up nightly backups to Backblaze B2", tool: "Cron + B2 CLI",
    details: "Create a Backblaze B2 account (free) and a storage bucket. Install the B2 CLI on your VPS. Write a bash script that: (1) pg_dump each of the 4 PostgreSQL databases (journey, litellm, langfuse, n8n) to compressed files, (2) tar and compress the ClickHouse data directory, (3) upload everything to B2 with a date-stamped prefix. Schedule this script via cron to run at 3:00 AM daily. Set up retention: keep 7 daily backups and 4 weekly backups, delete older ones. Cost is approximately $0.50/month. CRITICAL: don't just set up backups — TEST THE RESTORE. Download yesterday's backup, spin up a temporary PostgreSQL container, restore the dump into it, and verify the data is intact. A backup you've never tested is not a backup.",
    done_when: "You can download yesterday's backup from B2, restore it to a fresh PostgreSQL instance, and verify all 4 databases contain the correct data.",
  },

  {
    id: "b18", phase: "B", week: "Weeks 5–7", title: "Prototype filing workflow in n8n", tool: "n8n",
    details: "Open n8n.yourdomain.com. Build the filing workflow visually using n8n's drag-and-drop interface: Start with a Schedule trigger (every 20 minutes). Add a Google Drive node that lists files in the Inbox-To-Sort folder. Add an IF node that checks if any new files exist. If yes: download the file, send its contents to an LLM node (via LiteLLM) with a prompt that classifies the document type (lease, receipt, invoice, permit, photo, contractor quote, tenant document) and identifies which property/vendor/tenant it relates to. Add logic to determine the correct destination folder and filename. Test with 10-15 real files from Selim — receipts, invoices, leases, random documents. Iterate on the classification prompt until it gets most files right. This is your sandbox — mistakes here are free and fast to fix.",
    done_when: "You can drop a receipt in Inbox-To-Sort and the n8n workflow correctly identifies it as a receipt, determines which property it belongs to, and shows the correct destination path.",
  },
  {
    id: "b19", phase: "B", week: "Weeks 5–7", title: "Convert n8n filing workflow to Python with Claude Code", tool: "Claude Code + GSD",
    details: "Export your working n8n workflow as a JSON file (n8n has an export button). Open Claude Code in a clean session. If you have the GSD framework installed, start with /gsd. Feed it the JSON file and say: \"Convert this n8n workflow to a Python module using LangGraph as the state graph framework.\" Claude Code will read the workflow logic and rewrite it as proper Python with: a FilingState TypedDict (fields: file_id, file_name, file_bytes, classification, property_match, destination_path, confidence, needs_approval, approval_response, extracted_metadata), node functions for each step (fetch_file, classify_and_extract, query_memory, decide_destination, move_and_rename), conditional edges based on confidence score, RetryPolicy on each node for handling transient API failures, and the wrapper pattern that isolates sub-graph state from the parent orchestrator.",
    done_when: "The Python module can take a file ID, classify the document, determine the correct folder, and move it — with full LangGraph checkpointing to PostgreSQL so it survives crashes.",
  },
  {
    id: "b20", phase: "B", week: "Weeks 5–7", title: "Add Mem0 + LightRAG disambiguation to filing agent", tool: "Python",
    details: "In the classify_and_extract node, add two knowledge queries. First, query LightRAG in hybrid mode: \"Which property or vendor does this file relate to?\" passing the file name and extracted text. LightRAG will search its knowledge graph of all your documents and return relevant matches. Second, query Mem0: \"What was {user_id} recently discussing?\" to check if Selim mentioned a specific property recently — this context helps disambiguate. For example, if Selim dropped an Amazon receipt and was chatting about The Evergreen's kitchen renovation yesterday, the Mem0 context tips the balance. If combined confidence is above 0.8: auto-file without asking. Below 0.8: call interrupt() which pauses the LangGraph execution and saves state to PostgreSQL. The Telegram bot then sends Selim a message asking for help. At completion (after filing), write the result to Mem0: \"Filed Amazon receipt ($247) to The Evergreen on 2026-04-05.\"",
    done_when: "The filing agent correctly attributes an ambiguous receipt to The Evergreen because Mem0 knows Selim was discussing that property's renovation yesterday.",
  },
  {
    id: "b21", phase: "B", week: "Weeks 5–7", title: "Build the heartbeat scheduler for filing agent", tool: "APScheduler",
    details: "In your main.py application entry point, add an APScheduler AsyncIOScheduler. Add a job that fires every 20 minutes: it calls the Google Drive API to list files in the Inbox-To-Sort folder (this API call costs zero LLM tokens). Compare the file list against a \"processed_files\" table in PostgreSQL to identify genuinely new files. If no new files: return immediately — total cost is one API call, zero LLM invocations. If new files found: for each new file, invoke the filing agent's LangGraph graph with a unique thread_id. Critical APScheduler settings: max_instances=1 (prevents overlapping runs if a filing takes longer than 20 minutes), coalesce=True (if the server was down for an hour, run ONE catch-up check, not three), misfire_grace_time=60 (tolerate 60 seconds of scheduling jitter).",
    done_when: "You drop a file in Inbox-To-Sort, do nothing, and within 20 minutes the file is automatically classified, renamed, and filed — or a Telegram message asks you for help.",
  },
  {
    id: "b22", phase: "B", week: "Weeks 5–7", title: "Build Telegram approval flow for uncertain filings", tool: "python-telegram-bot",
    details: "When the filing agent's confidence is below 0.8, it calls interrupt() which freezes the LangGraph execution mid-node and saves the complete state to PostgreSQL. Your Telegram bot code then constructs a message with inline keyboard buttons. Use python-telegram-bot's arbitrary callback data feature: instead of cramming data into Telegram's 64-byte callback_data limit, you pass a full Python dict (containing thread_id, file_name, options, etc.) and PTB stores it server-side, sending only a UUID to Telegram. When Selim taps a button, your callback handler retrieves the full dict, extracts the thread_id, and calls graph.invoke(Command(resume=selected_option), config={\"configurable\": {\"thread_id\": thread_id}}). The LangGraph graph wakes up from exactly where it paused, uses Selim's answer to set the destination, and finishes filing. Enable PostgresPersistence so the callback data cache survives bot restarts.",
    done_when: "The filing agent encounters an ambiguous file, sends Selim a Telegram message with property buttons, Selim taps one, and the file gets filed to the correct location — all without Selim typing anything.",
  },
  {
    id: "b23", phase: "B", week: "Weeks 5–7", title: "Shadow deploy the filing agent", tool: "Production VPS",
    details: "Deploy the filing agent to the production VPS but in \"shadow mode\" — it processes real files from the Inbox-To-Sort folder but does NOT actually move or rename them. Instead, it logs what it WOULD have done (classification, destination path, new filename, confidence score) to a PostgreSQL table and sends Selim a daily summary: \"Today I would have filed these 5 files. Here's where I would have put each one. Were these correct?\" Run this for a full week (7 days). Track accuracy: (correct classifications) / (total files processed). Examine every mistake — was it a bad classification, wrong property attribution, or naming error? Fix the prompts and logic for each failure pattern. The goal is >90% accuracy before turning off shadow mode.",
    done_when: "The filing agent has processed a full week of real files in shadow mode with >90% accuracy, and Selim has reviewed the results and says he trusts the agent's judgment.",
  },
  {
    id: "b24", phase: "B", week: "Weeks 7–9", title: "Build email agent (n8n → Python)", tool: "n8n → Claude Code",
    details: "Same two-stage process as the filing agent. In n8n, build the workflow: Gmail Pub/Sub trigger receives notification of new email → fetch the email via Gmail API → classify the sender (is this a contractor, tenant, lawyer, vendor, or spam?) → pull context from Mem0 (past interactions with this sender) and LightRAG (relevant contracts or documents) → draft a response using the LLM with all context → present the draft for human approval. Convert the working n8n workflow to a Python LangGraph module. The EmailState TypedDict includes: sender_email, sender_name, subject, body, classification, context_from_mem0, context_from_lightrag, draft_response, approval_status, sent_at.",
    done_when: "A real email from Apex Construction about an invoice arrives, and the agent drafts a contextually appropriate response that references the correct project and contract terms.",
  },
  {
    id: "b25", phase: "B", week: "Weeks 7–9", title: "Build email approval flow in Telegram", tool: "python-telegram-bot",
    details: "When the email agent drafts a response, send Selim a Telegram message showing: the sender name and subject line, a brief summary of the original email, the full draft reply, and three buttons: [Approve] [Edit] [Reject]. For Tier 2 actions (routine acknowledgments like \"Thanks, received\"), the agent can send automatically and just notify Selim after the fact. For Tier 3 actions (anything involving money, commitments, legal matters, or new vendors), the agent MUST wait for explicit approval via interrupt(). If Selim taps [Edit], the bot responds \"What would you like to change?\" Selim types his correction in natural language, the agent revises the draft incorporating the feedback, and re-presents it with fresh buttons.",
    done_when: "Selim receives a draft email notification in Telegram, taps [Approve], and the email sends automatically through Gmail without Selim ever opening his email client.",
  },
  {
    id: "b26", phase: "B", week: "Weeks 9–11", title: "Build expense agent", tool: "Claude Code",
    details: "The expense agent is triggered by the filing agent via the task_queue pattern: when the filing agent classifies a file as a receipt or invoice, it appends {\"agent\": \"expense\", \"data\": {file_id, classification, property_match}} to the task_queue field in the orchestrator state. The supervisor node picks this up and dispatches the expense agent. The expense agent downloads the receipt image, sends it to the LLM for structured extraction (vendor name, date, line items with descriptions and amounts, tax, total, payment method), and logs the expense to a PostgreSQL expenses table tagged with the correct property_id. It also queries Mem0 to see which property/renovation the expense likely belongs to, and cross-references with LightRAG to check if the amount is consistent with existing vendor contracts.",
    done_when: "Selim drops a receipt photo in Inbox-To-Sort → filing agent files it to the correct property's Finances folder → expense agent extracts all data and logs $247 to The Evergreen's expense record → Selim gets a single Telegram notification confirming both actions.",
  },
  {
    id: "b27", phase: "B", week: "Weeks 9–11", title: "Build archive agent", tool: "Claude Code",
    details: "Triggered by a natural language command from the orchestrator. Najat sends a Telegram message like \"Jean-Dupont is moving out of Unit 3A end of July.\" The orchestrator classifies this as a move-out event and dispatches the archive agent. The agent: (1) looks up Jean-Dupont's files in LightRAG and the Google Drive structure, (2) creates the archive folder following the convention: 06_Archive/2026/The-Evergreen-Bushwick/Unit-3A/Jean-Dupont-Jan-Jul-2026/, (3) presents a complete plan to Najat via Telegram showing exactly which files will be moved and where, (4) waits for explicit approval (always Tier 3 — archiving is destructive), (5) on approval, moves all files, (6) updates Mem0 with \"Jean-Dupont moved out of Unit-3A on 2026-07-31, unit is now vacant,\" (7) notifies Najat that archiving is complete. The security deposit resolution file can stay in the active folder until the next tenant moves in.",
    done_when: "The complete move-out workflow works end-to-end: Telegram message → plan presented → Najat approves → files archived → Mem0 updated → confirmation sent.",
  },
  {
    id: "b28", phase: "B", week: "Weeks 9–11", title: "Build orchestrator supervisor graph", tool: "Claude Code",
    details: "This is the parent LangGraph graph that ties everything together. The OrchestratorState TypedDict holds: messages (with add_messages reducer), user_id, chat_id, current_agent, task_queue (with append reducer), agent_output, iteration_count, workflow_status, and audit_log (with append reducer). The supervisor_node function classifies incoming messages into intents and returns Command(goto=\"filing_wrapper\"), Command(goto=\"email_wrapper\"), etc. Each _wrapper node transforms the orchestrator state into the agent-specific TypedDict, invokes the compiled sub-graph, and maps the result back — this \"wrapper\" pattern prevents sub-graph state (file bytes, email HTML) from bloating parent checkpoints. The task_queue enables cross-agent triggers: filing agent detects a receipt → appends {\"agent\": \"expense\"} → supervisor dispatches expense agent next loop. An iteration guard (max 10 loops) prevents infinite delegation.",
    done_when: "You send \"file this receipt\" via Telegram → orchestrator classifies intent as filing → dispatches filing agent → filing agent detects receipt → triggers expense agent via task_queue → both agents complete → single Telegram notification confirms everything.",
  },
  {
    id: "b29", phase: "B", week: "Weeks 11–13", title: "Build morning digest", tool: "APScheduler + Telegram",
    details: "Add a per-user APScheduler job that fires at 8:00 AM local time (configurable). Selim's digest includes: pending approvals with inline buttons to act immediately, a summary of overnight agent activity (files filed, emails drafted), a property expense snapshot showing this week's spending per property, and upcoming lease expirations within 30 days. Najat's digest includes: tenant communication summary, lease expirations, and upcoming move-outs. Both include a system status line (\"All agents operational\" or specific issues). Implement skip logic: if there are no pending approvals, no overnight activity, and no upcoming expirations, send a minimal message: \"Good morning — all clear today.\" This prevents notification fatigue.",
    done_when: "Selim wakes up at 8 AM, checks Telegram, and sees a useful summary of what happened overnight with buttons to approve any pending items — without opening any other app.",
  },
  {
    id: "b30", phase: "B", week: "Weeks 11–13", title: "Security hardening", tool: "Python + PostgreSQL",
    details: "Five security layers to implement: (1) PostgreSQL roles per agent — create database roles like filing_agent_role, email_agent_role, each with specific table permissions. The filing agent can write to files and audit_log but can't read the credentials table. The email agent can read emails but not tenant_pii. (2) Hash-chain audit log — create an append-only audit_log table where every row contains a SHA-256 hash of the previous row's hash plus the current row's data. The application database role has INSERT-only permission (no UPDATE, no DELETE). A daily cron job verifies the hash chain integrity. (3) LLM Guard at the proxy boundary — install LLM Guard between the agent app and LiteLLM. It scans every prompt going to any LLM and every response coming back, catching PII leakage in both directions. (4) PII scanner validation — run Presidio against a test dataset of 50+ documents with known PII locations. Measure precision (should be >85%) and recall (should be >95%). (5) Prompt injection testing — attempt 5 different injection attacks per agent (e.g., embedding \"ignore previous instructions\" in a document, putting instructions in an email subject line). Verify all are blocked. Set up the kill switch: an /admin emergency command that disables all agents and locks the Inbox-To-Sort folder within 60 seconds.",
    done_when: "Every agent action is recorded in the tamper-proof audit log, the PII scanner catches SSNs with >95% recall, prompt injection attempts fail across all agents, and the kill switch works in under 60 seconds.",
  },
  {
    id: "b31", phase: "B", week: "Weeks 11–13", title: "Full production launch", tool: "Everything",
    details: "The moment of truth. Turn off shadow mode for all agents. They now act for real: the filing agent moves and renames files, the email agent sends approved drafts through Gmail, the expense agent logs real expenses, the archive agent moves real tenant files. Monitor intensively for the first full week: review every agent action in Langfuse traces (every LLM call, every decision, every tool invocation). Have Selim and Najat explicitly report anything that looks wrong — wrong classification, bad email draft, incorrect expense amount. Fix issues immediately with hot-fixes pushed through Git → Coolify auto-deploy (30-90 seconds of downtime, LangGraph checkpointing means in-flight tasks resume automatically). After one clean week with no major issues, the system is officially live.",
    done_when: "All agents have been running in production for a full week handling real operations, with no human intervention required beyond normal Tier 3 approvals, and both Selim and Najat confirm they're comfortable with the system.",
  },

  {
    id: "c32", phase: "C", week: "Weeks 11–13", title: "Set up Next.js dashboard + deploy to Vercel", tool: "Claude Code",
    details: "Start from a Next.js 15 admin dashboard template that comes with shadcn/ui, Prisma ORM, and Auth.js pre-configured (several good open-source starters exist). Add the Tremor chart library for data visualization. Configure Prisma to connect to the journey PostgreSQL database on the Hetzner VPS. Implement Google OAuth via Auth.js — Selim and Najat will log in with their Google Workspace accounts. Set up role-based access control: admin (Armaan — sees everything including system settings and costs), operator (Selim — sees expenses, vendors, files, approvals, activity), communications (Najat — sees tenants, properties, approvals, activity). Build the layout shell with bottom tab navigation (5 tabs: Home, Approvals, Properties, Search, More) — research shows bottom tabs get 65% higher daily usage than hamburger menus. Deploy to Vercel's free tier. The dashboard runs entirely on Vercel (free, zero VPS RAM) and connects to the Hetzner backend via API.",
    done_when: "An authenticated dashboard shell loads at dashboard.yourdomain.com, Selim and Najat can log in with their Google accounts, and the bottom tab navigation works on mobile.",
  },
  {
    id: "c33", phase: "C", week: "Weeks 14–17", title: "Build Dashboard V1: activity feed, approvals, expenses, tenants", tool: "Next.js + shadcn/ui",
    details: "Build the four most critical sections. (1) Activity Feed: a real-time timeline of all agent actions powered by Server-Sent Events (SSE). Each entry shows the agent name, action summary, timestamp, and affected property/person. Filterable by agent type, property, and date range. (2) Pending Approvals: cards showing each Tier 3 action waiting for human decision, with Approve/Edit/Reject buttons that trigger the same LangGraph Command(resume=...) mechanism the Telegram bot uses. (3) Expense Dashboard: Tremor BarChart showing monthly spend by property, DonutChart for category breakdown, and KPI summary cards (total spend, month-over-month change, largest expense). (4) Tenant Directory: card view on mobile (name, unit, lease end date, status badge — tap to expand), table view on desktop with sortable columns and search. All sections must be mobile-first with touch-friendly tap targets (minimum 44px height on all interactive elements).",
    done_when: "Selim can open the dashboard on his phone at a construction site, see everything the agents did today, approve a pending email draft, check how much was spent on The Evergreen this month, and look up a tenant's lease end date — all without switching apps.",
  },
  {
    id: "c34", phase: "C", week: "Weeks 18–20", title: "Build remaining 8 dashboard sections + PWA", tool: "Next.js",
    details: "Add the remaining sections: Vendor directory (card/table view, W-9 and insurance status badges, filter by trade), Property overview (card grid with occupancy indicator, expense total, renovation status), File explorer (Google Drive folder tree with LightRAG-powered search), Knowledge search (shadcn/ui Command component providing a Cmd+K palette that fans out to PostgreSQL + Mem0 + LightRAG simultaneously with results streaming progressively — PostgreSQL results in <100ms, Mem0 in 200-500ms, LightRAG in 3-8s), Agent status (colored status grid showing running/paused/error per agent, toggle switches), Settings (agent behavior sliders, notification preferences, user management), LLM costs (area chart for daily spend, donut chart for model distribution, from Langfuse API data), and Audit log (virtualized table with date filters and CSV/Excel export). Configure PWA: add a web manifest and service worker so Selim and Najat can \"Add to Home Screen\" on their phones for app-like experience with push notifications (supported on iOS since 16.4).",
    done_when: "All 12 dashboard sections are live, Najat can search \"when does Jean's lease end?\" and get an answer from the knowledge search, both partners have the dashboard installed as a PWA on their phones, and the audit log can export a complete compliance report.",
  },
];

// Tool category → color mapping for the tool pill
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
