import { useAgentChat } from "agents/ai-react";
import { useAgent } from "agents/react";
import type { UIMessage } from "ai";
import type React from "react";
import { useState } from "react";
import { Chat } from "@/client/components/Chat.tsx";
import { ChatInput } from "@/client/components/ChatInput.tsx";
import { UIElementContainer } from "@/client/components/ui-elements/UIElementContainer";
import { type AgentState, getInitialState } from "@/types/state.ts";

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
    agent.setState(getInitialState());
  };

  return (
    <div className="grid h-svh w-full grid-rows-[minmax(0,1fr)_auto_auto]">
      {/* Chat Messages - scrollable */}
      <div className="grid justify-items-center overflow-auto p-4" style={{ scrollbarGutter: "stable both-edges" }}>
        <div className="w-full max-w-[850px]">
          <Chat messages={agentChat.messages} isWaitingForResponse={agentChat.status === "submitted"} />
        </div>
      </div>

      {/* UI Element - no scroll */}
      {agentState && <UIElementContainer uiState={agentState.uiState} />}

      {/* Chat Input - fixed */}
      <div className="grid justify-items-center p-4">
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
    </div>
  );
};
