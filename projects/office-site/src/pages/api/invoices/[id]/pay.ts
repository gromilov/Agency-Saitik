import type { APIRoute } from "astro";
import { db } from "../../../../db";
import { invoices, workSessions } from "../../../../db/schema";
import { eq } from "drizzle-orm";

export const POST: APIRoute = async ({ params, cookies }) => {
  const session = cookies.get("syndicate_session");
  if (!session || session.value !== "admin_active") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing ID" }), { status: 400 });
  }

  try {
    db.transaction((tx) => {
      // 1. Update invoice
      tx.update(invoices)
        .set({ status: 'paid', paidAt: new Date() })
        .where(eq(invoices.id, id))
        .run();

      // 2. Update all linked sessions
      tx.update(workSessions)
        .set({ status: 'paid' })
        .where(eq(workSessions.invoiceId, id))
        .run();
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Payment error:", error);
    return new Response(JSON.stringify({ error: "Failed to update status" }), { status: 500 });
  }
};
