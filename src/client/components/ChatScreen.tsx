import { useAgentChat } from "agents/ai-react";
import { useAgent } from "agents/react";
import type { UIMessage } from "ai";
import type React from "react";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { AgentStateContext } from "@/client/components/AgentStateContext.tsx";
import { Chat } from "@/client/components/Chat.tsx";
import { ChatInput } from "@/client/components/ChatInput.tsx";
import { BookingSummary } from "@/client/components/ui-elements/BookingSummary.tsx";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer";
import { Card, CardContent } from "@/components/ui/card";
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
      <div className="h-screen w-screen">
      <BookingsPage
        agentState={agentState}
        onOpenChat={() => setIsDrawerOpen(true)}
        startNewSession={startNewSession}
      />
      <ChatDrawer
        agentChat={agentChat}
        agentState={agentState}
        sendChatMessage={sendChatMessage}
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </div>
    </AgentStateContext.Provider>
  );
};

type BookingsPageProps = {
  agentState: AgentState | null;
  onOpenChat: () => void;
  startNewSession: () => void;
};

const BookingsPage: React.FC<BookingsPageProps> = ({ agentState, onOpenChat, startNewSession }) => {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-bold text-3xl">BOOKINGS</h1>
        <button
          type="button"
          className="relative h-20 w-20 cursor-pointer bg-center bg-contain bg-no-repeat"
          style={{
            backgroundImage: `url("/sixt.svg")`,
          }}
          onClick={() => startNewSession()}
        />
      </div>
      
      <ChatNotificationButton onOpenChat={onOpenChat} />

      {agentState && <BookingSummary state={agentState} />}
    </>
  );
};

type ChatNotificationButtonProps = {
  onOpenChat: () => void;
};

const ChatNotificationButton: React.FC<ChatNotificationButtonProps> = ({ onOpenChat }) => {
  return (
    <button
      type="button"
      onClick={onOpenChat}
      className="mb-6 w-full"
    >
      <Card variant="ai" className="cursor-pointer shadow-lg transition-transform">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <MessageCircle className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-base">Chat with Chris</p>
            <p className="text-muted-foreground text-sm">Get help with your booking</p>
          </div>
        </CardContent>
      </Card>
    </button>
  );
};

type ChatDrawerProps = {
  agentChat: ReturnType<typeof useAgentChat<AgentState, UIMessage<ChatMessageMetadata>>>;
  agentState: AgentState | null;
  sendChatMessage: (message: string, metadata?: ChatMessageMetadata) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

const ChatDrawer: React.FC<ChatDrawerProps> = ({
  agentChat,
  agentState,
  sendChatMessage,
  isOpen,
  onOpenChange,
}) => {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[96vh] min-h-[96vh]">
        <ChatContent
          agentChat={agentChat}
          agentState={agentState}
          sendChatMessage={sendChatMessage}
        />
      </DrawerContent>
    </Drawer>
  );
};

type ChatContentProps = {
  agentChat: ReturnType<typeof useAgentChat<AgentState, UIMessage<ChatMessageMetadata>>>;
  agentState: AgentState | null;
  sendChatMessage: (message: string, metadata?: ChatMessageMetadata) => void;
};

const ChatContent: React.FC<ChatContentProps> = ({
  agentChat,
  agentState,
  sendChatMessage,
}) => {
  return (
    <ScrollArea className="relative mx-auto h-[96vh] max-w-lg px-3 pt-4">
      <Chat
        messages={agentChat.messages}
        isWaitingForResponse={agentChat.status === "submitted"}
        sendChatMessage={sendChatMessage}
      />

      <div className="h-30" />

      <div className="fixed right-3 bottom-0 left-3 mx-auto grid max-w-lg justify-items-center">
        {agentState?.stage !== "completed" && (
          <>
            <div className="fixed inset-x-0 bottom-0 h-24 bg-linear-to-t from-background via-background to-transparent" />
            <div className="relative z-10 mb-5 w-full">
              <ChatInput placeholder="Send a message" sendChatMessage={sendChatMessage} />
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  );
};
