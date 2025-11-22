import { useAgentChat } from "agents/ai-react";
import { useAgent } from "agents/react";
import type { UIMessage } from "ai";
import type React from "react";
import { useState } from "react";
import { Chat } from "@/client/components/Chat.tsx";
import { ChatInput } from "@/client/components/ChatInput.tsx";
import { UIElementContainer } from "@/client/components/ui-elements/UIElementContainer";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AgentState } from "@/types/state.ts";

export const ChatScreen: React.FC<{ sessionID: string }> = ({ sessionID }) => {
  const [agentState, setAgentState] = useState<AgentState | null>(null);

  const agent = useAgent<AgentState>({
    agent: "sixty-agent",
    name: sessionID,
    onStateUpdate: (newState) => setAgentState(newState),
    onOpen: () => {},
    onClose: () => {},
  });

  const agentChat = useAgentChat<AgentState, UIMessage>({ agent });

  const isAgentReadyForNextMessage = agentChat.status === "ready";

  const sendChatMessage = (message: string) => {
    if (!isAgentReadyForNextMessage) {
      return;
    }

    agentChat.sendMessage({
      role: "user",
      parts: [{ type: "text", text: message }],
    });
  };

  const clearHistory = () => {
    agentChat.clearHistory();
    // agent.setState({});
  };

  return (
    <ScrollArea className="relative mx-auto h-screen max-w-lg pt-4">
      {/* Chat Messages - scrollable */}

      <Chat messages={agentChat.messages} isWaitingForResponse={agentChat.status === "submitted"} />

      {/* UI Element - no scroll */}
      {agentState && <UIElementContainer uiState={agentState.uiState} />}

      <div className="h-30"/>

      <div className="fixed right-0 bottom-0 left-0 mx-auto grid max-w-lg justify-items-center bg-background">
        <div className="w-full max-w-[850px]">
          <ChatInput placeholder="Send a message" sendChatMessage={sendChatMessage} />

          <div className="mt-2 inline-block w-full text-center text-xs">
            <button
              type="button"
              className="cursor-pointer underline hover:text-primary"
              onClick={() => clearHistory()}
            >
              Or delete this conversation
            </button>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};
