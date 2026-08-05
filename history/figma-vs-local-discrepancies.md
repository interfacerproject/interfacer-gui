# Figma Prototype vs Local GUI — Discrepancy Analysis

> **Date:** 2026-07-16
> **Figma prototype:** `https://same-desk-33715229.figma.site/products/olsk-large-3d-printer-%E2%80%93-assembled` > **Local GUI:** `http://localhost:3000/project/06FP254TMRGMVJHJYVNQHJKRRM`

---

## 1. PRODUCT IDENTIFIER & METADATA

| Aspect       | Figma Prototype                                                                       | Local GUI                                  | Severity   |
| ------------ | ------------------------------------------------------------------------------------- | ------------------------------------------ | ---------- |
| Product name | `OLSK Large 3D Printer – Assembled`                                                   | `jgjyg` (garbage test data)                | **High**   |
| Product ID   | `IFR-PRD-0078` displayed                                                              | Not displayed at all                       | **Medium** |
| Status badge | `Available for Purchase` (green text)                                                 | `Available` (white text on badge)          | **Low**    |
| Breadcrumb   | `Products / 3D Printers / OLSK Large 3D Printer – Assembled` (3 levels with category) | `Products / jgjyg` (2 levels, no category) | **Medium** |

---

## 2. ACTION BUTTONS (Header Area)

| Aspect             | Figma Prototype                                 | Local GUI                             | Severity         |
| ------------------ | ----------------------------------------------- | ------------------------------------- | ---------------- |
| Like button        | ✅ Present — `1.2k` with heart icon             | ❌ Missing                            | **Medium**       |
| Share button       | ✅ Present — styled white button with border    | ❌ Missing                            | **Medium**       |
| Edit button        | ✅ Present — styled white button with border    | ✅ Present — but only as a plain link | **Low** (visual) |
| Button duplication | Appears in both the hero and the top header bar | Only in the main content area         | **Low**          |

---

## 3. IMAGE GALLERY

| Aspect             | Figma Prototype                                       | Local GUI                                 | Severity     |
| ------------------ | ----------------------------------------------------- | ----------------------------------------- | ------------ |
| Main product image | ✅ Present (Unsplash photo) with prev/next navigation | ❌ **Missing entirely** — empty container | **Critical** |
| Image counter      | `1 / 4` shown                                         | ❌ Missing                                | **Medium**   |
| Thumbnails         | 4 thumbnails with click-to-select                     | ❌ Missing                                | **High**     |
| Gallery navigation | Previous image / Next image buttons                   | ❌ Missing                                | **High**     |

---

## 4. PRICE & AVAILABILITY SECTION

| Aspect            | Figma Prototype                                                           | Local GUI                     | Severity     |
| ----------------- | ------------------------------------------------------------------------- | ----------------------------- | ------------ |
| Price display     | `€1,249.00` with flex layout and baseline alignment                       | ❌ **Entire section missing** | **Critical** |
| "estimated" label | Present below price                                                       | ❌ Missing                    | **Medium**   |
| Stock status      | `In Stock – Ships in 3–5 days` (green styled)                             | ❌ Missing                    | **Critical** |
| Disclaimer text   | `Contact the manufacturer for accurate pricing and availability details.` | ❌ Missing                    | **Low**      |

---

## 5. PRODUCT SIDEBAR (RIGHT PANEL)

### 5a. Manufacturer Card

| Aspect            | Figma Prototype                  | Local GUI               | Severity            |
| ----------------- | -------------------------------- | ----------------------- | ------------------- |
| Avatar image      | Real photo (Unsplash)            | Low-res base64 data URI | **Medium** (visual) |
| Manufacturer name | `Srfsh`                          | `ennio` (test data)     | **High** (data)     |
| Location          | `Hamburg, Germany` with map icon | ❌ Not shown            | **High**            |
| Verified badge    | ✅ Present (checkmark icon)      | ❌ Missing              | **Medium**          |
| Separator lines   | ✅ Present between sections      | ✅ Present (6 `<hr>`)   | —                   |

### 5b. Contact / Action Buttons

| Aspect               | Figma Prototype                           | Local GUI                                                       | Severity         |
| -------------------- | ----------------------------------------- | --------------------------------------------------------------- | ---------------- |
| Contact Manufacturer | Filled yellow `<button>`, dark text       | Yellow, but styled as `<a>` link (`mailto:`)                    | **Low** (visual) |
| Visit Store          | ✅ Active `<a>` link with external URL    | ❌ **Disabled** `<button>` (`opacity-40`, `cursor-not-allowed`) | **High**         |
| Save to My Projects  | ✅ Present                                | ✅ Present                                                      | —                |
| Watch Project        | ✅ Present                                | ✅ Present                                                      | —                |
| Based on design      | `OLSK Large 3D Printer` (green highlight) | `prova design` (test data)                                      | **High** (data)  |

