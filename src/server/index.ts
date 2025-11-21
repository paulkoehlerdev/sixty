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
import { exampleTool } from "./tools";

const model = openai("gpt-4.1");

type AgentState = {};

export class SixtyAgent extends AIChatAgent<Env, AgentState> {
  initialState = {} satisfies AgentState;

  async onChatMessage(
    onFinish: StreamTextOnFinishCallback<ToolSet>,
    options?: {
      abortSignal: AbortSignal | undefined;
    },
  ): Promise<Response | undefined> {
    const result = streamText({
      system: "You are Sixty, a helpful assistant.",
      messages: convertToModelMessages(this.messages),
      model,
      tools: {
        exampleTool,
      },
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
