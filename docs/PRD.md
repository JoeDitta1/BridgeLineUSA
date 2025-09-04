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
  - Vendor/Supplier portal.  
  - Advanced analytics dashboards.  

---

## 3. Stakeholders & Users
- **OEMs (Customers)**: View quotes, submit POs, track jobs, see QC docs.  
- **Manufacturers (SCM + network shops)**: Run Production Module, manage jobs.  
- **SCM Internal Users**: Estimators, Admins, Production operators, QC inspectors.  
- **Supervisors/PMs**: Manage efficiency, schedule jobs, approve POs.  
- **BridgeLineUSA Admin**: Platform owner, manages billing, onboarding, global settings.  

---

## 4. Modules & Functional Requirements

### 4.1 Quoting Module
- **Quote Log [Working/Needs Fix]**  
  - Auto-generates Quote Numbers (SCM-Q-####).  
  - Table view of all quotes.  
  - [Needs Fix] Link quote numbers → customer quote folders.  
  - [Not Started] Delete feature (with recycle bin for recovery).  
  - Sales Order # auto-populates if quote becomes job.  

- **New Quote Form [In Progress]**  
  - BOM builder (materials, processes, outsourcing).  
  - Material dropdown pulls from **System Materials DB**.  
  - [Not Started] “AI Auto BOM” button → parse uploaded drawings, auto-fill BOM.  
  - [Needs Fix] Drawing upload → save to `Customer Quotes/<Quote #>/Drawings`.  
  - Quick Save Draft & Finalize → [Needs Fix] currently failing with “Save failed: Failed to fetch”.  
  - Quality Preference dropdown:  
    - If selected, pulls QC items from Quality Module (X-ray, Hydro, Weld Maps, etc.) into pricing table.  

- **Outputs [Not Started]**  
  - Quote PDFs (email to customer or download).  
  - “Create Job” button → convert quote into Sales Order.  

---

### 4.2 Sales Orders Module
- **Sales Order Log [Not Started]**  
  - Auto-generates Sales Order # (SCM-S-####).  
  - Links to Sales Order folders.  
  - Shows associated customer PO # (visible wherever SO number is shown).  
  - Status: Draft / Pending / Accepted / In Progress / Complete.  

- **Sales Order Creation**  
  - Trigger paths:  
    1. From a Quote → direct conversion.  
    2. From Log → “Create Sales Order” manually.  
    3. From OEM Portal → customer uploads PO, drawings, notes.  
  - PM review step → accept/revise order.  
  - Auto-email customer on acceptance.  

- **Sales Order Form (Work Order Form)**  
  - Copy of Quote Form (if quote exists).  
  - Editable for processes, times, quality requirements.  
  - AI Booster button: reviews all inputs + files → flags missing processes, QC points, inconsistencies.  
  - Equipment selection links to Equipment Module.  
  - “Create Production Routers” button auto-generates routers.  

---

### 4.3 Production Module
- **Work Orders [Not Started]**  
  - Generated from Sales Orders.  
  - Splits into **trackable routers** for each unit or batch.  
    - Example: PO for 10 pcs → system creates 10 routers.  
    - Each router independently tracked (e.g., 1 in welding, 4 in QC, 5 shipped).  
  - AI-assisted grouping → combine materials/processes across jobs for efficiency.  

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


### 4.4 Quality Module (with AI Integration) [Expanded]

**Purpose**  
- Serve as a complete **Quality Management System (QMS) backbone** for ISO 9001, ASME U, API 4F/Q1, and other certifications.  
- Provide each company using BridgeLineUSA with its own **audit-ready Quality Manual(s)** and digital QC workflows.  
- Ensure nothing is missing for certification: documents, records, training, calibration, NCRs, audits, and management reviews.  

---

**Core Requirements**  
1. **Quality Manuals (per standard)**  
   - Separate manuals for ISO 9001, ASME, API, etc.  
   - Where overlap exists, system notes: *(“Also meets ISO Clause 7.5.3”)*.  
   - Each manual kept clean for auditors (ASME manual contains only ASME requirements).  

2. **Procedures & Records Covered**  
   - **Document Control:** versioning, approvals, archive, superseded notices.  
   - **Training Records:** employee qualifications, weld certs, digital training matrix; alerts when renewals due.  
   - **Calibration Control:** equipment list, calibration intervals, digital certificates, out-of-tolerance alerts.  
   - **Welding Control:** WPS, PQR, WPQ linked to jobs; auto-checked at router step.  
   - **Material Traceability:** MTRs tied to BOM items; accessible in OEM portal.  
   - **Inspection & Test Records:** NDE, hydrotests, dimensional checks with photos and signatures.  
   - **Non-Conformance (NCR):** digital log with disposition (rework, scrap, use-as-is), approvals, corrective actions.  
   - **Corrective & Preventive Actions (CAPA):** tracked by AI agent, linked to NCRs and audits.  
   - **Internal Audits:** scheduled by AI; checklists auto-generated from chosen standard.  
   - **Management Review:** digital agenda + minutes + action items, tracked to closure.  

3. **AI-Integrated QC Workflow**  
   - Job launch: selected Quality Standard drives dynamic QC checklist.  
   - Operators cannot proceed until QC hold points are cleared.  
   - AI validates photos/data against standard acceptance criteria.  
   - Audit trail: all records time-stamped, user-linked, immutable.  

4. **Audit & Certification Support**  
   - **Audit Mode:** one-click export of all required docs/records for ISO/ASME/API audit.  
   - AI generates a compliance index mapping every clause/paragraph to evidence stored in system.  
   - OEM/customer auditors may be granted controlled read-only access.  

5. **Integration with Other Modules**  
   - **Quotes Module:** Quality preference dropdown pulls QC items into pricing.  
   - **Routers (Production):** QC forms attached to router steps; no router completion without QC signoff.  
   - **Scheduling Module:** QC hold points prevent premature scheduling of downstream tasks.  
   - **OEM Portal:** OEMs see QC docs, signed reports, MTRs, inspection photos in real time.  

---

**Acceptance Criteria**  
- Each company has system-generated Quality Manuals tailored to ISO/ASME/API, complete and audit-ready.  
- All required procedures and records (training, calibration, NCR, CAPA, audits, management review) are maintained digitally.  
- AI can generate compliance evidence packs for auditors on demand.  
- QC data is immutable, traceable, and linked to jobs/routers.  
- OEMs can access QC records securely without exposing unrelated data.  

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


### 4.11 Customer Module [Planned]

**Purpose**  
Central hub for all customer (OEM) data, interactions, and history. Provides internal users with full visibility of customer activity and external OEM users with controlled portal access.

---

**Core Functions**  
1. **Customer Master Records**  
   - Company profile: name, address, tax ID, billing contacts.  
   - Contacts: multiple individuals per company (buyers, engineers, QC reps).  
   - Notes: internal notes + AI-summarized call/email history.  
   - File vault: drawings, specs, contracts not tied to a single quote/job.  

2. **Linked Records**  
   - Quotes: list of all quotes with status, $ value, last updated.  
   - Sales Orders: list of all jobs, routers, progress.  
   - QC: audits, NCRs, approvals signed by that customer.  
   - Billing (future): invoices, payment status.  

3. **Communication & AI Integration**  
   - Integrated messaging (threaded by quote/job).  
   - Email integration (Outlook/Gmail watch → auto-log incoming POs, RFQs).  
   - AI Assistant:  
     - Summarize customer history.  
     - Suggest upsell/reorder opportunities.  
     - Draft replies to RFQs with context pulled from quotes.  

4. **Access Control**  
   - Internal view: full pricing + financial data.  
   - External (OEM portal): limited to their own data, role-based (buyers see $, engineers see specs/QC only).  
   - Admin: manage visibility rules.  

---

**UI/UX**  
- `/customers` → searchable table (company, contact, active quotes, active jobs).  
- `/customers/:id` → dashboard with tabs: Overview, Quotes, Sales Orders, QC, Files.  
- AI side panel: “Summarize last 6 months of activity” / “What open issues does Atlas have?”  

---

**Integration Points**  
- Quotes → stored under customer record.  
- Sales Orders → linked automatically with PO uploads.  
- QC → NCRs and QC approvals tied to customer.  
- Scheduling → OEM ETA updates stored in customer record.  
- Admin → create/archive customer accounts, manage OEM logins.  

---

**Acceptance Criteria**  
- Internal users can create/manage customer master records.  
- Quotes, SOs, QC auto-link back to customer.  
- OEM Portal pulls data securely with permissions enforced.  
- AI assistant available in customer view for summarization/suggestions.  
- Communications (messages, emails, uploads) tied to correct customer.  

---

⚡ This way the PRD treats **Customer Module** as the **internal hub**, while the **OEM Portal** is the **external window** into it.


**Note on Customer vs OEM Modules**  
- The **Customer Module** is the internal hub (CRM-style) used by estimators, PMs, supervisors, and admins.  
- The **OEM Portal** is the external-facing module where customers log in to view quotes, jobs, QC, and progress.  
- Both modules share the same data, but permissions and visibility differ.  
- Customer Module = full visibility (internal). OEM Portal = controlled subset (external).  


### 4.12 Routers Module [Planned]

**Purpose**  
Provide the detailed process-level breakdown for each Sales Order. Routers connect Sales Orders to Production, Quality, Scheduling, and Efficiency Tracking. They ensure every operation is properly defined, tracked, and completed before advancing.

---

**Core Functions**  
1. **Router Creation**  
   - Generated from Sales Orders automatically.  
   - Splits into trackable router steps for each unit or batch. Example: PO for 10 pcs → system creates 10 routers.  
   - Each router independently tracked (e.g., 1 in welding, 4 in QC, 5 shipped).  
   - AI-assisted grouping: combine materials/processes across jobs for efficiency.  

2. **Operator Workflow (from Router)**  
   - Operator clocks in and is presented with router steps assigned to their station.  
   - Task instructions displayed clearly and non-cluttered.  
   - AI auto-inserts proper operating info (e.g., weld machine settings) based on process, WPS, and equipment.  
   - On-screen checkboxes for each process step.  
   - QC hold points: router cannot advance until QC checklist is completed.  

3. **QC Integration**  
   - Digital quality forms (per selected quality system: ISO, ASME, API, customer-specific) attached to router steps.  
   - Checklists mostly Yes/No with required photos/signatures.  
   - QC hold points prevent moving to next process until cleared.  
   - AI validates photos/data against standards and flags anomalies.  

4. **Supervisor Controls**  
   - Dashboard shows router status and % complete.  
   - Manual “Complete” checkbox available if an operator missed a step (with QTY box).  
   - Supervisors can override or reassign steps as needed.  
   - AI flags missing QC/production records.  

5. **Integration with Scheduling**  
   - Routers feed into Production Scheduling Module.  
   - Dynamic updates when jobs are delayed, cancelled, or rescheduled.  
   - QC hold points block downstream scheduling until cleared.  

6. **Efficiency Tracking**  
   - Estimated vs actual time logged per router step.  
   - Efficiency scores calculated and rolled up to operator, job, and company KPIs.  
   - AI-assisted formula to balance fairness (avoid penalizing operators for delays outside their control).  

---

**UI/UX**  
- Router screen = clean, non-cluttered, broken into small achievable steps.  
- Digital checklist with progress % and QTY tracking.  
- Visual bar showing router % complete.  
- Colored indicators (Green, Flashing Green, Yellow, Flashing Yellow, Red, Flashing Red).  
- Hold point steps clearly marked.  

---

**Acceptance Criteria**  
- Routers auto-generate correctly from Sales Orders.  
- Operators see only their assigned router steps in a clear UI.  
- QC hold points enforced with digital checklists/photos.  
- Supervisors can manually complete or override when necessary.  
- Efficiency scores and router completion % are updated in real time.  
- Scheduling and OEM Portal reflect router progress accurately.  

---

⚡ Routers are the backbone of BridgeLineUSA’s production system, linking Sales Orders to shop execution, Quality, and Scheduling.

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


4.11 Production Scheduling Module (AI-Driven) [New/Planned]

**Purpose**  
- Provide a **dynamic, AI-assisted scheduling engine** that manages work orders, routers, and processes in real time.  
- Continuously adapts to new orders, cancellations, equipment/operator changes, and QC hold points.  
- Ensures BridgeLineUSA can flexibly optimize delivery schedules, shop efficiency, and resource allocation.

---

**Core Functions**  
1. **Constraint-Based Scheduling**  
   - Processes require resources (machines, operators, materials, QC).  
   - Scheduler prevents double-booking and respects process dependencies.  

2. **Auto-Rescheduling**  
   - New orders inserted automatically in best slot.  
   - Cancelled orders free up resources and move others forward.  
   - Equipment/operator downtime triggers automatic rerouting.  

3. **Optimization Goals (Configurable)**  
   - Minimize lateness vs due dates.  
   - Maximize operator/machine efficiency.  
   - Prioritize high-value or rush jobs.  
   - Balance workloads across shifts.  

4. **Supervisor Interaction**  
   - Drag & Drop overrides → AI recalculates downstream effects.  
   - Toggle between **Auto Mode** and **Suggest Mode** (AI proposes changes, supervisor approves).  
   - “Freeze” critical jobs so AI cannot move them.  

5. **What-If Simulation**  
   - Supervisors can ask:  
     - “What if we add overtime Friday?”  
     - “What if we reroute welding to Machine #3?”  
   - AI instantly simulates schedule impact.  

6. **Learning Layer**  
   - AI refines estimates using actual vs planned times from router history.  
   - Improves accuracy of future schedules and quotes.  

---

**Operator/Shop Floor Integration**  
- Personalized task lists delivered to operator tablets.  
- Routers update in real time as schedule changes.  
- If operator unavailable, task reassigns automatically to next qualified user.  

**OEM Portal Integration**  
- OEMs see live updates when schedules shift:  
  - “Job 4501 rescheduled for delivery on 9/12 due to material delay.”  

---

✅ **Acceptance Criteria**  
- Schedule board shows all jobs, routers, and resources.  
- AI dynamically updates schedule when orders or resources change.  
- Supervisors can override via drag & drop, with AI recalculating.  
- Operators receive updated task lists instantly.  
- OEM portal reflects live schedule changes.  

---

⚡ This module becomes the **“air traffic control tower”** of BridgeLineUSA, keeping every moving part coordinated and optimized.

 
Appendix: Production Scheduling Module – UI & Architecture Blueprint

Goal: a small, composable set of screens and components that together form a true AI‑driven Process Traffic Control module for BridgeLineUSA. Everything below is designed for incremental delivery with minimal coupling and clean APIs.

---

### A. Product Principles
- Small files, small pages: each screen loads a single container component + 3–7 child components. Lazy‑load heavy widgets (Gantt, charts).
- Explainable AI: every AI action (move, delay, reassign) includes a “Why?” link with rationale and impacted jobs/metrics.
- Operator‑first: schedule changes propagate instantly to tablets with the fewest taps possible.
- QC‑gated flow: routers cannot advance past hold points until required QC forms/photos/signatures are complete.
- Live & resilient: real‑time via WebSocket; optimistic UI; conflict resolution with server authority.

### B. Screen Map (8 focused pages)
1. Schedule Board (Supervisor/Planner)
2. Job Detail / Router Viewer
3. Resource Hub
4. What‑If Simulator
5. Alerts & Conflicts
6. Operator Tablet – My Tasks
7. Settings & Policies
8. OEM Portal – Live ETA & Ask‑AI (read‑only)

### C. Key Widgets (reusable)
- <ScheduleGantt/>, <CapacityHeatmap/>, <RouterTimeline/>, <ImpactPreview/>, <AiRationale/>, <QcChecklistInline/>, <WhatIfPanel/>, <AlertList/>

### D. Navigation & IA
Routes: /schedule, /jobs/:soId, /resources, /what-if, /alerts, /settings/scheduling, /oem/:customerId/eta

### E. Data Model (minimal tables)
jobs, routers, router_steps, resources, reservations, calendars, skills, materials_shortages, events, policies

### F. API Contracts (server → client)
- POST /api/schedule/plan
- GET /api/schedule/plan/:id
- POST /api/schedule/apply
- POST /api/schedule/move
- POST /api/schedule/scenario
- Operator tasks API
- QC gating API
- OEM ETA + Ask‑AI API
- WebSocket channels: schedule, alerts, operators

### G. AI Planner (constraints & optimization)
Hard constraints (precedence, resource capacity, QC, materials). Soft constraints (lateness, churn, setups). Objectives selectable (lateness, throughput, overtime). Modes: Auto, Suggest, Locked.

### H. UX Details & Micro‑interactions
Hover previews, drag slots, conflict ribbons, freeze pins, “Why late?” path tracing.

### I. Integration Points
Hooks into Sales Orders, Routers, Quality, Inventory, Time Tracking, Admin, OEM Portal. Publishes/subscribes to events.

### J. Permissions & Roles
Planner/Supervisor, Operator, QC, OEM (read‑only ETA), Admin.

### K. KPIs & Dashboards
Schedule adherence, lateness, throughput, WIP, utilization, QC rework, prediction error, churn. What‑if deltas.

### L. Implementation Plan
Incremental PRs: scaffold → resources → operator tasks → Gantt → planner → QC → alerts → what‑if → OEM ETA.

### M. Suggested Frontend Layout
/src/pages, /src/components/schedule, /src/components/common, /src/state, /src/api

### N. Suggested Backend Layout
/server/routes, /server/services, /server/ws, /server/db

### O. Sample Reservation JSON
{ id, step_id, resource_id, start, end, rationale[] }

### P. Edge Cases & Policies
Preemption, partial batches, multi‑resource steps, setup buffers, fatigue rules.

### Q. Acceptance Criteria
Drag & drop preview + apply, auto vs suggest, operator updates in 3s, QC gates enforced, what‑if works cleanly.

### R. Future Upgrades
Swap heuristic planner with CP‑SAT, add OEE, predictive maintenance, multi‑site scheduling.

