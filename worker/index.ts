export interface Env {
  DB: D1Database;
  ASSETS?: Fetcher;
  PASSKEY?: string;
}

interface InvoicePayload {
  student_id?: number | null;
  student_code?: string;
  student_name: string;
  student_phone?: string;
  course: string;
  amount: number;
  payment_date: string;
  payment_method?: string;
  notes?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-passkey",
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname.startsWith("/api/")) {
      const expectedPasskey = env.PASSKEY || "password123";
      const providedPasskey = request.headers.get("x-passkey") || "";

      if (providedPasskey !== expectedPasskey) {
        return jsonResponse(
          { error: "Unauthorized: Invalid passkey." },
          401
        );
      }

      try {
        // Verify Passkey endpoint
        if (url.pathname === "/api/verify" && request.method === "GET") {
          return jsonResponse({ ok: true });
        }

        // Load initial students + recent invoices
        if (url.pathname === "/api/init" && request.method === "GET") {
          const studentsRes = await env.DB.prepare(
            `SELECT id, student_code, name, phone, default_course, created_at
             FROM students
             ORDER BY name ASC`
          ).all();

          const invoicesRes = await env.DB.prepare(
            `SELECT id, invoice_number, student_id, student_name, student_phone,
                    course, amount, payment_date, payment_method, notes, created_at
             FROM invoices
             ORDER BY id DESC
             LIMIT 50`
          ).all();

          return jsonResponse({
            students: studentsRes.results || [],
            invoices: invoicesRes.results || [],
          });
        }

        // Create / Save Student directly
        if (url.pathname === "/api/students" && request.method === "POST") {
          const body = (await request.json()) as {
            name?: string;
            phone?: string;
            student_code?: string;
            default_course?: string;
          };

          const name = (body.name || "").trim();
          if (!name) {
            return jsonResponse({ error: "Student name is required." }, 400);
          }

          const phone = (body.phone || "").trim();
          const defaultCourse = (body.default_course || "").trim();
          let studentCode = (body.student_code || "").trim();

          if (!studentCode) {
            const countRow = await env.DB.prepare(
              `SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM students`
            ).first<{ next_id: number }>();
            studentCode = `STD-${1000 + (countRow?.next_id || 1)}`;
          }

          const insertRes = await env.DB.prepare(
            `INSERT INTO students (student_code, name, phone, default_course)
             VALUES (?1, ?2, ?3, ?4)
             RETURNING id, student_code, name, phone, default_course, created_at`
          )
            .bind(studentCode, name, phone, defaultCourse)
            .first();

          return jsonResponse({ student: insertRes }, 201);
        }

        // Save Invoice (and auto-register or update student in D1)
        if (url.pathname === "/api/invoices" && request.method === "POST") {
          const body = (await request.json()) as InvoicePayload;

          const studentName = (body.student_name || "").trim();
          const studentPhone = (body.student_phone || "").trim();
          const course = (body.course || "").trim();
          const amount = Number(body.amount);
          const paymentDate =
            (body.payment_date || "").trim() ||
            new Date().toISOString().slice(0, 10);
          const paymentMethod = (body.payment_method || "Cash").trim();
          const notes = (body.notes || "").trim();

          if (!studentName) {
            return jsonResponse({ error: "Student name is required." }, 400);
          }
          if (!course) {
            return jsonResponse({ error: "Course / Subject is required." }, 400);
          }
          if (!Number.isFinite(amount) || amount <= 0) {
            return jsonResponse(
              { error: "Amount must be greater than 0 BDT." },
              400
            );
          }

          let studentId = body.student_id ? Number(body.student_id) : null;
          let studentRecord: Record<string, unknown> | null = null;

          // 1. Check if student exists by ID, or by exact name + phone match
          if (studentId) {
            const existing = await env.DB.prepare(
              `SELECT id, student_code, name, phone, default_course FROM students WHERE id = ?1`
            )
              .bind(studentId)
              .first();

            if (existing) {
              await env.DB.prepare(
                `UPDATE students
                 SET name = ?1, phone = ?2, default_course = ?3
                 WHERE id = ?4`
              )
                .bind(studentName, studentPhone, course, studentId)
                .run();

              studentRecord = {
                ...existing,
                name: studentName,
                phone: studentPhone,
                default_course: course,
              };
            } else {
              studentId = null;
            }
          }

          if (!studentId) {
            // Try matching existing student by name (case-insensitive)
            const matched = await env.DB.prepare(
              `SELECT id, student_code, name, phone, default_course
               FROM students
               WHERE LOWER(name) = LOWER(?1)
               LIMIT 1`
            )
              .bind(studentName)
              .first<{
                id: number;
                student_code: string;
                name: string;
                phone: string;
                default_course: string;
              }>();

            if (matched) {
              studentId = matched.id;
              await env.DB.prepare(
                `UPDATE students
                 SET phone = COALESCE(NULLIF(?1, ''), phone),
                     default_course = ?2
                 WHERE id = ?3`
              )
                .bind(studentPhone, course, studentId)
                .run();

              studentRecord = {
                ...matched,
                phone: studentPhone || matched.phone,
                default_course: course,
              };
            } else {
              // Auto-register new student
              const nextStudentRow = await env.DB.prepare(
                `SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM students`
              ).first<{ next_id: number }>();
              const generatedCode =
                (body.student_code || "").trim() ||
                `STD-${1000 + (nextStudentRow?.next_id || 1)}`;

              const createdStudent = await env.DB.prepare(
                `INSERT INTO students (student_code, name, phone, default_course)
                 VALUES (?1, ?2, ?3, ?4)
                 RETURNING id, student_code, name, phone, default_course, created_at`
              )
                .bind(generatedCode, studentName, studentPhone, course)
                .first<{
                  id: number;
                  student_code: string;
                  name: string;
                  phone: string;
                  default_course: string;
                }>();

              studentId = createdStudent!.id;
              studentRecord = createdStudent;
            }
          }

          // 2. Generate sequential Invoice / Receipt Number (e.g., INV-20261103-0001)
          const nextInvRow = await env.DB.prepare(
            `SELECT COALESCE(MAX(id), 0) + 1 AS next_inv FROM invoices`
          ).first<{ next_inv: number }>();
          const seq = String(nextInvRow?.next_inv || 1).padStart(4, "0");
          const dateCompact = paymentDate.replace(/-/g, "");
          const invoiceNumber = `INV-${dateCompact}-${seq}`;

          // 3. Insert invoice into D1
          const savedInvoice = await env.DB.prepare(
            `INSERT INTO invoices (
              invoice_number, student_id, student_name, student_phone,
              course, amount, payment_date, payment_method, notes
            )
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
            RETURNING id, invoice_number, student_id, student_name, student_phone,
                      course, amount, payment_date, payment_method, notes, created_at`
          )
            .bind(
              invoiceNumber,
              studentId,
              studentName,
              studentPhone,
              course,
              amount,
              paymentDate,
              paymentMethod,
              notes
            )
            .first();

          return jsonResponse(
            {
              invoice: savedInvoice,
              student: studentRecord,
            },
            201
          );
        }

        return jsonResponse({ error: "API route not found" }, 404);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Database operation failed";
        return jsonResponse({ error: message }, 500);
      }
    }

    // Fallback to static assets if bound
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("Not Found", { status: 404 });
  },
};
