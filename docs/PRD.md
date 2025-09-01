# BridgeLineUSA Project Requirements Document (PRD)

> **NOTE:**  
> This file is the **master source of requirements** for BridgeLineUSA.  
> GitHub Copilot, contributors, and AI agents should reference this document to ensure that all modules, features, and requirements are implemented consistently.  
> Updates to this file should be committed whenever project requirements evolve.  
> Status tags: `[Working]`, `[Needs Fix]`, `[Not Started]`.

---

## 1. Introduction & Purpose
BridgeLineUSA is an **AI-driven manufacturing operations and collaboration platform** that bridges **OEMs and Manufacturers**.  

It combines:
- **Quoting & Sales Orders** (commercial layer)  
- **Production Control** (execution layer)  
- **Quality Assurance** (compliance layer)  
- **Inventory Management** (material layer)  
- **AI Automation** (efficiency layer)  
- **OEM Portals** (customer-facing transparency)  

### Long-Term Vision
BridgeLineUSA will grow into a **multi-company network platform** supporting **hundreds of OEMs and Manufacturers**:  
- OEMs join for faster quoting, real-time job visibility, and QC transparency.  
- Manufacturers join to improve efficiency, access OEMs, and gain tools for quoting and compliance.  
- BridgeLineUSA collects revenue via **% per order** and **monthly manufacturer subscriptions**.  

---

## 2. Scope
- **In Scope (Phase 1)**:  
  - Quotes → Sales Orders → Production Work Orders.  
  - System Materials Database.  
  - Standalone Inventory Module.  
  - Quality Module (ISO/ASME support + AI QC workflow).  
  - Time Tracking & Efficiency Scores.  
  - Admin Portal.  
  - OEM Portals (Quotes, Sales Orders, Jobs, QC).  
  - AI Assistants across modules.  