---

## 6. MAIN CONTENT PANEL SECTIONS (Left Side, Collapsible Panels)

### Section-by-section comparison

| Section                         | Figma Prototype                                                                     | Local GUI                                                 | Severity          |
| ------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------------- |
| **Product Overview**            | ✅ Full description + materials list + tags                                         | ⚠️ Garbage text (`hugi iuhi iuui`), no materials, no tags | **Critical**      |
| **Sustainability**              | ✅ Energy (450 kWh), Recyclability (78%), CO₂ (32 kg), Recyclable/Repairable badges | ❌ **Missing entirely**                                   | **Critical**      |
| **Manufacturing Locations**     | ✅ 2 locations with addresses (FabLab Hamburg, Open Workshop Milano)                | ❌ **Missing entirely**                                   | **Critical**      |
| **Recycling Information**       | ✅ Description + 2 recycling center addresses                                       | ❌ **Missing entirely**                                   | **High**          |
| **Repair Information**          | ✅ Description + 3 repair center addresses                                          | ❌ **Missing entirely**                                   | **High**          |
| **From the Open Source Design** | ✅ Shows parent design card with View Design button                                 | ❌ **Missing entirely**                                   | **High**          |
| **Included Projects**           | ✅ 2 projects with thumbnails, IDs, View Design/Service links                       | ⚠️ Shows count "(3)" but different content                | **Medium**        |
| **Community Contributions**     | ✅ 4 contributors                                                                   | ⚠️ Present but empty content                              | **Medium**        |
| **Digital Product Passports**   | ✅ 3 DPPs (Batch & Unit) with dates and View DPP links                              | ❌ **Missing entirely**                                   | **Critical**      |
| **Reviews**                     | ❌ Not present                                                                      | ✅ Present — "Post a review", empty state                 | **Extra feature** |

### 6a. Product Overview Details

| Sub-item             | Figma Prototype                                                                                         | Local GUI                     | Severity     |
| -------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------- | ------------ |
| Description text     | Full multi-paragraph real content                                                                       | Garbage text `hugi iuhi iuui` | **Critical** |
| "Show more" toggle   | ✅ Expandable                                                                                           | ❌ Not needed (text is short) | **Low**      |
| Materials list       | 6 items: PLA filament, Aluminum frame 6063-T5, Steel rods, PETG brackets, TMC2209 drivers, 32-bit board | ❌ Missing                    | **Critical** |
| Materials disclaimer | "Materials are inherited from the parent Design. See the full bill of materials."                       | ❌ Missing                    | **Medium**   |
| Tags                 | 6 tags: `3d-printer`, `assembled`, `open-hardware`, `large-format`, `FDM`, `dual-extrusion`             | ❌ Missing                    | **Critical** |

### 6b. Sustainability Details (All Missing from Local)

| Metric             | Figma Prototype | Local GUI |
| ------------------ | --------------- | --------- |
| Energy Consumption | `450 kWh`       | ❌        |
| Recyclability      | `78%`           | ❌        |
| CO₂ Emissions      | `32 kg CO₂`     | ❌        |
| Recyclable badge   | ✅              | ❌        |
| Repairable badge   | ✅              | ❌        |

### 6c. Digital Product Passports (All Missing from Local)

| DPP     | Type  | ID                | Published   |
| ------- | ----- | ----------------- | ----------- |
| DPP-001 | Batch | `BATCH-2024-003A` | 15 Jan 2024 |
| DPP-002 | Unit  | `SN-78234-001`    | 20 Jan 2024 |
| DPP-003 | Batch | `BATCH-2024-007B` | 03 Feb 2024 |

---

## 7. SIDEBAR NAVIGATION (Left Panel)

| Item          | Figma Prototype                    | Local GUI                 | Severity                |
| ------------- | ---------------------------------- | ------------------------- | ----------------------- |
| Notifications | `Notifications 24`                 | `Notifications 3`         | **Low** (data)          |
| Saved Lists   | `Saved Lists 5` (with count badge) | `Saved Lists` (no count)  | **Medium** (visual)     |
| My Drafts     | `My Drafts` (capital D)            | `My drafts` (lowercase d) | **Low** (inconsistency) |
| Track Record  | ✅ Present                         | ✅ Present                | —                       |
| DPPs          | ✅ Present in sidebar              | ✅ Present in sidebar     | —                       |
| User avatar   | Real photo                         | Low-res base64 data URI   | **Low** (visual)        |
| Username      | `Srfsh` / `@srfsh`                 | `ennio` / `@ennio`        | **Low** (data)          |

---

## 8. FOOTER

