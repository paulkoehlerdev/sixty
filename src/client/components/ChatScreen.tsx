import { useAgentChat } from "agents/ai-react";
import { useAgent } from "agents/react";
import type { UIMessage } from "ai";
import type React from "react";
import { useState } from "react";
import { AgentStateContext } from "@/client/components/AgentStateContext.tsx";
import { Chat } from "@/client/components/Chat.tsx";
import { ChatInput } from "@/client/components/ChatInput.tsx";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  AcceptUpgradeControlMessage,
  ChatMessageMetadata,
  SelectProtectionPackageControlMessage,
  ToggleProductControlMessage,
} from "@/lib/messages.ts";
import type { OfferId } from "@/lib/sixt/types.ts";
import type { AgentState } from "@/lib/state.ts";

export const ChatScreen: React.FC<{ sessionID: string; startNewSession: () => void }> = ({
  sessionID,
  startNewSession,
}) => {
  const [agentState, setAgentState] = useState<AgentState | null>(null);

  const agent = useAgent<AgentState>({
    agent: "sixty-agent",
    name: sessionID,
    onStateUpdate: (newState) => setAgentState(newState),
    onOpen: () => {},
    onClose: () => {},
  });

  const agentChat = useAgentChat<AgentState, UIMessage<ChatMessageMetadata>>({ agent });

  const isAgentReadyForNextMessage = agentChat.status === "ready";

  const sendChatMessage = (message: string, metadata?: ChatMessageMetadata) => {
    if (!isAgentReadyForNextMessage) {
      return;
    }

    agentChat.sendMessage({
      role: "user",
      parts: [{ type: "text", text: message }],
      metadata,
    });
  };

  const acceptUpgradeOffer = (offerId: OfferId) => {
    agent.send(JSON.stringify({ controlMessageType: "ACCEPT_UPGRADE", offerId } satisfies AcceptUpgradeControlMessage));
  };

  const selectProtectionPackage = (packageId: string) => {
    agent.send(
      JSON.stringify({
        controlMessageType: "SELECT_PROTECTION_PACKAGE",
        packageId,
      } satisfies SelectProtectionPackageControlMessage),
    );
  };

  const toggleProduct = (productChargeCode: string) => {
    agent.send(
      JSON.stringify({
        controlMessageType: "TOGGLE_PRODUCT",
        productChargeCode,
      } satisfies ToggleProductControlMessage),
    );
  };

  return (
    <AgentStateContext.Provider value={{ agentState, acceptUpgradeOffer, selectProtectionPackage, toggleProduct }}>
      <ScrollArea className="relative mx-auto h-screen max-w-lg px-2 pt-4">
        <div className="mb-3 flex h-20 w-full">
          <button
            type="button"
            className="relative h-full w-20 cursor-pointer bg-center bg-contain bg-no-repeat"
            style={{
              backgroundImage: `url("/sixt.svg")`,
            }}
            onClick={() => startNewSession()}
          />
        </div>

        <Chat
          messages={agentChat.messages}
          isWaitingForResponse={agentChat.status === "submitted"}
          sendChatMessage={sendChatMessage}
        />

        <div className="h-30" />

        <div className="fixed right-0 bottom-0 left-0 mx-auto grid max-w-lg justify-items-center bg-background">
          {agentState?.stage !== "completed" && (
            <div className="w-full max-w-[850px]">
              <ChatInput placeholder="Send a message" sendChatMessage={sendChatMessage} />
            </div>
          )}
          <div className="mt-2 inline-block w-full text-center text-xs">
            <button
              type="button"
              className="cursor-pointer underline hover:text-primary"
              onClick={() => startNewSession()}
            >
              New Session
            </button>
          </div>
        </div>
      </ScrollArea>
    </AgentStateContext.Provider>
  );
};