- **Future Scope**:  
  - Marketplace layer for OEM ↔ Manufacturer matching.  
  - Subscription billing + revenue engine.  
  # BridgeLineUSA Project Requirements Document (PRD)

  > Source of truth for features & acceptance criteria.
  > This markdown mirrors PRD.docx and adds explicit AI sections and API contracts.
  > Status tags: [Working], [Needs Fix], [Not Started]

  ---

  ## 0. Changelog
  - 2025-08-31: Added explicit AI integration specs for Quotes, Sales Orders, Quality, OEM Portal.

  ## 1. Introduction & Purpose
  BridgeLineUSA is an AI-driven manufacturing operations and collaboration platform that bridges OEMs and Manufacturers. This document is the master PRD and contains feature descriptions, acceptance criteria, and API contracts (including AI endpoints).

  ## 2. Scope (summary)
  - Phase 1: Quotes → Sales Orders → Production Work Orders; System Materials DB; Inventory (separate); Quality Module; Admin; OEM Portals; AI Assistants.
  - Future: Marketplace, billing, vendor portals, advanced analytics.

  ## 3. Stakeholders & Users (summary)
  - OEMs (customers), Manufacturers (shops), SCM internal users (estimators, ops, QC), Supervisors, Platform Admins.

  ---

  ## 4. Modules & Functional Requirements (AI-focused excerpts)

  ### 4.1 Quoting Module [Working/Needs Fix]
  - Save + attachments: files uploaded to Supabase Storage; attachments metadata stored in `attachments` table. [Working]
  - **New Quote Form [In Progress]**
    - BOM builder (materials, processes, outsourcing).
    - Material dropdown pulls from **System Materials DB**.
  - **AI Buttons**
    - **AI (per Material row)** → prompts user to describe non-catalog items (e.g., electrical, mechanical).  
      → AI suggests candidate material, user accepts, system adds row with fields populated.
    - **AI BOM from Drawings** → parses attached drawings and auto-creates a full BOM item list.
  - Drawing upload → save to `Customer Quotes/<Quote #>/Drawings`. [Needs Fix]
  - Quick Save Draft & Finalize → [Needs Fix] currently fails (“Save failed: Failed to fetch”).
  - **Length + Unit + Tolerance**
    - Length field split into: numeric value + unit dropdown (in, mm, ft).
    - User can set ± tolerance values and tolerance unit per dimension.
    - System normalizes to feet internally but stores original value + unit for production docs.
    - Tolerances carried into Production Work Orders.
  - Quality Preference dropdown:
    - If selected, pulls QC items from Quality Module (X-ray, Hydro, Weld Maps, etc.) into pricing table.
  - Navigation buttons: return to Dashboard, return to Quote Log, etc. [Not Started]

  ### 4.2 Sales Orders
  - AI Booster: Validate routers & process times, suggest batching. [Not Started]
    - Endpoint: POST /api/ai/jobs (kick off planner), GET /api/ai/jobs/:jobId (poll status/result).

  ### 4.4 Quality Module
  - AI QC Assistant: generate QC checklists and validate uploads (images, weld maps). [Not Started]

  ### 4.9 OEM Portal
  - AI Concierge: natural language Q&A scoped to customer data (quotes, jobs, QC). [Not Started]

  ---

  ## 5. Non-Functional & Security
  - RLS: enforce tenant isolation for attachments, quotes, materials where appropriate.
  - Service role (server) generates signed URLs for downloads; short TTLs.
  - Secrets must not be committed; `.env.sample` provides variable names.

  ---

  ## 6. Acceptance Criteria (AI additions)
  - Quoting: AI-extracted BOM suggestions can be approved and appended to the Quote BOM table; audit records retained.
  - Materials: AI search returns structured candidates; approved entries insert into Materials DB with stable `value` key.
  - AI jobs: asynchronous jobs expose status and results via GET /api/ai/jobs/:jobId.

  ---

  ## 7. API Contracts (AI + attachments)

  ### Attachments / Upload
  - POST /api/quotes/:quoteNo/upload?subdir=drawings
    - multipart/form-data field `files`
    - Behavior: store bytes in Supabase Storage under `quotes/{quote_no}/{subdir}/{uuid}.{ext}`, insert row into `attachments` table, return `{ ok:true, quote, attachments:[...] }` where attachments include `id`, `object_key`, `content_type`, `size_bytes`, `url` (signed).

  ### AI endpoints
  - POST /api/quotes/:id/ai/extract-bom
    - Request: { } (server uses attachments for that quote)
    - Response: { suggestions: [{ material, size, qty, notes, confidence, source }] }

  - POST /api/materials/ai/search
    - Request: { q: string }
    - Response: { candidates: [{ label, value, unit_type, weight_per_ft, source, confidence }] }

  - POST /api/ai/jobs
    - Request: { type: string, payload: object }
    - Response: { jobId }

  - GET /api/ai/jobs/:jobId
    - Response: { jobId, status: 'pending'|'running'|'failed'|'done', result: object|null, error?:string }

  ---

  ## 8. Attachments Schema (Postgres)
  Run in Supabase SQL editor or migration runner:

  ```sql
  create extension if not exists pgcrypto;
  create table attachments (
    id uuid primary key default gen_random_uuid(),
    parent_type text not null check (parent_type in ('quote','sales_order','router','qc_step')),
    parent_id text not null,
    label text,
    object_key text not null,
    content_type text,
    size_bytes bigint,
    sha256 text,
    uploaded_by uuid,
    created_at timestamptz default now(),
    version int default 1
  );
  create index on attachments (parent_type, parent_id);
  create unique index on attachments (object_key);
  ```

  Notes on RLS and policies:
  - Add tenant/owner columns (e.g., `company_id`) if you need strict OEM isolation; policies should reference `auth.uid()` and map to `uploaded_by` or `company_id`.

  ---

  ## 9. Tests (minimum)
  - Unit: fileService.save (local driver) writes object_key and signedUrl returns url.
  - Integration: upload → attachments row inserted → GET /api/quotes/:quoteNo/files returns attachment with signed URL.
  - AI: POST /api/quotes/:id/ai/extract-bom returns suggestions schema (mocked/canned) for tests.

  ---

  If you want, I will now:
  - Implement the AI extraction endpoint scaffold (server-side job + mock extractor) and the `POST /api/materials/ai/search` stub returning candidates from local materials DB.
  - Add frontend UI bits to show AI suggestions in the Quote form.

- **Operator Experience (Tablet/Phone)**  
  - User clocks in → greeted by name.  
  - Selects preferred language.  
  - Assigned to station based on skills, equipment, availability.  
  - Task instructions + checkboxes for completion.  
  - **On-screen countdown timer for each process.**  
  - “Ready for Next List” button signals completion.  

- **Efficiency Tracking**  
  - Live **Efficiency Bar** (starts at 100).  
  - Drops if process takes longer than allotted time.  
  - Visual indicators:  
    - Circles = Sales Order status.  
    - Rectangles = Process status.  
    - Colors: Green, Flashing Green, Yellow, Flashing Yellow, Red, Flashing Red.  
  - Efficiency scores logged daily/weekly/monthly/yearly.  
  - **AI-assisted formula** to balance fairness (avoid penalizing delays outside operator control).  

- **Supervisor Portal**  
  - Dashboard of all jobs & processes.  
  - See which operators are efficient or struggling.  
  - Reschedule work on the fly (equipment failure, staff shortage).  

- **Customer Portal Integration**  
  - OEM sees live router-level updates → “5 pcs complete, 4 pcs QC, 1 in welding.”  

---

