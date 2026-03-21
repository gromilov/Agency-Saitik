import type { APIRoute } from "astro";
import { db } from "../../../db";
import { workSessions } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const DELETE: APIRoute = async ({ params, cookies }) => {
  const session = cookies.get("syndicate_session");

  if (!session || session.value !== "admin_active") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing ID" }), { status: 400 });
  }

  try {
    await db.delete(workSessions).where(eq(workSessions.id, id));
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Delete session error:", error);
    return new Response(JSON.stringify({ error: "Failed to delete" }), { status: 500 });
  }
};
