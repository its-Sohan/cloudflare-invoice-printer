import React from "react";
import { amountToWordsBDT, formatBDT, formatDisplayDate } from "@/lib/utils";

export interface InvoiceSheetProps {
  receiptNumber: string;
  description: string;
  amount: number | string;
  paymentDate: string;
  paymentMethod: string;
  notes: string;
}

const BUSINESS_DETAILS = {
  name: "Mehrima English & IT",
  address: "Level#3, 20/1 Holy Homes Plaza, College Road, Tongi-1711, Gazipur, Bangladesh.",
  contact: "+880 1930-976074",
  email: "contact@mehrima-skill-development.com",
  website: "mehrima-skill-development.com",
};

export const InvoiceSheet: React.FC<InvoiceSheetProps> = ({
  receiptNumber,
  description,
  amount,
  paymentDate,
  paymentMethod,
  notes,
}) => {
  const numericAmount = Number(amount) || 0;
  const formattedAmount = formatBDT(numericAmount);
  const amountWords = amountToWordsBDT(numericAmount);
  const displayDate = formatDisplayDate(paymentDate);
  const displayReceiptNumber = receiptNumber.trim() || "—";

  return (
    <div className="a4-sheet font-sans text-zinc-950 print:border-0">
      <section
        aria-label="Customer copy"
        className="flex h-[75%] w-full flex-col justify-between bg-white px-12 pb-8 pt-10"
      >
        <div>
          <header className="flex items-start justify-between gap-8 border-b border-zinc-400 pb-5">
            <div className="min-w-0 flex-1">
              <h1 className="wrap-break-word text-[22px] font-semibold tracking-tight">
                {BUSINESS_DETAILS.name}
              </h1>
              <p className="mt-1 text-xs text-zinc-600">{BUSINESS_DETAILS.address}</p>
              <p className="mt-1 text-[11px] text-zinc-500">
                {BUSINESS_DETAILS.contact} · {BUSINESS_DETAILS.email} · {BUSINESS_DETAILS.website}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <h2 className="text-lg font-semibold uppercase tracking-[0.08em]">
                Payment Receipt
              </h2>
              <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                Receipt No.
              </p>
              <p className="font-mono text-sm font-semibold">{displayReceiptNumber}</p>
            </div>
          </header>

          <div className="mt-4 grid grid-cols-2 gap-8 border-b border-zinc-200 pb-3">
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Date</span>
              <p className="mt-0.5 text-sm font-medium">{displayDate || "—"}</p>
            </div>
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Payment method</span>
              <p className="mt-0.5 text-sm font-medium">{paymentMethod || "Cash"}</p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-8 border-b border-zinc-300 pb-7">
            <div className="min-w-0">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Payment received for
              </h3>
              <p className="mt-2 whitespace-pre-wrap wrap-break-word text-base leading-relaxed">
                {description || "—"}
              </p>
              {notes && (
                <p className="mt-3 whitespace-pre-wrap wrap-break-word text-xs leading-relaxed text-zinc-600">
                  <span className="font-medium text-zinc-700">Note: </span>{notes}
                </p>
              )}
            </div>
            <div className="min-w-44 text-right">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Amount received
              </h3>
              <p className="mt-2 font-mono text-xl font-semibold tabular-nums">
                {formattedAmount}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <span className="mr-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Amount in words
            </span>
            <span className="text-xs font-medium text-zinc-800">{amountWords}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-16 px-2 text-center">
          <div className="border-t border-zinc-400 pt-2 text-[11px] text-zinc-600">
            Payer / Depositor Signature
          </div>
          <div className="border-t border-zinc-400 pt-2 text-[11px] text-zinc-600">
            Authorized Signature
          </div>
        </div>
      </section>

      <div
        aria-hidden="true"
        className="relative z-10 flex h-0 w-full items-center justify-center border-t border-dashed border-zinc-400"
      >
        <span className="bg-white px-3 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
          Detach — Office Copy
        </span>
      </div>

      <section
        aria-label="Office copy"
        className="flex h-[25%] w-full flex-col justify-between bg-white px-12 py-5"
      >
        <header className="flex items-center justify-between gap-4 border-b border-zinc-300 pb-2">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-zinc-500">
              Office copy
            </p>
            <p className="mt-0.5 truncate text-xs font-semibold">{BUSINESS_DETAILS.name}</p>
          </div>
          <div className="shrink-0 text-right text-[10px]">
            <p><span className="text-zinc-500">Receipt No. </span><span className="font-mono font-semibold">{displayReceiptNumber}</span></p>
            <p className="mt-0.5"><span className="text-zinc-500">Date </span><span className="font-medium">{displayDate || "—"}</span></p>
          </div>
        </header>

        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 py-3">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">Payment for</p>
            <p className="mt-1 whitespace-pre-wrap wrap-break-word text-xs font-medium leading-snug">
              {description || "—"}
            </p>
            <p className="mt-1 truncate text-[10px] text-zinc-500">
              Method: {paymentMethod || "Cash"}{notes ? ` · ${notes}` : ""}
            </p>
          </div>
          <div className="border-l border-zinc-200 pl-6 text-right">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">Amount received</p>
            <p className="mt-1 font-mono text-sm font-semibold tabular-nums">{formattedAmount}</p>
          </div>
        </div>

        <footer className="flex items-center justify-between border-t border-zinc-300 pt-2 text-[9px] text-zinc-500">
          <span>Received by: ____________________</span>
          <span>Verified by: ____________________</span>
        </footer>
      </section>
    </div>
  );
};
