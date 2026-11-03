import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Building2Icon,
  CheckCircle2Icon,
  DatabaseIcon,
  EyeIcon,
  EyeOffIcon,
  FilePlus2Icon,
  HistoryIcon,
  LockIcon,
  LogOutIcon,
  PlusIcon,
  PrinterIcon,
  RefreshCwIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  UserCheckIcon,
  UserPlusIcon,
  UsersIcon,
  ZoomInIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { InvoiceSheet } from "@/components/InvoiceSheet";
import { formatBDT, formatDisplayDate } from "@/lib/utils";

export interface StudentRecord {
  id: number;
  student_code: string;
  name: string;
  phone: string;
  default_course: string;
  created_at?: string;
}

export interface InvoiceRecord {
  id: number;
  invoice_number: string;
  student_id: number;
  student_name: string;
  student_phone: string;
  course: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  notes: string;
  created_at?: string;
}

const PAYMENT_METHODS = [
  "Cash",
  "bKash",
  "Nagad",
  "Bank Transfer",
  "Card",
] as const;

const QUICK_BDT_AMOUNTS = [1500, 2500, 3500, 5000, 6500, 10000];

const COURSES = [
  "Full-Stack Web Development",
  "Engineering Admission Batch",
  "IELTS Crash Course",
  "HSC Physics & Math Batch A",
] as const;

const STORAGE_KEYS = {
  PASSKEY: "cf_invoice_passkey",
  HEADER_TITLE: "cf_invoice_header_title",
  HEADER_SUBTITLE: "cf_invoice_header_subtitle",
  HEADER_META: "cf_invoice_header_meta",
};

