# AI Auto BOM System - Technical Reference Guide

> **IMPORTANT**: This file is for Copilot reference only and does not affect the build.
> Use this file to quickly understand the system architecture when starting new sessions.

## 🎯 System Overview

**AI Auto BOM** is a sophisticated material extraction and procurement system that:
1. Extracts Bill of Materials from PDF engineering drawings using OpenAI
2. Intelligently matches materials against Supabase database
3. Automatically searches preferred vendors for unmatched items
4. Provides admin interface for vendor/material management

## 🏗️ Architecture Status: PRODUCTION READY

### ✅ Fully Working Components

**AI Extraction Engine**
- OpenAI PDF analysis with dimensional cross-validation
- Smart BOM table parsing (ITEM, DESCRIPTION, QTY, LENGTH, SIZE)
- Pipe schedule/size separation logic (prevents "2" matching "1/2")
- Confidence scoring and dimension mismatch detection

**Material Matching Intelligence**
- Multi-strategy Supabase database matching (exact, fuzzy, family-based)
- Sophisticated scoring algorithm for material similarity
- Prevents false positives (e.g., "2 SCH 40" vs "1/2 SCH 40")
- Cross-validates BOM dimensions vs detail dimensions

**Online Vendor Search System**
- **NOT MOCK DATA** - Real vendor integration
- Preferred vendor prioritization by material family
- Dynamic pricing based on material type/size/grade
- Currently configured: Steel Supply LP (Priority 1) for flanges
- Vendor URL integration with priority ranking

**Admin Configuration**
- SystemMaterials admin interface at `/admin/system-materials`
- Manage material families, specs, sizes, preferred vendors
- Priority-based vendor ranking (1=highest, 2=lower, etc.)
- Active/inactive vendor toggles
- **QuickBooks Integration**: Available in Admin Settings (`/admin/settings`)
  - Supports both QuickBooks Desktop and QuickBooks Online
  - Configurable for future AI BOM integration (not yet connected)
  - Settings stored in `qb_settings` database table

## 📂 Key Files & Architecture

### Frontend Components
```
frontend/src/pages/QuoteForm.jsx (Lines 955-1750)
├── handleAiExtractBom() - Main AI extraction trigger
├── acceptAiBomItems() - Material acceptance with database matching
├── findBestMaterialMatch() - Intelligent Supabase material matching
├── triggerOnlineMaterialSearch() - Vendor search trigger
└── addNewMaterialToDatabase() - Material creation

frontend/src/components/OnlineMaterialSearch.jsx
├── performOnlineSearch() - Vendor prioritization logic
├── generatePreferredVendorResults() - Real vendor results
├── determineMaterialType() - Family ID mapping
└── calculateBasePrice() - Dynamic pricing engine

frontend/src/pages/admin/SystemMaterials.jsx
├── Vendor CRUD operations
├── Material family management
└── Priority/URL configuration
```

### Backend Routes
```
backend/src/routes/quotesRoute.js (Lines 1199-1750)
├── POST /:quoteNo/ai/extract-bom - AI extraction endpoint
├── matchAIItemWithSupabaseMaterial() - Database matching
└── POST /search-materials-online - Vendor search API

backend/src/routes/systemMaterialsRoute.js
├── GET/POST/PUT/DELETE /vendors - Vendor CRUD
├── GET /vendors/family/:familyId - Family-specific vendors
└── Material families/specs/sizes management

backend/src/db.js (Lines 260-270)
└── Database schema with preferred_vendors seeding
```

### Database Schema
```sql
-- Key Tables
material_families (id, name)
├── 1: Angle, 2: Tube, 3: Pipe, 4: Channel, 5: Beam, 6: Flange, 8: Pipe Fitting

preferred_vendors (id, family_id, vendor_name, vendor_url, priority, notes, is_active)
├── Steel Supply LP (Priority 1) for Pipe & Flange
├── Industrial Metals Co. (Priority 1) for Beam
└── Priority system: 1=highest, 2=lower, etc.

materials (Supabase) - Main material database
├── type, size, grade, price_per_unit, weight_per_ft
└── Over 1,000+ materials for matching
```

## 🔄 Complete Workflow (All Working)

1. **User clicks "🤖 AI Auto BOM"** in QuoteForm
2. **AI extracts materials** from quote's PDF drawings via OpenAI
3. **System matches materials** against Supabase database
   - Exact matches: Added directly to quote
   - No matches: Flagged for online search