### 4.4 Quality Module (with AI Integration)
- **Core Requirements**  
  - Compliance with ISO 9001, ASME, API.  
  - Weld maps, inspection records, NDE, hydrotests.  
  - Auto-generate WPS, PQR, and MTRs.  
  - Digital approvals/signatures.  
  - Non-conformance tracking.  
  - OEM visibility into QC results.  

- **AI-Integrated QC Workflow**  
  - At job launch, selected **Quality Standard** (ISO/ASME/API/customer-specific) drives the QC checklist.  
  - AI generates **dynamic step-by-step QC forms** for each router/process.  
  - Operator workflow:  
    - Must complete QC checklist before moving to next router step.  
    - Checklist can require **checkboxes + photo uploads** (e.g., weld prep, dimensional check).  
    - AI validates photos/data against standard, flags anomalies.  
  - Audit trail: all QC items logged with timestamp, operator/inspector, linked media.  
  - Supervisor dashboard: QC completion % visible next to production %; AI flags missing items.  
  - OEM Portal: QC steps visible in real time with access to signed reports/photos.  

---

### 4.5 System Materials Database (Not Inventory)
- Master catalog of materials for quoting.  
- Materials added manually or via AI Material Search.  
- AI learns → adds missing materials with specs into DB for future use.  
- Not linked to company stock.  

---

### 4.6 Inventory Module (Separate)
- Tracks actual company-owned stock.  
- Manual entry + automatic updates from POs.  
- Auto-deducts when allocated to jobs.  
- Separate from Materials DB.  

---

### 4.7 Time Tracking & Efficiency (User)
- Clock in/out per user.  
- Supports multiple jobs per day.  
- Exports CSV & PDF.  
- Tied to Production Module efficiency scores.  

---

### 4.8 Admin Module
- User management (create, edit, archive).  
- OEM account setup (company + individual OEM users).  
- Production user setup (skills, hourly rate, qualified equipment).  
- One-time setup for starting Quote # & SO #.  
- Role-based permissions.  
- Feature flags to enable/disable modules.  

---

### 4.9 OEM Portal (Customer-Facing)
- **Login & Personalization**  
  - Secure login, MFA.  
  - Greeted by name: “Welcome, Sarah from Atlas Oil Tools.”  
  - AI concierge: “Would you like to review quotes, track jobs, or upload a PO?”  

- **Quotes**  
  - View, approve, reject quotes.  
  - Upload drawings for new quotes.  
  - AI instant estimate preview.  
  - Reorder past jobs.  

- **Sales Orders**  
  - Submit new PO → auto-create Sales Order + folders.  
  - View SO log, linked PO #.  
  - See live router-level progress (per part).  

- **Quality**  
  - View QC docs, weld maps, inspections.  
  - Approve/sign QC reports digitally.  
  - Traceability: click part → view MTR.  

- **Collaboration**  
  - Messaging tied to quotes/jobs.  
  - Upload revisions.  
  - Change logs preserved.  

- **Analytics**  
  - Dashboard: spend, lead times, efficiency.  
  - AI forecasting: “You usually order this every 3 months, request a new quote?”  

---

### 4.10 AI Integration
- **Quote Assistant**: BOM extraction from drawings.  
- **Material Assistant**: Search online for materials, auto-add to DB.  
- **Quality Assistant**: Walk operators through QC checklists.  
- **Production Planner**: Optimize router batching & schedules.  
- **Customer AI Concierge**: Natural language queries inside OEM Portal.  

---

## 5. Non-Functional Requirements
- **Frontend**: React + Electron + mobile-responsive.  
- **Backend**: Node.js/Express.  
- **Database**: SQLite → PostgreSQL upgrade path.  
- **Storage**: Local folders (`Quotes/`, `Sales Orders/`).  
- **Security**: Role-based, OEMs see only their own data.  
- **Performance**: Must handle 1,000+ quotes/SOs, 100,000+ routers.  
- **Scalability**: Multi-company support (future OEM-Manufacturer marketplace).  

---

## 6. Acceptance Criteria
- Quotes can be created, saved, and re-opened.  
- Quotes correctly create folders/files.  
- Sales Orders generate routers per part/QTY.  
- Operators can clock in, see tasks, complete with timers.  
- Efficiency scores update in real time.  
- OEM can log in, submit PO, and see router-level status.  
- QC docs are accessible by OEMs.  
- AI can parse drawings into draft BOMs.  

---

## 7. Risks & Dependencies
- Accuracy of AI parsing for BOMs.  
- Complexity of router batching logic.  
- Data security for OEM portals.  
- Risk of feature creep from OEM/manufacturer requests.  

---

