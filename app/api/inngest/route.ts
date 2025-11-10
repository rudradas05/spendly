// app/api/inngest/route.ts (recommended file path)
import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { syncUserUpdation, syncUserDeletion } from "@/lib/inngest/function";

// Serve your Inngest functions (as GET, POST, PUT handlers)
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [syncUserUpdation, syncUserDeletion],
});
