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
  - Quality Module (ISO/ASME support).  
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
  - On-screen countdown timer for each process.  
  - “Ready for Next List” button signals completion.  

- **Efficiency Tracking**  
  - Live **Efficiency Bar** (starts at 100).  
  - Drops if process takes longer than allotted time.  
  - Visual indicators:  
    - Circles = Sales Order status.  
    - Rectangles = Process status.  
    - Colors: Green, Flashing Green, Yellow, Flashing Yellow, Red, Flashing Red.  
  - Efficiency scores logged daily/weekly/monthly/yearly.  
  - AI-assisted formula to balance fairness (avoid penalizing delays outside operator control).  

- **Supervisor Portal**  
  - Dashboard of all jobs & processes.  
  - See which operators are efficient or struggling.  
  - Reschedule work on the fly (equipment failure, staff shortage).  

- **Customer Portal Integration**  
  - OEM sees live router-level updates → “5 pcs complete, 4 pcs QC, 1 in welding.”  

---

### 4.4 Quality Module
- Compliance with ISO 9001 & ASME.  
- Weld maps, inspection records, NDE, hydrotests.  
- Auto-generate WPS/PQR/MTRs.  
- Digital approvals/signatures.  
- Non-conformance tracking.  
- OEM visibility into QC results.  

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
- **Quality Assistant**: Check docs for compliance.  
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