| Aspect            | Figma Prototype                                                                        | Local GUI                              | Severity                     |
| ----------------- | -------------------------------------------------------------------------------------- | -------------------------------------- | ---------------------------- |
| Copyright year    | `© 2026` (space after ©)                                                               | `©2023` (no space after ©, wrong year) | **Medium**                   |
| "Software by"     | `dyne.org` (text)                                                                      | `Dyne.org Logo` (SVG image)            | **Low** (visual)             |
| GitHub link       | `GitHub` (capital H)                                                                   | `Github` (lowercase h)                 | **Low** (typo)               |
| EU logo           | Text: "EU logo", "EUROPÄISCHE UNION", "Europäischer Fonds / für regionale Entwicklung" | Proper SVG logo image (`logo-eu.svg`)  | **Medium** (better in local) |
| Hamburg logo      | Text: "Hamburg", "Behörde für Wirtschaft / und Innovation"                             | Proper SVG image (`logo-bwi.svg`)      | **Medium** (better in local) |
| Help heading      | `HELP` (uppercase)                                                                     | `Help pages` (mixed case)              | **Low**                      |
| Link destinations | All go to `#` (placeholder)                                                            | Real URLs (actual links)               | **Medium** (better in local) |

---

## 9. SUMMARY TABLE — CRITICAL & HIGH SEVERITY

| #   | Issue                                                      | Severity     | Category           |
| --- | ---------------------------------------------------------- | ------------ | ------------------ |
| 1   | Product image gallery missing entirely                     | **Critical** | Feature gap        |
| 2   | Price section missing entirely                             | **Critical** | Feature gap        |
| 3   | Stock/availability status missing                          | **Critical** | Feature gap        |
| 4   | Sustainability section missing                             | **Critical** | Feature gap        |
| 5   | Manufacturing Locations section missing                    | **Critical** | Feature gap        |
| 6   | Digital Product Passports section missing                  | **Critical** | Feature gap        |
| 7   | Product overview description is garbage test data          | **Critical** | Data quality       |
| 8   | Materials list not displayed                               | **Critical** | Feature gap        |
| 9   | Tags not displayed                                         | **Critical** | Feature gap        |
| 10  | Recycling Information section missing                      | **High**     | Feature gap        |
| 11  | Repair Information section missing                         | **High**     | Feature gap        |
| 12  | "From the Open Source Design" card missing                 | **High**     | Feature gap        |
| 13  | Manufacturer location not displayed                        | **High**     | Feature gap        |
| 14  | Visit Store button disabled                                | **High**     | Bug/Feature gap    |
| 15  | Missing like (1.2k) and share buttons                      | **Medium**   | Feature gap        |
| 16  | No product ID displayed in product page                    | **Medium**   | Feature gap        |
| 17  | Breadcrumb missing category level (`3D Printers`)          | **Medium**   | Data/Feature       |
| 18  | Copyright year is 2023 instead of 2026                     | **Medium**   | Bug                |
| 19  | "My Drafts" inconsistent capitalization                    | **Low**      | Polish             |
| 20  | "GitHub" capitalization typo in footer                     | **Low**      | Polish             |
| 21  | Contact Manufacturer is `<a>` link instead of `<button>`   | **Low**      | Visual consistency |
| 22  | Reviews section exists in local but not in Figma prototype | **Extra**    | Scope question     |

---

## 10. KEY ARCHITECTURAL OBSERVATIONS

### Sections that need to be BUILT (don't exist in the current GUI at all):

1. **Image Gallery** — needs carousel with main image, thumbnails, prev/next navigation
2. **Price & Availability Panel** — needs price + estimated label + stock status + disclaimer
3. **Sustainability Metrics** — needs energy consumption, recyclability, CO₂, and badge indicators
4. **Manufacturing Locations** — needs location cards with map icons and addresses
5. **Recycling Information** — needs description text and recycling center cards
6. **Repair Information** — needs description text and repair center cards
7. **From the Open Source Design** — needs parent design card with thumbnail and "View Design" link
8. **Digital Product Passports** — needs DPP cards with batch/unit type, ID, publish date, and "View DPP" link

### Sections that need DATA POPULATION (exist structurally but have wrong/missing data):

1. **Product Name/Title** — currently `jgjyg`, needs actual product name
2. **Description** — currently `hugi iuhi iuui`, needs real description + expandable "Show more"
3. **Materials List** — needs 6 material items
4. **Tags** — needs 6 tag chips
5. **Product ID** — needs `IFR-PRD-XXXX` display
6. **Breadcrumb** — needs category level between Products and product name
7. **Manufacturer Card** — needs photo, location, verified badge
8. **Included Projects** — needs actual project data with thumbnails
9. **Community Contributions** — needs contributor data

### Sections that need FIXING:

1. **Visit Store** — button should not be disabled; needs a store URL
2. **Like & Share buttons** — need to be added to the action bar
3. **Copyright year** — should be 2026, not 2023
4. **"GitHub"** — should be "GitHub" not "Github"

### Extraneous section (may need evaluation):

1. **Reviews** — present in local but not in Figma prototype. Decide whether to keep or remove.
