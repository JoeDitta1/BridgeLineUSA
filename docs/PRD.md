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

> **📋 Detailed Module Specifications**: For comprehensive specifications of Customer Module, OEM Module, and Facility Module, see [CUSTOMER_OEM_FACILITY_MODULES.md](./CUSTOMER_OEM_FACILITY_MODULES.md)

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

- **Request to Expedite**: OEMs can request expedited delivery for existing orders through OEM/dashboard/openorders portal.  
    - "Request to Expedite" button available on each open order.  
    - Opens quick form to specify urgency level, required delivery date, and business justification.  
    - Triggers BridgeLineUSA AI agent to automatically explore all expediting options.  
    - AI agent analyzes production schedule, capacity, material availability, and alternative routing options.  
    - Within seconds, AI responds with interactive options including:  
      - Additional overtime charges and cost impact.  
      - Approval from OEM to delay other lower-priority orders.  
      - Alternative material sourcing options.  
      - Premium shipping arrangements.  
      - Production schedule adjustments and timeline impacts.  
    - OEM can approve/reject options and negotiate terms through AI chat interface.  
    - Approved expedites automatically update production schedules and notify all stakeholders.

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

