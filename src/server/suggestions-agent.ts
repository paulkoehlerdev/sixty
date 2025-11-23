import { openai } from "@ai-sdk/openai";
import { AIChatAgent } from "agents/ai-chat-agent";
import { convertToModelMessages, hasToolCall, stepCountIs, streamText, type Tool } from "ai";
import { z } from "zod";
import type { AgentState } from "../lib/state";

const model = openai("gpt-4.1-nano");

const SUGGESTIONS_SYSTEM_PROMPT = `
You are an answer suggestions generator for a car rental chat assistant.
You will assist the user in answering questions based on the conversation context.

Your job is to analyze the conversation and generate 2-3 answer suggestions that the user might want to click to respond to the assistant's last message.

# Guidelines:
- Generate 2-3 suggestions (minimum 2, maximum 3)
- Each suggestion should be a concise, natural response the user might give
- Suggestions should be meaningful in context - avoid generic "yes"/"no" unless appropriate
- Each suggestion must be 50 characters or less
- Suggestions should help the conversation flow naturally
- Do NOT generate suggestions for actions like "book this" or "add this" - only for answering questions
- Do NOT generate suggestions if the assistant just presented upgrade options or products
- Do NOT generate suggestions if the assistant's message is clearly ending the conversation
- You should most likely NOT generate questions. If you do, make sure they are relevant to the conversation context.
- You should generate ONE opt-out suggestion for the user if they don't want to take an offer. (Formulate it like a user message, e.g. "I don't want to book this car")"

# When to generate suggestions:
- When the assistant asks a question
- When the assistant is gathering information
- When the user might want to provide a quick answer

# When NOT to generate suggestions:
- When the assistant is actively upselling or showing products
- When the assistant's message is ending/closing the conversation
- When the assistant just showed car upgrades, protection packages, or products
- When the conversation is clearly finished

Generate suggestions that feel natural and help the user respond quickly.

You NEED TO CALL "generateSuggestions" with your suggestions to the user. Please always use the "generateSuggestions" tool.
`.trim();

const generateSuggestionsTool = {
  description: `
    Generate answer suggestions for the user based on the conversation context.
    Please only use text and no special markdown formatting. Do not use any special characters or HTML tags.
`,
  inputSchema: z.object({
    answers: z
      .array(z.string().max(50))
      .min(2)
      .max(3)
      .describe("Array of 2-3 answer suggestions, each max 50 characters"),
  }),
  execute: async ({ answers }: { answers: string[] }) => {
    return `Generated ${answers.length} suggestions: ${answers.join(", ")}`;
  },
} satisfies Tool<{ answers: string[] }, string>;

export class AnswerSuggestionsAgent extends AIChatAgent<Env, Record<string, never>> {
  async generateSuggestions(messages: AIChatAgent<Env, AgentState>["messages"]): Promise<string[] | null> {
    const result = streamText({
      system: SUGGESTIONS_SYSTEM_PROMPT,
      messages: convertToModelMessages(messages),
      model,
      tools: {
        generateSuggestions: generateSuggestionsTool,
      },
      stopWhen: [hasToolCall("generateSuggestions"), stepCountIs(2)],
    });

    // Wait for the stream to complete and extract tool calls
    let suggestions: string[] | null = null;

    for await (const chunk of result.fullStream) {
      if (chunk.type === "tool-call" && chunk.toolName === "generateSuggestions") {
        // For tool calls, the input property contains the arguments
        if ("input" in chunk && chunk.input) {
          const input = chunk.input as { answers: string[] };
          if (input && Array.isArray(input.answers)) {
            suggestions = input.answers;
            break;
          }
        }
      }
    }

    return suggestions;
  }
}
