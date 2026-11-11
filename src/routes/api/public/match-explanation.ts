import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/match-explanation")({
  server: { handlers: { POST: async ({ request }) => {
    try {
      const { handleMatchExplanation } = await import("@/lib/match-explanation.server");
      return await handleMatchExplanation(request);
    } catch (error) {
      if (request.signal.aborted) return new Response(null, { status: 499 });
      console.error("[match-explanation] request failed", error instanceof Error ? error.message : "Unknown error");
      return Response.json({ message: "Match analysis is unavailable right now. Please try again later." }, { status: 503 });
    }
  } } },
});