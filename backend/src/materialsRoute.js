// src/materialsRoute.js
import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

// Your materials.json lives one level up from the Part2 folder
const JSON_PATH = path.resolve(process.cwd(), "..", "frontend", "src", "data", "materials.json");

/** ---------- helpers (non-breaking enrich) ---------- **/

// Parse inches like "3", "3/8", "2-1/2" -> Number(inches)
function parseInches(txt) {
  if (!txt) return NaN;
  const s = String(txt).trim();
  if (s.includes("-")) {
    const [whole, frac] = s.split("-");
    return parseFloat(whole) + parseInches(frac);
  }
  if (s.includes("/")) {
    const [n, d] = s.split("/");
    const nn = parseFloat(n);
    const dd = parseFloat(d);
    if (!isFinite(nn) || !isFinite(dd) || dd === 0) return NaN;
    return nn / dd;
  }
  const n = parseFloat(s);
  return isFinite(n) ? n : NaN;
}

// Angle size strings like "L3x3x1/4" or "L3x2-1/2x3/16"
function parseAngleSize(sizeStr) {
  if (!sizeStr) return null;
  const s = String(sizeStr).trim().toUpperCase();
  if (!s.startsWith("L")) return null;
  const body = s.slice(1);
  const parts = body.split("X");
  if (parts.length < 3) return null;

  const leg1 = parseInches(parts[0]);
  const leg2 = parseInches(parts[1]);
  const thick = parseInches(parts[2]);

  if (![leg1, leg2, thick].every(v => isFinite(v) && v > 0)) return null;
  return { leg1, leg2, thick };
}

// Area ≈ t * (b1 + b2 - t); Weight(lb/ft) ≈ Area(in^2) * 12 * 0.283 ≈ Area * 3.396
function computeAngleWeightPerFt({ leg1, leg2, thick }) {
  const area = thick * (leg1 + leg2 - thick);
  const w = area * 3.396;
  return Math.round(w * 100) / 100; // 2 decimals
}

function enrichMaterialRow(row) {
  const r = { ...row };
  if (r.family && String(r.family).toLowerCase() === "angle") {
    const parsed = parseAngleSize(r.size);
    if (parsed) {
      const w = computeAngleWeightPerFt(parsed);
      if (r.weight_per_ft == null && isFinite(w)) {
        // non-breaking: add a *new* field, leave existing fields untouched
        r.computed_weight_per_ft = w; // lb/ft
      }
    }
  }
  return r;
}

/** ---------- route (same path & behavior) ---------- **/

router.get("/", (_req, res) => {
  console.log("=== MATERIALS ROUTE HIT ===");
  console.log("Looking for file at:", JSON_PATH);
  
  try {
    console.log("Attempting to read file...");
    const text = fs.readFileSync(JSON_PATH, "utf8");
    console.log("File read successfully, length:", text.length);
    
    const data = JSON.parse(text);
    console.log("JSON parsed successfully");
    
    const list = Array.isArray(data)
      ? data
      : Array.isArray(data?.materials)
      ? data.materials
      : [];

    console.log("Final list length:", list.length);
    
    const enriched = list.map(enrichMaterialRow);
    console.log("Sending", enriched.length, "materials");
    
    res.json(enriched);
  } catch (e) {
    console.error("ERROR in materials route:", e.message);
    console.error("Full error:", e);
    res.json([]);
  }
});

export default router;
