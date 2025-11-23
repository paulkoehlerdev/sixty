import { useAgentChat } from "agents/ai-react";
import { useAgent } from "agents/react";
import type { UIMessage } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Moon, Sun, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { AgentStateContext } from "@/client/components/AgentStateContext.tsx";
import { Chat } from "@/client/components/Chat.tsx";
import { ChatInput } from "@/client/components/ChatInput.tsx";
import { BookingSummary } from "@/client/components/ui-elements/BookingSummary.tsx";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  AcceptUpgradeControlMessage,
  ChatMessageMetadata,
  ProcessPaymentControlMessage,
  RevertToInitialOfferControlMessage,
  SelectProtectionPackageControlMessage,
  ToggleProductControlMessage,
  UnlockCarControlMessage,
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

  const unlockCar = () => {
    agent.send(
      JSON.stringify({
        controlMessageType: "UNLOCK_CAR",
      } satisfies UnlockCarControlMessage),
    );
  };

  const revertToInitialOffer = () => {
    agent.send(
      JSON.stringify({
        controlMessageType: "REVERT_TO_INITIAL_OFFER",
      } satisfies RevertToInitialOfferControlMessage),
    );
  };

  const processPayment = async (paymentMethod: "apple" | "google" | "card") => {
    agent.send(
      JSON.stringify({
        controlMessageType: "PROCESS_PAYMENT",
        paymentMethod,
      } satisfies ProcessPaymentControlMessage),
    );
  };

  return (
    <AgentStateContext.Provider
      value={{
        agentState,
        acceptUpgradeOffer,
        selectProtectionPackage,
        toggleProduct,
        unlockCar,
        revertToInitialOffer,
        processPayment,
      }}
    >
      <div className="mx-auto min-h-dvh w-[calc(min(100dvw,32rem))] overflow-hidden px-3 pb-8">
        <BookingsPage
          agentState={agentState}
          onOpenChat={() => setIsDrawerOpen(true)}
          startNewSession={startNewSession}
        />
        <ChatPage
          agentChat={agentChat}
          agentState={agentState}
          sendChatMessage={sendChatMessage}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
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
  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
    } else {
      html.classList.add("dark");
    }
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-black text-2xl">YOUR BOOKINGS</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-accent"
            aria-label="Toggle theme"
          >
            <Sun className="dark:-rotate-90 h-5 w-5 rotate-0 scale-100 transition-all dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </button>
          <button
            type="button"
            className="relative h-20 w-20 cursor-pointer bg-center bg-contain bg-no-repeat"
            onClick={() => startNewSession()}
          >
            <img src="/sixt_dark.svg" alt="Sixt" className="hidden h-full w-full dark:block" />
            <img src="/sixt_light.svg" alt="Sixt" className="block h-full w-full dark:hidden" />
          </button>
        </div>
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
    <button type="button" onClick={onOpenChat} className="mb-6 w-full">
      <Card variant="ai" className="cursor-pointer transition-transform">
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

type ChatPageProps = {
  agentChat: ReturnType<typeof useAgentChat<AgentState, UIMessage<ChatMessageMetadata>>>;
  agentState: AgentState | null;
  sendChatMessage: (message: string, metadata?: ChatMessageMetadata) => void;
  isOpen: boolean;
  onClose: () => void;
};

const ChatPage: React.FC<ChatPageProps> = ({ agentChat, agentState, sendChatMessage, isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col bg-background"
          style={{ height: "100dvh" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex h-full min-h-0 flex-col"
          >
            {/* Header with close button */}
            <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
              <h2 className="font-semibold text-lg">Chat with Chris</h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-accent"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat content */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <ChatContent agentChat={agentChat} agentState={agentState} sendChatMessage={sendChatMessage} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

type ChatContentProps = {
  agentChat: ReturnType<typeof useAgentChat<AgentState, UIMessage<ChatMessageMetadata>>>;
  agentState: AgentState | null;
  sendChatMessage: (message: string, metadata?: ChatMessageMetadata) => void;
};

const ChatContent: React.FC<ChatContentProps> = ({ agentChat, agentState, sendChatMessage }) => {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <ScrollArea className="flex-1 px-4">
        <div className="mx-auto max-w-2xl py-4">
          <Chat
            messages={agentChat.messages}
            isWaitingForResponse={agentChat.status === "submitted"}
            sendChatMessage={sendChatMessage}
          />
          
          {/* Spacer to prevent content from being hidden behind input */}
          {agentState?.stage !== "completed" && <div className="h-24" />}
        </div>
      </ScrollArea>

      {/* Gradient fade at bottom */}
      {agentState?.stage !== "completed" && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 h-24 bg-linear-to-t from-background via-background to-transparent" />
      )}

      {/* Chat input at bottom - absolutely positioned */}
      {agentState?.stage !== "completed" && (
        <div 
          className="fixed inset-x-0 bottom-0 z-20 px-4 py-4"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          <div className="mx-auto max-w-2xl">
            <ChatInput placeholder="Send a message" sendChatMessage={sendChatMessage} />
          </div>
        </div>
      )}
    </div>
  );
};
