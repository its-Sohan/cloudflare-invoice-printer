import React, { useEffect, useRef, useState } from "react";
import { FilePlus2Icon, PrinterIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InvoiceSheet } from "@/components/InvoiceSheet";

const PAYMENT_METHODS = ["Cash", "bKash", "Nagad", "Bank Transfer", "Card"];

function getToday(): string {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

export function App() {
  const formRef = useRef<HTMLFormElement | null>(null);

  const [receiptNumber, setReceiptNumber] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(getToday);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [notes, setNotes] = useState("");

  const handlePrint = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formRef.current?.reportValidity()) return;
    window.print();
  };

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p") {
        event.preventDefault();
        formRef.current?.requestSubmit();
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const handleClear = () => {
    setReceiptNumber("");
    setDescription("");
    setAmount("");
    setPaymentDate(getToday());
    setPaymentMethod("Cash");
    setNotes("");
  };

  return (
    <div className="app-shell min-h-screen bg-zinc-100 print-shell">
      <header className="no-print flex h-16 items-center justify-between border-b bg-white px-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-zinc-950 text-white">
            <PrinterIcon className="size-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Receipt Printer</h1>
            <p className="text-xs text-zinc-500">Write a receipt. Print when ready.</p>
          </div>
        </div>
        <Button type="submit" form="receipt-form" size="sm">
          <PrinterIcon data-icon="inline-start" />
          Print receipt
        </Button>
      </header>

      <main className="app-content grid min-h-[calc(100vh-4rem)] grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="no-print flex flex-col border-r bg-white">
          <form
            id="receipt-form"
            ref={formRef}
            onSubmit={handlePrint}
            className="flex flex-1 flex-col"
          >
            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              <div className="space-y-3">
                <div>
                  <h2 className="text-sm font-semibold">Receipt details</h2>
                  <p className="mt-1 text-xs text-zinc-500">Mehrima English & IT details are included automatically.</p>
                </div>
                <div className="space-y-3">
                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium text-zinc-700">Receipt number <span className="font-normal text-zinc-400">(optional)</span></span>
                    <Input
                      value={receiptNumber}
                      onChange={(event) => setReceiptNumber(event.target.value)}
                      placeholder="Enter a receipt number"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-zinc-700">Date</span>
                      <Input
                        type="date"
                        value={paymentDate}
                        onChange={(event) => setPaymentDate(event.target.value)}
                        required
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-zinc-700">Payment method</span>
                      <select
                        value={paymentMethod}
                        onChange={(event) => setPaymentMethod(event.target.value)}
                        className="h-8 w-full rounded-lg border border-input bg-white px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        {PAYMENT_METHODS.map((method) => (
                          <option key={method} value={method}>{method}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium text-zinc-700">Description</span>
                    <Textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="What is this payment for?"
                      className="min-h-20 resize-y"
                      required
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium text-zinc-700">Amount (BDT)</span>
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium text-zinc-700">Notes <span className="font-normal text-zinc-400">(optional)</span></span>
                    <Textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Add any extra details"
                      className="min-h-16 resize-y"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t bg-zinc-50 p-5">
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  <PrinterIcon data-icon="inline-start" />
                  Print receipt
                </Button>
                <Button type="button" variant="outline" onClick={handleClear} aria-label="Clear receipt details">
                  <FilePlus2Icon />
                  Clear
                </Button>
              </div>
              <p className="text-center text-[11px] leading-relaxed text-zinc-500">
                Nothing is saved or uploaded. Use Ctrl+P or Cmd+P to print.
              </p>
            </div>
          </form>
        </aside>

        <section className="print-stage min-w-0 overflow-auto bg-dot-grid p-6 lg:p-10">
          <div className="print-scale-reset flex min-w-max justify-center">
            <InvoiceSheet
              receiptNumber={receiptNumber}
              description={description}
              amount={amount}
              paymentDate={paymentDate}
              paymentMethod={paymentMethod}
              notes={notes}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
