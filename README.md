# Cloudflare D1 Student Invoice & Receipt Printer

A fast, zero-bloat student fee receipt and invoice printer built with **React + Vite + Tailwind CSS + shadcn/ui** and hosted on **Cloudflare Workers + Cloudflare D1 (SQLite)**.

## Features
- **A4 75% / 25% Split Layout**:
  - **Top 75%**: Detailed **Student Copy** with editable header, Receipt #, Date, Student Name & ID, Course, Amount in **BDT (Taka)**, Amount in Words, and Signatures.
  - **75% Cut Line**: Dashed horizontal cut line (`✂ Cut along 75% line`).
  - **Bottom 25%**: Compact **Office Copy** stub for filing.
- **`Ctrl+P` Auto-Save & Print**: Pressing `Ctrl+P` (or `Cmd+P`) saves the student and invoice directly to Cloudflare D1, stamps the generated Receipt # (`INV-YYYYMMDD-XXXX`) onto both copies, and opens the browser print dialog.
- **Registered Student Picker**: Search and pick existing students from D1 to auto-fill their details, or type a new student's name to register them automatically.
- **Passkey Protection**: Protected by passkey (`password123` by default, configurable via `PASSKEY` in [wrangler.jsonc](file:///home/sohan/.gemini/antigravity/scratch/cloudflare-invoice-printer/wrangler.jsonc)).

## Local Development

1. **Initialize Local D1 Database**:
   ```bash
   npm run db:init:local
   ```
2. **Build & Start Local Cloudflare Worker + D1**:
   ```bash
   npm start
   ```
   Open `http://localhost:8787` and unlock with `password123`.

## Deploying to Cloudflare

1. **Create your production D1 database**:
   ```bash
   npx wrangler d1 create invoice_db
   ```
2. Copy the returned `database_id` into [wrangler.jsonc](file:///home/sohan/.gemini/antigravity/scratch/cloudflare-invoice-printer/wrangler.jsonc).
3. **Apply the schema to remote D1**:
   ```bash
   npm run db:init:remote
   ```
4. **Deploy**:
   ```bash
   npm run deploy
   ```
