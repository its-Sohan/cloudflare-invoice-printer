# Simple Receipt Printer

A lightweight receipt-writing and printing app built with React, Vite, Tailwind CSS, and Cloudflare Workers.

## What it does

- Edit your business name, address, contact details, receipt number, date, payment method, description, amount, and optional notes.
- Preview a two-part A4 receipt with customer and office copies.
- Print from the button or with **Ctrl+P** / **Cmd+P**.
- No login, database, history, saving, or uploading. Receipt data only lives in the page while it is open.

## Local development

Run the Vite development server:

```bash
npm run dev
```

Or build and run the Cloudflare Worker locally:

```bash
npm start
```

## Deploying to Cloudflare

```bash
npm run deploy
```
