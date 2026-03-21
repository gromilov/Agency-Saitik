import type { APIRoute } from "astro";
import { db } from "../../../../db";
import { workSessions } from "../../../../db/schema";
import { eq, and } from "drizzle-orm";

export const GET: APIRoute = async ({ params, cookies }) => {
  const session = cookies.get("syndicate_session");
  if (!session || session.value !== "admin_active") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { id } = params;
  if (!id) return new Response(JSON.stringify({ error: "Missing project ID" }), { status: 400 });

  try {
    const sessions = await db.select()
      .from(workSessions)
      .where(and(
        eq(workSessions.projectId, id),
        eq(workSessions.status, 'pending')
      ));

    return new Response(JSON.stringify(sessions), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch sessions" }), { status: 500 });
  }
};
