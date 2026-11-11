import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";

import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.server.ts";

export function createResponsesCall(
  request: Request,
  config: { baseURL: string; apiKey: string; model: string },
  messages: ModelMessage[],
  instructions?: string,
) {
  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  let status = 200;
  let message = "AI analysis is temporarily unavailable.";
  let denied = false;
  let settle: () => void = () => {};
  const inspected = new Promise<void>((resolve) => { settle = resolve; });
  const provider = createOpenAI({
    baseURL: `${config.baseURL.replace(/\/+$/, "").replace(/\/v1$/, "")}/v1`,
    apiKey: config.apiKey,
    headers: { "Lovable-API-Key": config.apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input, init) => {
      try {
        const response = await runIdFetch.fetch(input, init);
        status = response.status;
        if (!response.ok) {
          const body = await response.clone().json().catch(() => null);
          message = body?.message ?? body?.error?.message ?? message;
          const type = body?.type ?? body?.error?.type;
          denied = status === 403 && !["credit_limit_reached", "model_vendor_not_enabled", "provider_not_available_in_region", "model_requires_retention_consent"].includes(type);
        }
        return response;
      } catch (error) { status = 503; throw error; }
      finally { settle(); }
    },
  });
  const reasoning = config.model !== "openai/chat-latest";
  const result = streamText({
    model: provider.responses(config.model),
    // AI SDK 6 lacks `instructions`: rename this key to `system` there.
    ...(instructions ? { instructions } : {}),
    messages,
    maxRetries: 0,
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        store: false,
        ...(reasoning
          ? {
              forceReasoning: true,
              reasoningEffort: "low",
              reasoningSummary: "auto",
              include: ["reasoning.encrypted_content"],
            }
          : {}),
      },
    },
  });
  return {
    result,
    gateway: { getRunId: runIdFetch.getRunId, waitForRunId: async () => { await inspected; return runIdFetch.getRunId(); } },
    gatewayStatus: () => status,
    gatewayMessage: () => message,
    providerDenied: () => denied,
    response: () =>
      withLovableAiGatewayRunIdHeader(result.toUIMessageStreamResponse({ sendReasoning: true }), runIdFetch),
  };
}