export function App() {
  // Passkey Authentication State
  const [passkey, setPasskey] = useState<string>(
    () => sessionStorage.getItem(STORAGE_KEYS.PASSKEY) || ""
  );
  const [passkeyInput, setPasskeyInput] = useState<string>("password123");
  const [showPasskey, setShowPasskey] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Cloudflare D1 State
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Active Sidebar Tab
  const [activeTab, setActiveTab] = useState<string>("editor");

  // Preview Zoom Scale (so A4 fits cleanly on any screen)
  const [previewZoom, setPreviewZoom] = useState<number>(0.78);

  // Header Branding State (editable via Dialog or directly on A4 sheet)
  const [headerTitle, setHeaderTitle] = useState<string>(
    () => localStorage.getItem(STORAGE_KEYS.HEADER_TITLE) || ""
  );
  const [headerSubtitle, setHeaderSubtitle] = useState<string>(
    () => localStorage.getItem(STORAGE_KEYS.HEADER_SUBTITLE) || ""
  );
  const [headerMeta, setHeaderMeta] = useState<string>(
    () => localStorage.getItem(STORAGE_KEYS.HEADER_META) || ""
  );
  const [isHeaderDialogOpen, setIsHeaderDialogOpen] = useState<boolean>(false);

  // Register Student Dialog State
  const [isNewStudentDialogOpen, setIsNewStudentDialogOpen] =
    useState<boolean>(false);
  const [newStudentName, setNewStudentName] = useState<string>("");
  const [newStudentPhone, setNewStudentPhone] = useState<string>("");
  const [newStudentCourse, setNewStudentCourse] = useState<string>("");
  const [isCreatingStudent, setIsCreatingStudent] = useState<boolean>(false);

  // Invoice Editor Form State
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(
    null
  );
  const [studentCode, setStudentCode] = useState<string>("");
  const [studentName, setStudentName] = useState<string>("");
  const [studentPhone, setStudentPhone] = useState<string>("");
  const [course, setCourse] = useState<string>("");
  const [amount, setAmount] = useState<string>("3500");
  const [paymentDate, setPaymentDate] = useState<string>(todayISO);
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [notes, setNotes] = useState<string>("");
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");

  // History Search Filter
  const [historyFilter, setHistoryFilter] = useState<string>("");

  // Save State & Deduplication
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const lastSavedSignatureRef = useRef<string>("");
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleHeaderChange = (
    field: "title" | "subtitle" | "meta",
    value: string
  ) => {
    if (field === "title") {
      setHeaderTitle(value);
      localStorage.setItem(STORAGE_KEYS.HEADER_TITLE, value);
    } else if (field === "subtitle") {
      setHeaderSubtitle(value);
      localStorage.setItem(STORAGE_KEYS.HEADER_SUBTITLE, value);
    } else {
      setHeaderMeta(value);
      localStorage.setItem(STORAGE_KEYS.HEADER_META, value);
    }
  };

  // Current payload signature for idempotent Ctrl+P
  const currentSignature = useMemo(() => {
    return JSON.stringify({
      selectedStudentId: selectedStudent?.id ?? null,
      studentName: studentName.trim(),
      studentPhone: studentPhone.trim(),
      course: course.trim(),
      amount: Number(amount),
      paymentDate,
      paymentMethod,
      notes: notes.trim(),
    });
  }, [
    selectedStudent,
    studentName,
    studentPhone,
    course,
    amount,
    paymentDate,
    paymentMethod,
    notes,
  ]);

  const isCurrentInvoiceSaved =
    Boolean(invoiceNumber) &&
    lastSavedSignatureRef.current === currentSignature;

  // Fetch initial D1 data
  const fetchInitData = useCallback(async (activeKey: string) => {
    setIsLoadingData(true);
    try {
      const res = await fetch("/api/init", {
        headers: { "x-passkey": activeKey },
      });
      if (res.status === 401) {
        setIsUnlocked(false);
        sessionStorage.removeItem(STORAGE_KEYS.PASSKEY);
        setAuthError("Invalid passkey. Please unlock again.");
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to load D1 records");
      }
      const data = (await res.json()) as {
        students: StudentRecord[];
        invoices: InvoiceRecord[];
      };
      const loadedStudents = data.students || [];
      const loadedInvoices = data.invoices || [];
      setStudents(loadedStudents);
      setInvoices(loadedInvoices);
      setIsUnlocked(true);

      // Pre-populate first student on initial load if form is blank
      if (loadedStudents.length > 0 && !studentName) {
        const first = loadedStudents[0];
        setSelectedStudent(first);
        setStudentCode(first.student_code);
        setStudentName(first.name);
        setStudentPhone(first.phone || "");
        setCourse(first.default_course || "");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error connecting to Cloudflare D1";
      toast.error(msg);
    } finally {
      setIsLoadingData(false);
    }
  }, [studentName]);

  useEffect(() => {
    if (passkey) {
      fetchInitData(passkey);
    }
  }, [passkey, fetchInitData]);

  // Unlock Handler
  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const trimmed = passkeyInput.trim();
    if (!trimmed) {
      setAuthError("Please enter your passkey.");
      return;
    }
    setIsVerifying(true);
    try {
      const res = await fetch("/api/verify", {
        headers: { "x-passkey": trimmed },
      });
      if (!res.ok) {
        setAuthError("Invalid passkey. Default is password123.");
        return;
      }
      sessionStorage.setItem(STORAGE_KEYS.PASSKEY, trimmed);
      setPasskey(trimmed);
      setIsUnlocked(true);
      toast.success("Unlocked Cloudflare D1 Invoice Printer");
    } catch {
      setAuthError("Could not reach Cloudflare Worker API.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Select a registered student via Base UI Combobox or Student Table
  const handlePickStudent = useCallback((student: StudentRecord | null) => {
    setSelectedStudent(student);
    if (student) {
      setStudentCode(student.student_code || "");
      setStudentName(student.name);
      setStudentPhone(student.phone || "");
      if (student.default_course) {
        setCourse(student.default_course);
      }
      setInvoiceNumber("");
      lastSavedSignatureRef.current = "";
      toast.info(`Loaded student: ${student.name} (${student.student_code})`);
    } else {
      setStudentCode("");
      setInvoiceNumber("");
      lastSavedSignatureRef.current = "";
    }
  }, []);

  // Reset form for a new blank invoice
  const handleNewBlankInvoice = useCallback(() => {
    setSelectedStudent(null);
    setStudentCode("");
    setStudentName("");
    setStudentPhone("");
    setCourse("");
    setAmount("");
    setPaymentDate(todayISO);
    setPaymentMethod("Cash");
    setNotes("");
    setInvoiceNumber("");
    lastSavedSignatureRef.current = "";
    setActiveTab("editor");
    toast("Reset for a new blank invoice");
  }, [todayISO]);

  // Load past invoice from D1 history
  const handleLoadPastInvoice = (inv: InvoiceRecord) => {
    const matchedStudent =
      students.find((s) => s.id === inv.student_id) || null;
    setSelectedStudent(matchedStudent);
    setStudentCode(matchedStudent?.student_code || `STD-${1000 + inv.student_id}`);
    setStudentName(inv.student_name);
    setStudentPhone(inv.student_phone || "");
    setCourse(inv.course);
    setAmount(String(inv.amount));
    setPaymentDate(inv.payment_date);
    setPaymentMethod(inv.payment_method || "Cash");
    setNotes(inv.notes || "");
    setInvoiceNumber(inv.invoice_number);

    const loadedSig = JSON.stringify({
      selectedStudentId: matchedStudent?.id ?? null,
      studentName: inv.student_name.trim(),
      studentPhone: (inv.student_phone || "").trim(),
      course: inv.course.trim(),
      amount: Number(inv.amount),
      paymentDate: inv.payment_date,
      paymentMethod: inv.payment_method || "Cash",
      notes: (inv.notes || "").trim(),
    });
    lastSavedSignatureRef.current = loadedSig;

    toast.success(`Loaded ${inv.invoice_number} — Press Ctrl+P to reprint`);
  };

  // Explicitly create a student in D1 via modal
  const handleCreateStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    setIsCreatingStudent(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-passkey": passkey,
        },
        body: JSON.stringify({
          name: newStudentName.trim(),
          phone: newStudentPhone.trim(),
          default_course: newStudentCourse.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register student");
      }
      const created: StudentRecord = data.student;
      setStudents((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
      );
      handlePickStudent(created);
      setNewStudentName("");
      setNewStudentPhone("");
      setNewStudentCourse("");
      setIsNewStudentDialogOpen(false);
      setActiveTab("editor");
      toast.success(`Registered ${created.name} (${created.student_code}) in D1`);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to register student"
      );
    } finally {
      setIsCreatingStudent(false);
    }
  };

  // Core Save to Cloudflare D1 + Print
  const handleSaveAndPrint = useCallback(
    async (shouldPrint = true) => {
      if (isSaving) return;

      if (!studentName.trim() || !course.trim() || Number(amount) <= 0) {
        setActiveTab("editor");
        formRef.current?.reportValidity();
        toast.error(
          "Please fill in Student Name, Course, and a valid BDT Amount."
        );
        return;
      }

      // If unchanged since last save, open print dialog immediately without duplicating in D1
      if (
        invoiceNumber &&
        lastSavedSignatureRef.current === currentSignature
      ) {
        if (shouldPrint) {
          window.print();
        } else {
          toast.info(`Invoice ${invoiceNumber} is already saved in D1.`);
        }
        return;
      }

      setIsSaving(true);
      try {
        const res = await fetch("/api/invoices", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-passkey": passkey,
          },
          body: JSON.stringify({
            student_id: selectedStudent?.id ?? null,
            student_code: studentCode.trim(),
            student_name: studentName.trim(),
            student_phone: studentPhone.trim(),
            course: course.trim(),
            amount: Number(amount),
            payment_date: paymentDate,
            payment_method: paymentMethod,
            notes: notes.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to save invoice to D1");
        }

        const savedInv: InvoiceRecord = data.invoice;
        const savedStudent: StudentRecord = data.student;

        setInvoiceNumber(savedInv.invoice_number);
        if (savedStudent) {
          setSelectedStudent(savedStudent);
          setStudentCode(savedStudent.student_code);
          setStudents((prev) => {
            const exists = prev.some((s) => s.id === savedStudent.id);
            if (exists) {
              return prev.map((s) =>
                s.id === savedStudent.id ? savedStudent : s
              );
            }
            return [...prev, savedStudent].sort((a, b) =>
              a.name.localeCompare(b.name)
            );
          });
        }

        setInvoices((prev) => [savedInv, ...prev]);

        const updatedSignature = JSON.stringify({
          selectedStudentId: savedStudent
            ? savedStudent.id
            : selectedStudent?.id ?? null,
          studentName: studentName.trim(),
          studentPhone: studentPhone.trim(),
          course: course.trim(),
          amount: Number(amount),
          paymentDate,
          paymentMethod,
          notes: notes.trim(),
        });
        lastSavedSignatureRef.current = updatedSignature;

        toast.success(`Saved ${savedInv.invoice_number} to Cloudflare D1`, {
          description: `${savedInv.student_name} • ${formatBDT(savedInv.amount)}`,
        });

        if (shouldPrint) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              window.print();
            });
          });
        }
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to save invoice";
        toast.error(msg);
      } finally {
        setIsSaving(false);
      }
    },
    [
      isSaving,
      studentName,
      course,
      amount,
      invoiceNumber,
      currentSignature,
      passkey,
      selectedStudent,
      studentCode,
      studentPhone,
      paymentDate,
      paymentMethod,
      notes,
    ]
  );

  // Intercept Ctrl+P / Cmd+P and Alt+N globally
  useEffect(() => {
    if (!isUnlocked) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        handleSaveAndPrint(true);
      } else if (e.altKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        handleNewBlankInvoice();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isUnlocked, handleSaveAndPrint, handleNewBlankInvoice]);

  // Course dropdown options: fixed catalog, plus the current value if it's a custom one
  const courseOptions = useMemo(() => {
    const list: string[] = [...COURSES];
    if (course.trim() && !list.includes(course.trim())) {
      list.push(course.trim());
    }
    return list;
  }, [course]);

  // Filtered invoices for History tab
  const filteredInvoices = useMemo(() => {
    const q = historyFilter.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter(
      (inv) =>
        inv.invoice_number.toLowerCase().includes(q) ||
        inv.student_name.toLowerCase().includes(q) ||
        inv.course.toLowerCase().includes(q) ||
        (inv.student_phone && inv.student_phone.toLowerCase().includes(q))
    );
  }, [invoices, historyFilter]);

  // =========================================================================
  // PASSKEY AUTHENTICATION GATE
  // =========================================================================
  if (!isUnlocked) {
    return (
      <TooltipProvider>
        <main className="min-h-screen w-full flex items-center justify-center p-4 bg-dot-grid">
          <Card className="w-full max-w-sm shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="size-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                  <LockIcon className="size-4" />
                </div>
                <Badge variant="outline" className="font-mono text-[11px]">
                  Cloudflare D1
                </Badge>
              </div>
              <CardTitle className="mt-2 text-lg">
                Invoice & Receipt Printer
              </CardTitle>
              <CardDescription>
                Enter the workspace passkey to access registered students and
                save receipts to Cloudflare D1.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleUnlockSubmit}>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="passkey-input">
                      Workspace Passkey
                    </FieldLabel>
                    <InputGroup className="h-9">
                      <InputGroupInput
                        id="passkey-input"
                        name="passkey"
                        type={showPasskey ? "text" : "password"}
                        autoComplete="current-password"
                        value={passkeyInput}
                        onChange={(e) => {
                          setPasskeyInput(e.target.value);
                          setAuthError("");
                        }}
                        placeholder="Enter passkey..."
                        className="font-mono"
                        required
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => setShowPasskey((v) => !v)}
                          aria-pressed={showPasskey}
                          aria-label={
                            showPasskey ? "Hide passkey" : "Show passkey"
                          }
                        >
                          {showPasskey ? (
                            <EyeOffIcon className="size-3.5" />
                          ) : (
                            <EyeIcon className="size-3.5" />
                          )}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription>
                      Default passkey:{" "}
                      <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded border">
                        password123
                      </code>
                    </FieldDescription>
                  </Field>

                  {authError && (
                    <div
                      role="alert"
                      aria-live="polite"
                      className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive"
                    >
                      {authError}
                    </div>
                  )}
                </FieldGroup>
              </CardContent>

              <CardFooter className="mt-4 flex justify-end">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isVerifying}
                  className="w-full"
                >
                  {isVerifying ? "Verifying Passkey..." : "Unlock Workspace"}
                </Button>
              </CardFooter>
            </form>
          </Card>
          <Toaster theme="light" richColors position="bottom-right" />
        </main>
      </TooltipProvider>
    );
  }

  // =========================================================================
  // MAIN STUDIO WORKBENCH (SHADCN + BASE UI)
  // =========================================================================
  return (
    <TooltipProvider>
      <div className="h-screen w-full overflow-hidden flex flex-col bg-background print-shell">
        {/* Top Command Header Bar (Hidden during print) */}
        <header className="no-print h-14 shrink-0 border-b bg-background px-4 flex items-center justify-between gap-4 z-20">
          {/* Left: Brand & D1 Status */}
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <PrinterIcon className="size-4" />
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-sm font-semibold tracking-tight">
                Student Invoice Printer
              </h1>
              <Separator orientation="vertical" className="h-4" />
              <Badge variant="secondary" className="gap-1.5 font-normal">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Cloudflare D1
              </Badge>
            </div>
          </div>

          {/* Right: Header Settings Dialog + Save & Print Actions */}
          <div className="flex items-center gap-2">
            {/* Institution Header Settings Dialog (Base UI Dialog) */}
            <Dialog
              open={isHeaderDialogOpen}
              onOpenChange={setIsHeaderDialogOpen}
            >
              <DialogTrigger
                render={
                  <Button variant="outline" size="icon-sm" aria-label="Receipt header branding">
                    <Building2Icon />
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Receipt Header Branding</DialogTitle>
                  <DialogDescription>
                    Customize the institution name, address, and contact line
                    printed on the Student and Office copies. You can also click
                    directly on the A4 preview header to type.
                  </DialogDescription>
                </DialogHeader>
                <FieldGroup className="py-2">
                  <Field>
                    <FieldLabel htmlFor="dialog-header-title">
                      Institution / Academy Name
                    </FieldLabel>
                    <Input
                      id="dialog-header-title"
                      value={headerTitle}
                      onChange={(e) =>
                        handleHeaderChange("title", e.target.value)
                      }
                      placeholder="e.g. APEX ACADEMIC COACHING"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="dialog-header-subtitle">
                      Address / Campus Line
                    </FieldLabel>
                    <Input
                      id="dialog-header-subtitle"
                      value={headerSubtitle}
                      onChange={(e) =>
                        handleHeaderChange("subtitle", e.target.value)
                      }
                      placeholder="e.g. House 12, Road 5, Dhanmondi, Dhaka-1205"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="dialog-header-meta">
                      Contact / Phone / Website
                    </FieldLabel>
                    <Input
                      id="dialog-header-meta"
                      value={headerMeta}
                      onChange={(e) =>
                        handleHeaderChange("meta", e.target.value)
                      }
                      placeholder="e.g. Helpline: 01700-000000 • www.example.edu.bd"
                    />
                  </Field>
                </FieldGroup>
                <DialogFooter showCloseButton />
              </DialogContent>
            </Dialog>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={handleNewBlankInvoice}
                    aria-label="New blank invoice"
                  >
                    <FilePlus2Icon />
                  </Button>
                }
              />
              <TooltipContent>New blank invoice (Alt+N)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={isSaving}
                    onClick={() => handleSaveAndPrint(false)}
                    aria-label="Save to D1 without printing"
                  >
                    <DatabaseIcon />
                  </Button>
                }
              />
              <TooltipContent>Save to D1 without printing</TooltipContent>
            </Tooltip>

            <Button
              variant="default"
              size="sm"
              disabled={isSaving}
              onClick={() => handleSaveAndPrint(true)}
            >
              <PrinterIcon data-icon="inline-start" />
              {isSaving
                ? "Saving..."
                : isCurrentInvoiceSaved
                ? "Reprint"
                : "Save & Print"}
            </Button>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      sessionStorage.removeItem(STORAGE_KEYS.PASSKEY);
                      setIsUnlocked(false);
                    }}
                    aria-label="Lock workspace"
                  >
                    <LogOutIcon className="size-4 text-muted-foreground" />
                  </Button>
                }
              />
              <TooltipContent>Lock session</TooltipContent>
            </Tooltip>
          </div>
        </header>

        {/* Workbench Body: Left Shadcn Inspector + Right Scaled A4 Canvas */}
        <main className="flex-1 flex overflow-hidden print-shell">
          {/* =================================================================
              LEFT INSPECTOR SIDEBAR (460px, Base UI Tabs + Combobox + Select)
             ================================================================= */}
          <aside className="no-print w-full md:w-[440px] xl:w-[470px] shrink-0 border-r bg-background flex flex-col h-full overflow-hidden">
            <Tabs
              value={activeTab}
              onValueChange={(val) => val && setActiveTab(val)}
              className="flex flex-col h-full gap-0"
            >
              {/* Top Tabs Switcher */}
              <div className="px-4 pt-3 pb-2 border-b bg-muted/20 flex items-center justify-between gap-2">
                <TabsList className="w-full">
                  <TabsTrigger value="editor" className="flex-1">
                    <SlidersHorizontalIcon className="size-3.5" />
                    Receipt Builder
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex-1">
                    <HistoryIcon className="size-3.5" />
                    Invoices ({invoices.length})
                  </TabsTrigger>
                  <TabsTrigger value="students" className="flex-1">
                    <UsersIcon className="size-3.5" />
                    Students ({students.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* =============================================================
                  TAB 1: RECEIPT BUILDER (Base UI Combobox + Form Fields)
                 ============================================================= */}
              <TabsContent
                value="editor"
                className="flex-1 flex flex-col overflow-hidden m-0"
              >
                <ScrollArea className="flex-1">
                  <form
                    ref={formRef}
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveAndPrint(true);
                    }}
                    className="p-4 space-y-5"
                  >
                    {/* 1. REGISTERED STUDENT COMBOBOX (@base-ui/react/combobox) */}
                    <Card size="sm" className="bg-muted/30">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <UserCheckIcon className="size-3.5 text-foreground" />
                            Student Lookup (D1)
                          </CardTitle>
                          {selectedStudent ? (
                            <Badge variant="secondary" className="font-mono text-[10px]">
                              {selectedStudent.student_code}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] gap-1">
                              <UserPlusIcon className="size-3" /> New Student
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2.5">
                        <Combobox
                          items={students}
                          value={selectedStudent}
                          onValueChange={(student: StudentRecord | null) => {
                            handlePickStudent(student);
                          }}
                          itemToStringLabel={(s: StudentRecord) =>
                            s ? `${s.name} (${s.student_code})` : ""
                          }
                          itemToStringValue={(s: StudentRecord) =>
                            s ? String(s.id) : ""
                          }
                          isItemEqualToValue={(
                            a: StudentRecord,
                            b: StudentRecord
                          ) => a?.id === b?.id}
                          filter={(student: StudentRecord, query: string) => {
                            const q = query.trim().toLowerCase();
                            if (!q) return true;
                            return (
                              student.name.toLowerCase().includes(q) ||
                              (student.student_code?.toLowerCase().includes(q) ??
                                false) ||
                              (student.phone?.toLowerCase().includes(q) ??
                                false) ||
                              (student.default_course
                                ?.toLowerCase()
                                .includes(q) ?? false)
                            );
                          }}
                        >
                          <ComboboxInput
                            placeholder="Search student by name, ID (STD-...), or phone..."
                            showClear
                            className="w-full bg-background"
                          />
                          <ComboboxContent>
                            <ComboboxEmpty>
                              No registered student matches. Type below to
                              auto-register on print!
                            </ComboboxEmpty>
                            <ComboboxList>
                              {(student: StudentRecord) => (
                                <ComboboxItem
                                  key={student.id}
                                  value={student}
                                  className="py-1.5"
                                >
                                  <div className="flex flex-col flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-medium truncate">
                                        {student.name}
                                      </span>
                                      <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                                        {student.student_code}
                                      </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground truncate">
                                      {student.phone || "No phone"} •{" "}
                                      {student.default_course || "General"}
                                    </span>
                                  </div>
                                </ComboboxItem>
                              )}
                            </ComboboxList>
                          </ComboboxContent>
                        </Combobox>

                        <p className="text-[11px] text-muted-foreground leading-normal">
                          Pick a student to auto-fill, or type new details below.
                        </p>
                      </CardContent>
                    </Card>

                    {/* 2. STUDENT INFORMATION FIELDSET */}
                    <FieldSet>
                      <div className="flex items-center justify-between">
                        <FieldLegend variant="label" className="mb-0">
                          Student Details
                        </FieldLegend>
                        {selectedStudent && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => {
                              setSelectedStudent(null);
                              setStudentCode("");
                              setStudentName("");
                              setStudentPhone("");
                              setInvoiceNumber("");
                            }}
                          >
                            Clear Selection
                          </Button>
                        )}
                      </div>

                      <FieldGroup className="gap-3.5">
                        <Field>
                          <FieldLabel htmlFor="student-name-input">
                            Student Full Name *
                          </FieldLabel>
                          <Input
                            id="student-name-input"
                            name="student_name"
                            value={studentName}
                            onChange={(e) => {
                              setStudentName(e.target.value);
                              if (
                                selectedStudent &&
                                e.target.value.trim().toLowerCase() !==
                                  selectedStudent.name.toLowerCase()
                              ) {
                                setSelectedStudent(null);
                                setStudentCode("");
                              }
                            }}
                            placeholder="e.g. Tanvir Ahmed"
                            autoComplete="name"
                            required
                            className="h-9"
                          />
                        </Field>

                        <div className="grid grid-cols-2 gap-3">
                          <Field>
                            <FieldLabel htmlFor="student-phone-input">
                              Phone Number
                            </FieldLabel>
                            <Input
                              id="student-phone-input"
                              name="student_phone"
                              type="tel"
                              inputMode="tel"
                              autoComplete="tel"
                              value={studentPhone}
                              onChange={(e) => setStudentPhone(e.target.value)}
                              placeholder="017XX-XXXXXX"
                              className="h-9 font-mono text-xs"
                            />
                          </Field>

                          <Field>
                            <FieldLabel htmlFor="student-code-input">
                              Student ID / Code
                            </FieldLabel>
                            <Input
                              id="student-code-input"
                              name="student_code"
                              value={studentCode}
                              onChange={(e) => {
                                setStudentCode(e.target.value);
                                setSelectedStudent(null);
                              }}
                              autoCorrect="off"
                              autoCapitalize="off"
                              spellCheck={false}
                              placeholder="Auto (STD-...)"
                              className="h-9 font-mono text-xs"
                            />
                          </Field>
                        </div>
                      </FieldGroup>
                    </FieldSet>

                    <Separator />

                    {/* 3. COURSE & PAYMENT DETAILS FIELDSET */}
                    <FieldSet>
                      <FieldLegend variant="label" className="mb-0">
                        Course & Payment Details (BDT)
                      </FieldLegend>

                      <FieldGroup className="gap-3.5">
                        <Field>
                          <FieldLabel htmlFor="course-select">
                            Course / Batch / Particulars *
                          </FieldLabel>
                          <Select
                            value={course}
                            onValueChange={(val) => val && setCourse(val)}
                          >
                            <SelectTrigger id="course-select" className="w-full h-9">
                              <SelectValue placeholder="Select a course..." />
                            </SelectTrigger>
                            <SelectContent alignItemWithTrigger={false}>
                              <SelectGroup>
                                {courseOptions.map((c) => (
                                  <SelectItem key={c} value={c}>
                                    {c}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </Field>

                        <Field>
                          <FieldLabel htmlFor="amount-bdt-input">
                            Amount Received (Taka / BDT) *
                          </FieldLabel>
                          <InputGroup className="h-9">
                            <InputGroupAddon align="inline-start">
                              <InputGroupText className="font-mono text-xs font-bold text-foreground">
                                BDT
                              </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                              id="amount-bdt-input"
                              name="amount"
                              type="number"
                              inputMode="decimal"
                              min="1"
                              step="any"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              placeholder="3500"
                              required
                              className="font-mono font-bold text-sm"
                            />
                          </InputGroup>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {QUICK_BDT_AMOUNTS.map((preset) => (
                              <Button
                                key={preset}
                                type="button"
                                variant={
                                  Number(amount) === preset
                                    ? "secondary"
                                    : "outline"
                                }
                                size="xs"
                                onClick={() => setAmount(String(preset))}
                                className="font-mono text-[11px]"
                              >
                                {preset.toLocaleString("en-IN")}
                              </Button>
                            ))}
                          </div>
                        </Field>

                        <div className="grid grid-cols-2 gap-3">
                          <Field>
                            <FieldLabel htmlFor="payment-date-input">
                              Payment Date *
                            </FieldLabel>
                            <Input
                              id="payment-date-input"
                              name="payment_date"
                              type="date"
                              value={paymentDate}
                              onChange={(e) => setPaymentDate(e.target.value)}
                              required
                              className="h-9 font-mono text-xs"
                            />
                          </Field>

                          <Field>
                            <FieldLabel>Payment Method</FieldLabel>
                            <Select
                              value={paymentMethod}
                              onValueChange={(val) =>
                                val && setPaymentMethod(val)
                              }
                            >
                              <SelectTrigger className="w-full h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent alignItemWithTrigger={false}>
                                <SelectGroup>
                                  {PAYMENT_METHODS.map((method) => (
                                    <SelectItem key={method} value={method}>
                                      {method}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </Field>
                        </div>

                        <Field>
                          <FieldLabel htmlFor="notes-textarea">
                            Remarks / Notes (Optional)
                          </FieldLabel>
                          <Textarea
                            id="notes-textarea"
                            name="notes"
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g. Monthly tuition fee for November 2026"
                            className="min-h-14 text-xs"
                          />
                        </Field>
                      </FieldGroup>
                    </FieldSet>
                  </form>
                </ScrollArea>

                {/* Slim Status Strip inside Sidebar (actions live in the header) */}
                <div className="px-4 py-2.5 border-t bg-muted/20 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Receipt status</span>
                  {isCurrentInvoiceSaved ? (
                    <span className="font-mono font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2Icon className="size-3.5" /> Saved (
                      {invoiceNumber})
                    </span>
                  ) : (
                    <span className="font-mono text-muted-foreground">
                      Unsaved draft •{" "}
                      <kbd className="px-1 py-0.5 bg-muted border rounded font-mono text-[10px] text-foreground">
                        Ctrl+P
                      </kbd>{" "}
                      to save & print
                    </span>
                  )}
                </div>
              </TabsContent>

              {/* =============================================================
                  TAB 2: SAVED INVOICES IN CLOUDFLARE D1
                 ============================================================= */}
              <TabsContent
                value="history"
                className="flex-1 flex flex-col overflow-hidden m-0"
              >
                <div className="p-3 border-b flex items-center gap-2">
                  <InputGroup className="flex-1 h-8">
                    <InputGroupAddon align="inline-start">
                      <SearchIcon className="size-3.5 text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                      value={historyFilter}
                      onChange={(e) => setHistoryFilter(e.target.value)}
                      placeholder="Filter by receipt #, student, or course..."
                      className="text-xs"
                    />
                  </InputGroup>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => fetchInitData(passkey)}
                    disabled={isLoadingData}
                    aria-label="Refresh D1 history"
                  >
                    <RefreshCwIcon
                      className={`size-3.5 ${
                        isLoadingData ? "animate-spin" : ""
                      }`}
                    />
                  </Button>
                </div>

                <ScrollArea className="flex-1">
                  {filteredInvoices.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted-foreground">
                      No matching invoices found in Cloudflare D1.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Receipt</TableHead>
                          <TableHead className="text-xs">Student</TableHead>
                          <TableHead className="text-xs text-right">
                            Amount
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInvoices.map((inv) => {
                          const isActive = invoiceNumber === inv.invoice_number;
                          return (
                            <TableRow
                              key={inv.id}
                              onClick={() => handleLoadPastInvoice(inv)}
                              className={`cursor-pointer ${
                                isActive ? "bg-muted" : ""
                              }`}
                            >
                              <TableCell className="py-2.5">
                                <div className="font-mono text-xs font-semibold">
                                  {inv.invoice_number}
                                </div>
                                <div className="text-[11px] text-muted-foreground">
                                  {formatDisplayDate(inv.payment_date)} •{" "}
                                  {inv.payment_method}
                                </div>
                              </TableCell>
                              <TableCell className="py-2.5 max-w-[160px]">
                                <div className="font-medium text-xs truncate">
                                  {inv.student_name}
                                </div>
                                <div className="text-[11px] text-muted-foreground truncate">
                                  {inv.course}
                                </div>
                              </TableCell>
                              <TableCell className="py-2.5 text-right font-mono text-xs font-bold tabular-nums">
                                {formatBDT(inv.amount)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </ScrollArea>
              </TabsContent>

              {/* =============================================================
                  TAB 3: REGISTERED STUDENTS IN CLOUDFLARE D1
                 ============================================================= */}
              <TabsContent
                value="students"
                className="flex-1 flex flex-col overflow-hidden m-0"
              >
                <div className="p-3 border-b flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    Click any student to start an invoice
                  </span>

                  <Dialog
                    open={isNewStudentDialogOpen}
                    onOpenChange={setIsNewStudentDialogOpen}
                  >
                    <DialogTrigger
                      render={
                        <Button size="xs" variant="default">
                          <PlusIcon data-icon="inline-start" />
                          Add Student
                        </Button>
                      }
                    />
                    <DialogContent className="sm:max-w-sm">
                      <form onSubmit={handleCreateStudentSubmit}>
                        <DialogHeader>
                          <DialogTitle>Register New Student</DialogTitle>
                          <DialogDescription>
                            Add a student to Cloudflare D1 so they appear in the
                            quick lookup combobox.
                          </DialogDescription>
                        </DialogHeader>
                        <FieldGroup className="py-3">
                          <Field>
                            <FieldLabel htmlFor="modal-student-name">
                              Full Name *
                            </FieldLabel>
                            <Input
                              id="modal-student-name"
                              value={newStudentName}
                              onChange={(e) =>
                                setNewStudentName(e.target.value)
                              }
                              placeholder="e.g. Adia Islam"
                              required
                            />
                          </Field>
                          <Field>
                            <FieldLabel htmlFor="modal-student-phone">
                              Phone Number
                            </FieldLabel>
                            <Input
                              id="modal-student-phone"
                              value={newStudentPhone}
                              onChange={(e) =>
                                setNewStudentPhone(e.target.value)
                              }
                              placeholder="017XX-XXXXXX"
                            />
                          </Field>
                          <Field>
                            <FieldLabel htmlFor="modal-student-course">
                              Default Course / Batch
                            </FieldLabel>
                            <Input
                              id="modal-student-course"
                              value={newStudentCourse}
                              onChange={(e) =>
                                setNewStudentCourse(e.target.value)
                              }
                              placeholder="e.g. HSC Chemistry Batch B"
                            />
                          </Field>
                        </FieldGroup>
                        <DialogFooter showCloseButton>
                          <Button type="submit" disabled={isCreatingStudent}>
                            {isCreatingStudent ? "Saving..." : "Save to D1"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <ScrollArea className="flex-1">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Student</TableHead>
                        <TableHead className="text-xs">Default Course</TableHead>
                        <TableHead className="text-xs text-right">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((s) => (
                        <TableRow
                          key={s.id}
                          onClick={() => {
                            handlePickStudent(s);
                            setActiveTab("editor");
                          }}
                          className="cursor-pointer"
                        >
                          <TableCell className="py-2.5">
                            <div className="font-medium text-xs">{s.name}</div>
                            <div className="font-mono text-[10px] text-muted-foreground">
                              {s.student_code}{" "}
                              {s.phone ? `• ${s.phone}` : ""}
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5 text-xs text-muted-foreground max-w-[140px] truncate">
                            {s.default_course || "—"}
                          </TableCell>
                          <TableCell className="py-2.5 text-right">
                            <Button variant="outline" size="xs">
                              Select
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </aside>

          {/* =================================================================
              RIGHT STUDIO STAGE: SCALED A4 SHEET PREVIEW (75% / 25%)
             ================================================================= */}
          <section
            aria-label="A4 Print Preview Stage"
            className="relative flex-1 h-full overflow-auto bg-dot-grid flex flex-col items-center justify-start py-6 px-6 print-stage"
          >
            {/* Floating Preview Zoom Control (Screen Only) */}
            <div className="no-print absolute top-3 right-3 z-10 flex items-center gap-0.5 rounded-lg border bg-background/90 backdrop-blur p-0.5 shadow-xs">
              <ZoomInIcon className="size-3.5 mx-1.5 text-muted-foreground" />
              {[
                { label: "70%", value: 0.7 },
                { label: "78%", value: 0.78 },
                { label: "90%", value: 0.9 },
                { label: "100%", value: 1 },
              ].map((z) => (
                <Button
                  key={z.label}
                  variant={previewZoom === z.value ? "default" : "ghost"}
                  size="xs"
                  onClick={() => setPreviewZoom(z.value)}
                  className="font-mono"
                >
                  {z.label}
                </Button>
              ))}
            </div>

            {/* Scaled Container on Screen -> 100% Exact A4 on Print */}
            <div
              className="origin-top transition-transform duration-150 print-scale-reset"
              style={{
                transform: `scale(${previewZoom})`,
                marginBottom: `${(previewZoom - 1) * 1122}px`,
              }}
            >
              <InvoiceSheet
                headerTitle={headerTitle}
                headerSubtitle={headerSubtitle}
                headerMeta={headerMeta}
                onHeaderChange={handleHeaderChange}
                invoiceNumber={invoiceNumber}
                studentCode={studentCode}
                studentName={studentName}
                studentPhone={studentPhone}
                course={course}
                amount={amount}
                paymentDate={paymentDate}
                paymentMethod={paymentMethod}
                notes={notes}
                isSaved={isCurrentInvoiceSaved}
              />
            </div>
          </section>
        </main>

        <Toaster theme="light" richColors position="bottom-right" />
      </div>
    </TooltipProvider>
  );
}
