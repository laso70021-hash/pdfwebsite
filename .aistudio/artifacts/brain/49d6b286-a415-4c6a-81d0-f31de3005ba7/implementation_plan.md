# Swahivo — AI-Powered PDF & Document SaaS Platform

Swahivo is an enterprise-grade, high-performance SaaS platform combining 30+ client-side and server-assisted PDF manipulation tools with advanced Google Gemini AI document intelligence, secure Firebase persistence, tiered subscription billing, and multi-user team workspaces.

> [!IMPORTANT]
> **Confirmed Architectural Decisions from Clarification**:
> - **Database & Authentication**: Firebase Auth and Firestore for live cloud persistence and role-based access control.
> - **PDF Processing Engine**: High-speed, private browser-based PDF processing (`pdf-lib`, `pdfjs-dist`, `canvas`) with secure server AI proxies for zero-latency execution.
> - **Payments & Billing**: Interactive Stripe sandbox simulator with verified subscription lifecycle, automated entitlement switching, and seat-based team calculations.
> - **AI Model Hierarchy**: `gemini-3.8-flash` for fast summarization, translation, and chat; `gemini-3.1-pro-preview` with `ThinkingLevel.HIGH` for deep reasoning and document comparison; multimodal image understanding for document OCR and photo analysis.

---

### 1. Overview & Core Concept

- **What It Does**: Swahivo empowers professionals, students, and teams to merge, split, compress, protect, edit, sign, and convert PDF documents while leveraging cutting-edge Gemini AI to summarize, chat, extract key points, generate study guides, and run OCR on uploaded files.
- **Target Audience / Persona**: Knowledge workers, legal and financial analysts, students, and collaborative teams handling high volumes of contracts, research papers, reports, and invoices.
- **Key Value**: Instant, privacy-first document transformation without file size bottlenecks, coupled with deeply grounded AI insights and verifiable usage quotas.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Public Marketing & Hero**: Clean navigation, hero drop zone for instant PDF upload, category filters, 3-step workflow, customer trust anchors, interactive pricing matrix, and security badges matching the approved Swahivo aesthetic.
2. **Tools Directory (`/tools`) & Dedicated Workspaces**: Filterable grid of 30+ PDF operations (Merge, Split, Compress, Protect, Unlock, Watermark, Sign, Organize, OCR, Image-to-PDF, PDF-to-Image, Convert to/from Office formats). Each tool features drag-and-drop file upload, real-time preview, visual page reordering/selection, processing progress bar, and instant download.
3. **AI Document Studio (`/ai-pdf`)**: Chat with PDF with page-grounded citations, one-click executive summaries, key-point extraction, quiz generator, deep thinking mode analysis, and multimodal document photo inspection.
4. **Pricing & Checkout (`/pricing`)**: 4-tier cards (Free $0/mo, Pro $12/mo, Team $10/user/mo, Business Custom) with monthly/annual toggle, comprehensive feature comparison table, and an interactive Stripe checkout simulator with instant sandbox fulfillment.
5. **User Dashboard (`/dashboard`)**: Lifetime usage meters (Free 3 PDF ops & 5 AI queries; Pro/Team high-quota fair use), recent processed documents, AI conversation archive, downloadable receipts, and security settings.
6. **Team & Business Workspace (`/team`)**: Team member invites, role-based seat allocations, shared document vaults, and consolidated team usage analytics.
7. **Admin Console (`/admin`)**: Global user directory, plan pricing & quota manager, real-time usage event telemetry, business lead tracker, and platform audit logs.

#### Visual Identity & Theme
- **Aesthetic Direction**: Professional, clean SaaS aesthetic inspired by the Swahivo design reference. Crisp white surfaces, deep navy headings (`#0F172A`), royal blue primary actions (`#2563EB` / `#1D4ED8`), and subtle cool-gray borders (`#E2E8F0`).
- **Typography & Scale**: `Plus Jakarta Sans` for geometric display headings and navigation, `DM Sans` for body copy, and `tabular-nums` monospace numbers for metrics, quotas, and document sizes.
- **Zero-Pill Discipline**: Statuses and metadata use quiet inline typography with typographic separators (`·`) rather than loud pill badges. Only interactive segmented tabs use button enclosures.
- **Single-Elevation Depth**: Clean hairline borders (`border border-slate-200`) and subtle shadows (`shadow-sm`) with no nested card sandwiches.