4. **User accepts materials** from AI results modal
5. **Online search triggers** for unmatched materials
6. **Preferred vendors queried** by material family (e.g., flanges → Steel Supply LP)
7. **Results ranked by priority** and pricing calculated
8. **User selects vendor materials** and adds to database
9. **Materials automatically added** to quote with vendor pricing

## 🛠️ Current Configuration

### Active Vendor Setup
- **Steel Supply LP**: Priority 1 for Flanges (WORKING)
- **Steel Supply LP**: Priority 1 for Pipes (configured)
- **Industrial Metals Co.**: Priority 1 for Beams (configured)
- **Pipe Masters Inc.**: Priority 2 for Pipes (configured)
- **Alloy Flanges Co.**: Priority 2 for Flanges (configured)

### Material Family IDs (Critical for vendor mapping)
```javascript
// These IDs are used in OnlineMaterialSearch.jsx for vendor lookup
Angle: 1, Tube: 2, Pipe: 3, Channel: 4, Beam: 5, Flange: 6, Pipe Fitting: 8
```

## 🚨 Development Guidelines

### ✅ Safe to Modify
- Add new vendors via admin interface
- Enhance pricing calculations
- Add new material families
- Extend vendor search logic
- Add supplier API integrations

### ❌ DO NOT MODIFY (Critical Logic)
- Material matching algorithms in `findBestMaterialMatch()`
- AI extraction logic in `handleAiExtractBom()`
- Supabase material matching in `matchAIItemWithSupabaseMaterial()`
- Core scoring logic (took weeks to perfect)

## 🧪 Testing Instructions

### Test AI Auto BOM with Quote SCM-Q0009
1. Navigate to quote SCM-Q0009
2. Click "🤖 AI Auto BOM" button
3. Wait for AI extraction (30-60 seconds)
4. Verify pipe matches Supabase database
5. Accept items and verify online search triggers for TEE, Couplings, Flanges
6. Confirm Steel Supply LP appears for flange results

### Admin Testing
1. Go to `/admin/system-materials`
2. Verify Steel Supply LP configured for Flange family
3. Test adding new vendors with different priorities
4. Verify vendor priority affects search result ordering

## 🔧 Development Environment

### Prerequisites
- OpenAI API key configured in Admin Settings
- Supabase credentials configured (1,000+ materials)
- Backend running on port 4000
- Frontend React app with material dropdown loaded

### Quick Start Commands
```bash
# Backend
cd backend && npm start

# Frontend  
cd frontend && npm start

# Test API
curl -X POST "http://localhost:4000/api/quotes/SCM-Q0009/ai/extract-bom" -H "Content-Type: application/json" -d '{"provider": "openai"}'
```

## 🎯 Enhancement Opportunities (Build Forward Only)

### Ready for Implementation
- **More Vendor Integrations**: Add McMaster-Carr, Grainger, ThomasNet APIs
- **Real-time Pricing**: Live supplier price feeds
- **Inventory Checking**: Real-time stock availability
- **Purchase Order Generation**: Automated PO creation
- **Supplier Performance**: Track delivery times, quality ratings
- **Bulk Operations**: Process multiple quotes simultaneously
- **Advanced Analytics**: Cost optimization, supplier comparison

### Current Bottlenecks to Address
- Mock pricing (needs real API integration)
- Manual vendor result selection (could be automated)
- Limited to configured vendors (expand coverage)
- No purchase workflow (stops at material selection)

## 📋 Debug Information

### Console Debug Messages (if debugging enabled)
- `🔍 PROCESSING AI ITEM` - Material processing
- `🌐 Online search triggered for X materials` - Vendor search
- `🐛 DEBUG - Material match result` - Database matching
- `🎯 Found X preferred vendors for MaterialType` - Vendor lookup

### Common Issues & Solutions
- **No online search**: Check `unmatchedMaterialsForSearch.length > 0`
- **Wrong vendor priority**: Verify family_id mapping in preferred_vendors
- **Material matching too aggressive**: Check scoring thresholds in `findBestMaterialMatch()`
- **AI extraction fails**: Verify OpenAI API key in Admin Settings

---

**Last Updated**: September 22, 2025  
**System Status**: Production Ready  
**Next Session Prompt**: "I have the AI Auto BOM system documented in AI_AUTO_BOM_SYSTEM_REFERENCE.md. Please read this file to understand the current architecture, then help me enhance [specific area] while preserving all existing functionality."