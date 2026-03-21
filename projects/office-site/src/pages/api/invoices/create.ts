import type { APIRoute } from "astro";
import { db } from "../../../db";
import { invoices, workSessions } from "../../../db/schema";
import { and, eq, isNull, inArray } from "drizzle-orm";

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = cookies.get("syndicate_session");
  if (!session || session.value !== "admin_active") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { projectId, amount, dueDate, sessionIds } = await request.json();

  if (!projectId || !amount) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }

  try {
    const invoiceId = crypto.randomUUID();

    // 1. Create the invoice
    await db.insert(invoices).values({
      id: invoiceId,
      projectId,
      amount: parseInt(amount.toLocaleString().replace(/\s/g, '')), // Clean any spaces
      dueDate,
      status: 'sent',
      createdAt: new Date(),
    });

    // 2. Link work sessions and update status
    if (sessionIds && Array.isArray(sessionIds) && sessionIds.length > 0) {
      await db.update(workSessions)
        .set({ invoiceId, status: 'invoiced' })
        .where(inArray(workSessions.id, sessionIds));
    } else {
      // Fallback for manual total amount without specific sessions
      await db.update(workSessions)
        .set({ invoiceId, status: 'invoiced' })
        .where(and(
          eq(workSessions.projectId, projectId),
          isNull(workSessions.invoiceId)
        ));
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Create invoice error:", error);
    return new Response(JSON.stringify({ error: "Failed to create invoice" }), { status: 500 });
  }
};
