import React from "react";
import { ScissorsIcon, CheckCircle2Icon } from "lucide-react";
import { amountToWordsBDT, formatBDT, formatDisplayDate } from "@/lib/utils";

export interface InvoiceSheetProps {
  headerTitle: string;
  headerSubtitle: string;
  headerMeta: string;
  onHeaderChange?: (field: "title" | "subtitle" | "meta", value: string) => void;
  invoiceNumber: string;
  studentCode: string;
  studentName: string;
  studentPhone: string;
  course: string;
  amount: number | string;
  paymentDate: string;
  paymentMethod: string;
  notes: string;
  isSaved: boolean;
}

export const InvoiceSheet: React.FC<InvoiceSheetProps> = ({
  headerTitle,
  headerSubtitle,
  headerMeta,
  onHeaderChange,
  invoiceNumber,
  studentCode,
  studentName,
  studentPhone,
  course,
  amount,
  paymentDate,
  paymentMethod,
  notes,
  isSaved,
}) => {
  const numericAmount = Number(amount) || 0;
  const formattedBDT = formatBDT(numericAmount);
  const amountWords = amountToWordsBDT(numericAmount);
  const displayDate = formatDisplayDate(paymentDate);
  const displayReceiptNo = invoiceNumber || "UNSAVED-DRAFT";

  return (
    <div className="a4-sheet rounded-sm border border-zinc-300 shadow-2xl font-sans text-zinc-950 select-none print:shadow-none print:border-0">
      {/* =====================================================================
          TOP 75% — STUDENT COPY (222.75mm on A4)
         ===================================================================== */}
      <section
        aria-label="Student Copy"
        className="h-[75%] w-full px-11 pt-10 pb-7 flex flex-col justify-between box-border relative bg-white"
      >
        <div>
          {/* Top Header Row: Editable Organization Branding + Copy Badge */}
          <div className="flex items-start justify-between gap-6 pb-5 border-b-2 border-zinc-950">
            <div className="flex-1 min-w-0">
              <input
                type="text"
                aria-label="Organization or Institution Name"
                value={headerTitle}
                onChange={(e) => onHeaderChange?.("title", e.target.value)}
                placeholder="CLICK TO TYPE INSTITUTION NAME"
                className="w-full text-[22px] font-bold tracking-tight text-zinc-950 bg-transparent border-0 border-b border-transparent hover:border-zinc-300 focus:border-zinc-950 focus:outline-none p-0 placeholder:text-zinc-300 uppercase"
              />
              <input
                type="text"
                aria-label="Organization Address or Subtitle"
                value={headerSubtitle}
                onChange={(e) => onHeaderChange?.("subtitle", e.target.value)}
                placeholder="Click to type campus address, branch, or tagline..."
                className="w-full text-xs font-medium text-zinc-600 mt-1 bg-transparent border-0 border-b border-transparent hover:border-zinc-300 focus:border-zinc-950 focus:outline-none p-0 placeholder:text-zinc-300"
              />
              <input
                type="text"
                aria-label="Organization Contact Details"
                value={headerMeta}
                onChange={(e) => onHeaderChange?.("meta", e.target.value)}
                placeholder="Click to type phone, email, or website..."
                className="w-full text-[11px] text-zinc-500 mt-0.5 bg-transparent border-0 border-b border-transparent hover:border-zinc-300 focus:border-zinc-950 focus:outline-none p-0 placeholder:text-zinc-300 font-mono"
              />
            </div>

            <div className="text-right shrink-0 flex flex-col items-end">
              <div className="inline-flex items-center gap-1.5 bg-zinc-950 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] rounded-xs">
                Student Copy
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mt-2">
                Payment Receipt / Invoice
              </span>
              <span className="font-mono text-xs font-bold text-zinc-900 mt-0.5">
                {displayReceiptNo}
              </span>
            </div>
          </div>

          {/* 4-Column Metadata Strip */}
          <div className="grid grid-cols-4 divide-x divide-zinc-200 border-b border-zinc-200 bg-zinc-50/70">
            <div className="py-2.5 px-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 block">
                Receipt Number
              </span>
              <span className="font-mono text-xs font-bold text-zinc-950 mt-0.5 block">
                {displayReceiptNo}
              </span>
            </div>
            <div className="py-2.5 px-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 block">
                Payment Date
              </span>
              <span className="text-xs font-semibold text-zinc-950 mt-0.5 block">
                {displayDate || "—"}
              </span>
            </div>
            <div className="py-2.5 px-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 block">
                Payment Method
              </span>
              <span className="text-xs font-semibold text-zinc-950 mt-0.5 block">
                {paymentMethod || "Cash"}
              </span>
            </div>
            <div className="py-2.5 px-3 text-right">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 block">
                Currency / Status
              </span>
              <span className="font-mono text-xs font-bold text-zinc-950 mt-0.5 inline-flex items-center gap-1">
                BDT (Taka) • {isSaved ? "PAID" : "READY"}
              </span>
            </div>
          </div>

          {/* Billed To (Student Details Card) */}
          <div className="mt-5 rounded-md border border-zinc-300 bg-white p-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2.5">
              Received From (Student Details)
            </div>
            <div className="grid grid-cols-12 gap-4 items-baseline">
              <div className="col-span-6">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block">
                  Student Full Name
                </span>
                <span className="text-base font-bold text-zinc-950 block mt-0.5">
                  {studentName || "—"}
                </span>
              </div>
              <div className="col-span-3">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block">
                  Student ID / Code
                </span>
                <span className="font-mono text-xs font-semibold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded inline-block mt-0.5 border border-zinc-200">
                  {studentCode || "AUTO-ID"}
                </span>
              </div>
              <div className="col-span-3 text-right">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block">
                  Phone Number
                </span>
                <span className="font-mono text-xs font-semibold text-zinc-900 block mt-0.5">
                  {studentPhone || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Fee Particulars Table */}
          <div className="mt-5 border border-zinc-300 rounded-md overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-zinc-950 text-white text-left text-[10px] font-bold uppercase tracking-widest">
                  <th className="py-2.5 px-3.5 w-12">SL</th>
                  <th className="py-2.5 px-3.5">Course / Fee Particulars</th>
                  <th className="py-2.5 px-3.5 text-right w-44">Amount (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-sm bg-white">
                <tr>
                  <td className="py-5 px-3.5 font-mono text-xs text-zinc-500 align-top">
                    01
                  </td>
                  <td className="py-5 px-3.5 align-top">
                    <div className="font-bold text-[15px] text-zinc-950 leading-snug">
                      {course || "—"}
                    </div>
                    {notes ? (
                      <div className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
                        <span className="font-semibold text-zinc-700">
                          Remarks:{" "}
                        </span>
                        {notes}
                      </div>
                    ) : (
                      <div className="text-[11px] text-zinc-400 mt-1">
                        Course tuition / registration fee payment
                      </div>
                    )}
                  </td>
                  <td className="py-5 px-3.5 font-mono font-bold text-base text-right text-zinc-950 tabular-nums align-top">
                    {formattedBDT}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-zinc-950 bg-zinc-50">
                  <td
                    colSpan={2}
                    className="py-3 px-3.5 text-right text-xs font-bold uppercase tracking-wider text-zinc-700"
                  >
                    Total Received Amount
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-lg text-zinc-950 tabular-nums">
                    {formattedBDT}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Amount in Words Bar */}
          <div className="mt-3 rounded-md border border-zinc-200 bg-zinc-50 px-3.5 py-2 flex items-center justify-between text-xs">
            <div className="truncate pr-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mr-2">
                Amount in Words:
              </span>
              <span className="font-semibold text-zinc-900 italic">
                {amountWords}
              </span>
            </div>
            <div className="shrink-0 flex items-center gap-1 font-mono text-[11px] font-bold uppercase text-zinc-800">
              <CheckCircle2Icon className="size-3.5 text-zinc-900" />
              <span>{isSaved ? "Verified D1 Record" : "Received"}</span>
            </div>
          </div>
        </div>

        {/* Signatures Footer at Bottom of 75% Student Copy */}
        <div className="pt-4">
          <div className="grid grid-cols-12 gap-8 items-end">
            <div className="col-span-4 text-center">
              <div className="border-t border-zinc-400 pt-1.5 text-[11px] font-medium text-zinc-600">
                Student / Guardian Signature
              </div>
            </div>
            <div className="col-span-4 text-center">
              <div className="text-[10px] text-zinc-400 font-mono">
                Thank you for your payment
              </div>
            </div>
            <div className="col-span-4 text-center">
              <div className="border-t-2 border-zinc-950 pt-1.5 text-[11px] font-bold text-zinc-950 uppercase tracking-wider">
                Authorized Signature
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          EXACT 75% CUT LINE DIVIDER
         ===================================================================== */}
      <div
        aria-hidden="true"
        className="relative w-full border-t-2 border-dashed border-zinc-400 flex items-center justify-center h-0 z-10"
      >
        <span className="bg-white px-3 py-0.5 border border-zinc-300 rounded-full text-[9px] font-mono font-semibold uppercase tracking-[0.18em] text-zinc-600 flex items-center gap-1.5">
          <ScissorsIcon className="size-3 text-zinc-600" />
          Cut Along 75% Line — Office Copy (25%)
        </span>
      </div>

      {/* =====================================================================
          BOTTOM 25% — OFFICE COPY (74.25mm on A4)
         ===================================================================== */}
      <section
        aria-label="Office Copy"
        className="h-[25%] w-full px-11 py-5 flex flex-col justify-between bg-zinc-50/60 box-border"
      >
        {/* Office Copy Top Strip */}
        <div className="flex items-center justify-between border-b border-zinc-300 pb-2">
          <div className="flex items-center gap-2.5">
            <span className="bg-zinc-950 text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] rounded-xs">
              Office Copy
            </span>
            <span className="font-bold text-xs text-zinc-900 uppercase tracking-tight truncate max-w-[260px]">
              {headerTitle || "INSTITUTION OFFICE RECORD"}
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs">
            <div>
              <span className="text-zinc-500 text-[10px] mr-1">RECEIPT:</span>
              <span className="font-bold text-zinc-950">{displayReceiptNo}</span>
            </div>
            <span className="text-zinc-300">|</span>
            <div>
              <span className="text-zinc-500 text-[10px] mr-1">DATE:</span>
              <span className="font-sans font-semibold text-zinc-900">
                {displayDate || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Office Copy 3-Column Voucher Body */}
        <div className="grid grid-cols-12 gap-4 my-auto py-2 items-center">
          <div className="col-span-4 border-r border-zinc-200 pr-3">
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">
              Student Name & ID
            </span>
            <span className="font-bold text-sm text-zinc-950 block truncate mt-0.5">
              {studentName || "—"}
            </span>
            <span className="font-mono text-[11px] text-zinc-600 block mt-0.5 truncate">
              {studentCode || "AUTO-ID"}{" "}
              {studentPhone ? `• ${studentPhone}` : ""}
            </span>
          </div>

          <div className="col-span-5 border-r border-zinc-200 pr-3">
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">
              Course / Particulars
            </span>
            <span className="font-semibold text-sm text-zinc-950 block truncate mt-0.5">
              {course || "—"}
            </span>
            <span className="text-[11px] text-zinc-500 block truncate mt-0.5">
              {notes ? `Note: ${notes}` : `Method: ${paymentMethod || "Cash"}`}
            </span>
          </div>

          <div className="col-span-3 text-right">
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">
              Total Received ({paymentMethod || "Cash"})
            </span>
            <span className="font-mono font-bold text-base text-zinc-950 tabular-nums block mt-0.5">
              {formattedBDT}
            </span>
            <span className="text-[10px] font-mono text-zinc-500 block">
              BDT / Taka
            </span>
          </div>
        </div>

        {/* Office Copy Bottom Signatures */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-300 text-[10px] font-mono text-zinc-600">
          <span>Depositor Sign: ________________________</span>
          <span className="font-semibold text-zinc-800">
            Cashier / Office Sign: ________________________
          </span>
        </div>
      </section>
    </div>
  );
};