---

### 3. Key Product Decisions & Trade-Offs

- **Client-Side PDF Processing Engine**:
  - *Chosen Approach*: Execute operations like Merge, Split, Rotate, Watermark, Page Deletion, and Encryption directly in the browser using `pdf-lib` and Canvas API.
  - *Why*: Instant speed, zero upload latency, 100% document privacy (files never leave the user's browser unless AI processing is requested), and elimination of server storage costs.
- **Google Gemini Integration**:
  - *Chosen Approach*: Server-side API proxy calling `@google/genai` with streaming support. Text extracted client-side or via OCR is sent securely with strict prompt boundaries to prevent prompt injection from document contents.
  - *Why*: Protects API credentials, enforces quota deduction atomically in Firestore, and supports high-thinking deep reasoning.
- **Entitlement & Quota Enforcement**:
  - *Chosen Approach*: Centralized plan definitions stored in Firestore and synchronized with the frontend context. Every PDF download and AI query verifies available quota and records an audit usage event.
  - *Why*: Guarantees that free accounts strictly respect 3 PDF operations and 5 AI queries without frontend tampering.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             SWAHIVO CLIENT (React / Vite)                   │
├─────────────────┬───────────────────┬───────────────────┬───────────────────┤
│ Public Views    │ PDF Tools Suite   │ AI Document Hub   │ Dashboards        │
│ • Landing Page  │ • 30+ Tools       │ • Chat with PDF   │ • User Dashboard  │
│ • /pricing      │ • pdf-lib engine  │ • Deep Thinking   │ • Team Workspace  │
│ • /tools        │ • Canvas preview  │ • Multimodal OCR  │ • Admin Console   │
└────────┬────────┴─────────┬─────────┴─────────┬─────────┴─────────┬─────────┘
         │                  │                   │                   │
         ▼                  ▼                   ▼                   ▼
┌──────────────────┐┌──────────────────┐┌──────────────────┐┌──────────────────┐
│  Firebase Auth   ││  Firestore DB    ││  Server Proxy    ││  Stripe Sandbox  │
│  • Google Sign-In││  • profiles      ││  • /api/gemini   ││  • Checkout UI   │
│  • Email/Password││  • documents     ││  • Thinking HIGH ││  • Webhook Sim   │
│  • Session Store ││  • usage_events  ││  • Quota Check   ││  • Entitlements  │
└──────────────────┘└──────────────────┘└──────────────────┘└──────────────────┘
```

#### Firestore Data Model
- `profiles/{userId}`: `email`, `displayName`, `planId` ('free' | 'pro' | 'team' | 'business'), `role` ('user' | 'admin'), `createdAt`.
- `user_entitlements/{userId}`: `pdfOperationsUsed`, `pdfOperationsLimit`, `aiQueriesUsed`, `aiQueriesLimit`, `subscriptionStatus`.
- `documents/{docId}`: `userId`, `name`, `size`, `pageCount`, `toolUsed`, `createdAt`.
- `ai_conversations/{convId}`: `userId`, `documentName`, `messages: [{ role, content, citations, timestamp }]`.
- `workspaces/{workspaceId}`: `ownerId`, `name`, `seats`, `members: [{ email, role }]`.
- `usage_events/{eventId}`: `userId`, `type` ('pdf_operation' | 'ai_query'), `tool`, `timestamp`.
- `business_leads/{leadId}`: `name`, `email`, `company`, `teamSize`, `notes`, `createdAt`.

#### Interactive Component & State Mapping
- `AuthProvider`: Manages live Firebase user state and profile synchronization.
- `QuotaProvider`: Tracks real-time usage counters with automatic modal triggers when Free limits (3 operations or 5 AI queries) are reached.
- `PdfToolRunner`: Unified file upload, parameter customization (password, split ranges, watermark text, rotation angle), progress state, and instant download handler.
- `AiDocumentChat`: Document text extraction, streaming Gemini responses, thinking-mode indicator, and citation highlight cards.
- `BillingSimulator`: Live Stripe checkout modal supporting instant card testing, seat scaling for Team, and real-time subscription upgrade/downgrade.