## 8. Open Questions
- Should OEMs have tiered visibility (buyers see $, engineers see only specs)?  
- Should router batching logic be AI-driven from the start or rule-based first?  
- Should OEMs see machine-level utilization data or just process-level progress?  

---

## Appendix: UI Component Example (React)

```jsx
// JobStatusCard.jsx
// Visual spec for Job + Router process visualization
// - BIG overall circle for Sales Order status
// - Router bars for each process with elapsed vs estimated time
// - Flashing if operator is clocked in

import React, { useMemo } from "react";

const cls = (...arr) => arr.filter(Boolean).join(" ");
const statusToColor = (status) => {
  switch (status) {
    case "on_track": return "bg-green-500 border-green-600";
    case "falling_behind": return "bg-yellow-400 border-yellow-500";
    case "late": return "bg-red-500 border-red-600";
    default: return "bg-gray-300 border-gray-400";
  }
};
const statusToText = (status) => {
  switch (status) {
    case "on_track": return "On Track";
    case "falling_behind": return "Falling Behind";
    case "late": return "Late";
    default: return "Unknown";
  }
};
const fmtHM = (mins) => {
  const m = Math.max(0, Math.round(mins ?? 0));
  const h = Math.floor(m / 60);
  const r = m % 60;
  return `${h}h ${String(r).padStart(2, "0")}m`;
};
const pct = (elapsedMin, estMin) => {
  if (!estMin || estMin <= 0) return 0;
  return Math.min(120, Math.round((elapsedMin / estMin) * 100));
};

export default function JobStatusCard({
  soNumber = "S-3501",
  poNumber = "8168496-1",
  overallStatus = "on_track",
  routers = [
    { name: "Sawing", status: "on_track", active: true, elapsedMin: 18, estMin: 30 },
    { name: "Fitting", status: "falling_behind", active: false, elapsedMin: 42, estMin: 40 },
    { name: "Welding", status: "late", active: true, elapsedMin: 95, estMin: 60 },
  ],
}) {
  const anyActive = routers.some((r) => r.active);
  const overallPct = useMemo(() => {
    if (!routers.length) return 0;
    const vals = routers.map((r) => Math.min(100, (r.elapsedMin / (r.estMin || 1)) * 100));
    return Math.round(vals.reduce((a, b) => a + b, 0) / routers.length);
  }, [routers]);

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <style>{`
        @keyframes flash { 0%, 100% {opacity: 1;} 50% {opacity: .35;} }
        .flash { animation: flash 1.2s linear infinite; }
        @keyframes pulseSoft { 0% { transform: scale(1); } 50% { transform: scale(1.015);} 100% { transform: scale(1); } }
        .pulse-soft { animation: pulseSoft 2.6s ease-in-out infinite; }
      `}</style>

      <div className="flex items-baseline justify-between mb-6">
        <div className="text-2xl font-semibold">Job {soNumber}</div>
        <div className="text-lg text-gray-600">PO: {poNumber}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="flex justify-center md:col-span-1">
          <div
            className={cls(
              "relative rounded-full border-8 shadow-lg aspect-square",
              "w-64 md:w-72 lg:w-80",
              statusToColor(overallStatus).replace("bg-", "bg-opacity-80 "),
              anyActive ? "pulse-soft" : ""
            )}
          >
            <div className="absolute inset-0 rounded-full flex flex-col items-center justify-center text-white">
              <div className="text-sm opacity-90">Overall Status</div>
              <div className="text-2xl font-bold">{statusToText(overallStatus)}</div>
              <div className="mt-2 text-sm opacity-90">Avg Progress</div>
              <div className="text-3xl font-extrabold">{overallPct}%</div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-5">
          <div className="text-xl font-semibold mb-2">Routers</div>
          {routers.map((r, i) => {
            const color = statusToColor(r.status);
            const progress = pct(r.elapsedMin, r.estMin);
            const overrun = progress > 100;

            return (
              <div key={i} className="rounded-2xl shadow p-4 border border-gray-200">
                <div
                  className={cls(
                    "inline-flex items-center gap-3 px-4 py-1.5 rounded-full text-white font-semibold",
                    color,
                    r.active ? "flash" : ""
                  )}
                >
                  <span>{r.active ? "🟢" : "⚪"}</span>
                  <span>{r.name}</span>
                  <span className="text-white/90 text-sm">({statusToText(r.status)})</span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                  <div className="text-sm text-gray-700">
                    Time: <span className="font-mono">{fmtHM(r.elapsedMin)}</span> /{" "}
                    <span className="font-mono">{fmtHM(r.estMin)}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {overrun ? "Over estimate" : `${Math.min(progress, 100)}% of estimate`}
                  </div>
                </div>

                <div className="mt-3 h-3 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={cls(
                      "h-full transition-all",
                      color.split(" ").find((c) => c.startsWith("bg
