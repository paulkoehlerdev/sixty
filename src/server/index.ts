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
import { type AgentState, getInitialState } from "../lib/state";
import { getSystemPromptForState } from "./system";
import { getAvailableToolsForState } from "./tools";

const model = openai("gpt-4.1-mini");

export class SixtyAgent extends AIChatAgent<Env, AgentState> {
  constructor(ctx: unknown, env: Env) {
    super(ctx, env);

    if (this.messages.length === 0) {
      this.messages.push({
        role: "assistant",
        parts: [{ type: "text", text: "Hey! I'm Chris, happy to help with your booking today. Are you on schedule for you pickup?" }],
      });
      this.saveMessages(this.messages);

      if (!this.state) {
        getInitialState().then((state) => this.setState(state));
      }
    }
  }

  async onChatMessage(
    onFinish: StreamTextOnFinishCallback<ToolSet>,
    options?: {
      abortSignal: AbortSignal | undefined;
    },
  ): Promise<Response | undefined> {
    const result = streamText({
      system: await getSystemPromptForState(this.state),
      messages: convertToModelMessages(this.messages),
      model,
      tools: {
        ...getAvailableToolsForState(this.state),
      },
      onFinish,
      abortSignal: options?.abortSignal,
      stopWhen: stepCountIs(2),
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
