import { z } from 'zod';
import type { Tool } from 'ai';

export const exampleTool = {
    description: `Example tool description`.trim(),
    inputSchema: z.object({ query: z.string().describe('Some query') }),
    execute: async ({ query }, { toolCallId }) => {
        return `Example tool output`;
    },
} satisfies Tool<{ query: string }, unknown>;

