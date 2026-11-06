import React from "react";
import { ScissorsIcon } from "lucide-react";
import defaultLogo from "@/assets/logo.png";
import { amountToWordsBDT, cn, formatBDT, formatDisplayDate } from "@/lib/utils";

export interface InvoiceLineItem {
  description: string;
  amount: number | string;
}

export interface InvoiceSheetProps {
  receiptNumber: string;
  studentName: string;
  studentBatch: string;
  subject: string;
  items: InvoiceLineItem[];
  paymentDate: string;
  paymentMethod: string;
  notes: string;
  logoUrl?: string;
}

const BUSINESS_DETAILS = {
  name: "Mehrima English & IT",
  address: "Level#3, 20/1 Holy Homes Plaza, College Road, Tongi-1711, Gazipur, Bangladesh.",
  contact: "+880 1930-976074",
  email: "contact@mehrima-skill-development.com",
  website: "mehrima-skill-development.com",
};

/** Shared eyebrow label style used across the sheet. */
const LABEL = "text-[8px] font-semibold uppercase leading-none tracking-[0.14em] text-zinc-500";

const Field: React.FC<{
  label: string;
  value: React.ReactNode;
  className?: string;
  valueClassName?: string;
}> = ({ label, value, className, valueClassName }) => (
  <div className={cn("min-w-0", className)}>
    <dt className={LABEL}>{label}</dt>
    <dd className={cn("mt-1.5 wrap-break-word text-[10pt] font-medium leading-snug text-zinc-950", valueClassName)}>
      {value}
    </dd>
  </div>
);

const SignatureLine: React.FC<{ label: string; className?: string }> = ({ label, className }) => (
  <div className={cn("border-t border-zinc-950 pt-1.5", className)}>
    <p className={LABEL}>{label}</p>
  </div>
);

