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
import { type AgentState, getInitialState } from "../types/state";
import { getSystemPromptForState } from "./system";
import { getAvailableToolsForState } from "./tools";

const model = openai("gpt-4.1");

export class SixtyAgent extends AIChatAgent<Env, AgentState> {
  initialState = getInitialState();

  constructor(ctx: unknown, env: Env) {
    super(ctx, env);
    
    // Only initialize state if this is a new agent (no state in DB)
    // The getter will automatically load persisted state or fall back to initialState
    if (!this.state) {
      this.setState(this.initialState);
    }
  }

  async onChatMessage(
    onFinish: StreamTextOnFinishCallback<ToolSet>,
    options?: {
      abortSignal: AbortSignal | undefined;
    },
  ): Promise<Response | undefined> {
    const result = streamText({
      system: getSystemPromptForState(this.state),
      messages: convertToModelMessages(this.messages),
      model,
      tools: getAvailableToolsForState(this.state),
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
