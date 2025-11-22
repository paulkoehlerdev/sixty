import { openai } from "@ai-sdk/openai";
import { routeAgentRequest } from "agents";
import { AIChatAgent } from "agents/ai-chat-agent";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  type StreamTextOnFinishCallback,
  stepCountIs,
  streamText,
  type ToolSet,
} from "ai";
import offersData from "../../raw_data/offers_1.json";
import type { CarOffer } from "../lib/offers";

// no server tools for now

const model = openai("gpt-4.1");

export type CurrentUiState = {
  uiMode: "current";
  booking: CarOffer;
};

export type UpgradeUiState = {
  uiMode: "upgrade";
  offer: CarOffer;
};

export type AgentState = {
  uiState: CurrentUiState | UpgradeUiState | null;
};

export class SixtyAgent extends AIChatAgent<Env, AgentState> {
  initialState = {
    uiState: {
      uiMode: "current",
      booking: offersData.offers[0] as CarOffer,
    },
  } satisfies AgentState;

  constructor(ctx: unknown, env: Env) {
    super(ctx, env);
    this.setState(this.initialState);
  }

  async onChatMessage(
    onFinish: StreamTextOnFinishCallback<ToolSet>,
    options?: {
      abortSignal: AbortSignal | undefined;
    },
  ): Promise<Response | undefined> {
    const uiStateContext = JSON.stringify(this.state.uiState ?? null);
    const result = streamText({
      system: `You are Sixty, a helpful assistant.\n\nContext: The client UI state is provided as JSON below. Use it to ground your responses and reference what the user currently sees.\n\nUI_STATE_JSON: ${uiStateContext}`,
      messages: convertToModelMessages(this.messages),
      model,
      // no tools provided
      onFinish,
      abortSignal: options?.abortSignal,
      stopWhen: stepCountIs(10),
    });

    return createUIMessageStreamResponse({
      stream: result.toUIMessageStream(),
    });
  }
}

export default {
  async fetch(request: Request, env: Env) {
    return (await routeAgentRequest(request, env)) || new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
