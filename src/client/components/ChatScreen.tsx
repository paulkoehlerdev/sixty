import { useAgentChat } from "agents/ai-react";
import { useAgent } from "agents/react";
import type { UIMessage } from "ai";
import type React from "react";
import { useState } from "react";
import { Chat } from "@/client/components/Chat.tsx";
import { ChatInput } from "@/client/components/ChatInput.tsx";

type AgentState = {};

export const ChatScreen: React.FC<{ sessionID: string }> = ({ sessionID }) => {
  const [_agentState, setAgentState] = useState<AgentState>({});

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
    agent.setState({});
  };

  return (
    <div className="grid h-svh w-full grid-rows-[1fr_170px]">
      <div className="grid justify-items-center overflow-auto p-4" style={{ scrollbarGutter: "stable both-edges" }}>
        <div className="w-full max-w-[850px]">
          <Chat messages={agentChat.messages} isWaitingForResponse={agentChat.status === "submitted"} />
        </div>
      </div>

      <div className="grid justify-items-center p-4">
        <div className="w-full max-w-[850px]">
          <ChatInput placeholder="Send a message" sendChatMessage={sendChatMessage} />

          <div className="mt-2 inline-block w-full text-center text-xs">
            <a className="cursor-pointer underline hover:text-primary" onClick={() => clearHistory()}>
              Or delete this conversation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