export const InvoiceSheet: React.FC<InvoiceSheetProps> = ({
  receiptNumber,
  studentName,
  studentBatch,
  subject,
  items,
  paymentDate,
  paymentMethod,
  notes,
  logoUrl,
}) => {
  const resolvedLogo = logoUrl || defaultLogo;
  const safeItems = items.length > 0 ? items : [{ description: "", amount: 0 }];
  const totalAmount = safeItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const formattedTotal = formatBDT(totalAmount);
  const amountWords = amountToWordsBDT(totalAmount);
  const displayDate = formatDisplayDate(paymentDate) || "—";
  const displayReceiptNumber = receiptNumber.trim() || "—";
  const method = paymentMethod || "Cash";
  const officeSummary =
    safeItems
      .map((item) => item.description.trim())
      .filter(Boolean)
      .join("\n") || "—";

  return (
    <div className="a4-sheet font-sans text-zinc-950 print:border-0">
      {/* ───────────── Customer copy (75%) ───────────── */}
      <section
        aria-label="Customer copy"
        className="relative flex h-[75%] w-full flex-col overflow-hidden bg-white px-[16mm] pb-[11mm] pt-[13mm]"
      >
        {/* Background Watermark */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        >
          <img
            src={resolvedLogo}
            alt=""
            className="w-[75mm] max-w-[55%] object-contain opacity-25"
          />
        </div>

        <header className="relative z-10 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-10 border-b-2 border-zinc-950 pb-5">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <img
                src={resolvedLogo}
                alt={BUSINESS_DETAILS.name}
                className="size-10 shrink-0 object-contain"
              />
              <h1 className="font-heading wrap-break-word text-[24px] font-semibold leading-none tracking-tight">
                {BUSINESS_DETAILS.name}
              </h1>
            </div>
            <p className="mt-3 max-w-[100mm] text-[9.5px] leading-relaxed text-zinc-600">
              {BUSINESS_DETAILS.address}
            </p>
            <p className="mt-0.5 flex flex-wrap gap-x-3 text-[9.5px] leading-relaxed text-zinc-600">
              <span className="whitespace-nowrap">{BUSINESS_DETAILS.contact}</span>
              <span className="whitespace-nowrap">{BUSINESS_DETAILS.email}</span>
              <span className="whitespace-nowrap">{BUSINESS_DETAILS.website}</span>
            </p>
          </div>

          <div className="shrink-0 text-right">
            <dl className="grid grid-cols-[auto_auto] items-baseline justify-end gap-x-4 gap-y-1.5">
              <dt className={LABEL}>Receipt No.</dt>
              <dd className="font-mono text-[10pt] leading-none">{displayReceiptNumber}</dd>
              <dt className={LABEL}>Date</dt>
              <dd className="text-[10pt] font-medium leading-none">{displayDate}</dd>
            </dl>
          </div>
        </header>

        <h2 className="relative z-10 mt-6 text-center text-[20px] font-extrabold uppercase leading-none tracking-[0.16em]">
          Payment Receipt
        </h2>

        {/* Payer details */}
        <div className="relative z-10 mt-6">
          <p className={LABEL}>Received from</p>
          <p className="mt-2 wrap-break-word text-[15pt] font-semibold leading-tight tracking-tight">
            {studentName || "—"}
          </p>
          <dl className="mt-4 grid grid-cols-3 gap-6 border-t border-zinc-200 pt-3.5">
            <Field label="Batch" value={studentBatch || "—"} />
            <Field label="Subject" value={subject || "—"} />
            <Field label="Payment method" value={method} />
          </dl>
        </div>

        {/* Line item */}
        <table className="relative z-10 mt-10 w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-zinc-950">
              <th scope="col" className={cn(LABEL, "pb-2 font-semibold text-zinc-700")}>
                Description
              </th>
              <th scope="col" className={cn(LABEL, "w-[48mm] pb-2 text-right font-semibold text-zinc-700")}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {safeItems.map((item, index) => (
              <tr key={index} className="border-b border-zinc-200 align-top">
                <td className="py-3.5 pr-8">
                  <p className="whitespace-pre-wrap wrap-break-word text-[10.5pt] leading-relaxed">
                    {item.description.trim() || "—"}
                  </p>
                </td>
                <td className="py-3.5 text-right font-mono text-[10.5pt] tabular-nums">
                  {formatBDT(Number(item.amount) || 0)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-zinc-100">
              <td className="px-3 py-3 align-middle">
                <p className={LABEL}>Amount in words</p>
                <p className="mt-1.5 text-[9.5pt] font-medium leading-snug text-zinc-800">{amountWords}</p>
              </td>
              <td className="border-l-2 border-zinc-950 px-3 py-3 text-right align-middle">
                <p className={LABEL}>Total received</p>
                <p className="mt-1.5 font-mono text-[15pt] leading-none tabular-nums">{formattedTotal}</p>
              </td>
            </tr>
          </tfoot>
        </table>

        {notes && (
          <div className="relative z-10 mt-5 grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-3">
            <p className={LABEL}>Note</p>
            <p className="whitespace-pre-wrap wrap-break-word text-[9pt] leading-relaxed text-zinc-700">{notes}</p>
          </div>
        )}

        {/* Signatures pinned to the bottom of the customer copy */}
        <div className="relative z-10 mt-auto grid grid-cols-2 gap-[28mm] pt-10">
          <SignatureLine label="Payer / Depositor signature" className="text-center" />
          <SignatureLine label="Authorized signature" className="text-center" />
        </div>
      </section>

      {/* ───────────── Detach line ───────────── */}
      <div
        aria-hidden="true"
        className="relative z-10 flex h-0 w-full items-center border-t border-dashed border-zinc-400"
      >
        <span className="absolute left-[9mm] flex items-center bg-white px-1 text-zinc-400">
          <ScissorsIcon className="size-3 -rotate-90" strokeWidth={1.75} />
        </span>
        <span className="absolute left-1/2 -translate-x-1/2 bg-white px-3 text-[7.5px] font-medium uppercase tracking-[0.2em] text-zinc-400">
          Detach here · Office copy
        </span>
      </div>

      {/* ───────────── Office copy (25%) ───────────── */}
      <section
        aria-label="Office copy"
        className="flex h-[25%] w-full flex-col bg-white px-[16mm] pb-[7mm] pt-[7mm]"
      >
        <header className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-6 border-b border-zinc-950 pb-2">
          <div className="flex min-w-0 items-center gap-2">
            <img
              src={resolvedLogo}
              alt={BUSINESS_DETAILS.name}
              className="size-5 shrink-0 object-contain"
            />
            <p className="font-heading truncate text-[14.3px] font-semibold leading-none">{BUSINESS_DETAILS.name}</p>
          </div>
          <span className="shrink-0 rounded-[2.3px] border border-zinc-950 px-[6.9px] py-[3.45px] text-[8.855px] font-bold uppercase leading-none tracking-[0.16em]">
            Office copy
          </span>
          <dl className="flex shrink-0 items-baseline justify-self-end gap-5 text-[9.35pt] leading-none">
            <div className="flex items-baseline gap-2">
              <dt className={`${LABEL} text-[8.8px]`}>Receipt No.</dt>
              <dd className="font-mono">{displayReceiptNumber}</dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className={`${LABEL} text-[8.8px]`}>Date</dt>
              <dd className="font-medium">{displayDate}</dd>
            </div>
          </dl>
        </header>

        <div className="mt-3.5 grid grid-cols-[minmax(0,1fr)_52mm] items-stretch gap-6">
          <dl className="grid grid-cols-[1.5fr_1fr_1fr] content-start gap-x-5 gap-y-3">
            <Field label="Student" value={studentName || "—"} valueClassName="truncate text-[9pt] font-semibold" />
            <Field label="Batch" value={studentBatch || "—"} valueClassName="truncate text-[9pt]" />
            <Field label="Subject" value={subject || "—"} valueClassName="truncate text-[9pt]" />
            <Field
              label="Payment for"
              className="col-span-2"
              value={
                <>
                  <span className="whitespace-pre-wrap">{officeSummary}</span>
                  {notes && (
                    <span className="mt-0.5 block truncate text-[8pt] text-zinc-500">Note: {notes}</span>
                  )}
                </>
              }
              valueClassName="text-[9pt] font-normal"
            />
            <Field label="Method" value={method} valueClassName="truncate text-[9pt]" />
          </dl>

          <div className="flex flex-col justify-center border-l-2 border-zinc-950 bg-zinc-100 px-3 py-2.5 text-right">
            <p className={LABEL}>Amount received</p>
            <p className="mt-1.5 font-mono text-[13pt] leading-none tabular-nums">{formattedTotal}</p>
            <p className="mt-1.5 line-clamp-2 text-[8px] leading-snug text-zinc-600">{amountWords}</p>
          </div>
        </div>

        <footer className="mt-auto grid grid-cols-2 gap-[28mm]">
          <SignatureLine label="Received by" className="text-center" />
          <SignatureLine label="Verified by" className="text-center" />
        </footer>
      </section>
    </div>
  );
};
