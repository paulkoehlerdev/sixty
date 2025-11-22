import type { TextUIPart, UIMessage } from "ai";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { match } from "ts-pattern";
import { Avatar, AvatarImage } from "@/components/ui/avatar.tsx";
import type { AgentState } from "@/lib/state";
import { cn } from "@/lib/utils";
import { StreamingIndicator } from "./chat-streaming";
import { CurrentBookingUI } from "./ui-elements/CurrentBookingUI";
import { UpgradeOfferUI } from "./ui-elements/UpgradeOfferUI";

type Props = {
  messages: UIMessage[];
  isWaitingForResponse: boolean;
  agentState: AgentState | null;
};

export const Chat: React.FC<Props> = ({ messages, isWaitingForResponse, agentState }) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  return (
    <div className="flex flex-col gap-4">
      {/* Show current booking at top */}
      {agentState?.initialOffer && <CurrentBookingUI booking={agentState.initialOffer} />}

      {messages.map((message) => {
        return <MessageBubble key={message.id} message={message} agentState={agentState} />;
      })}

      <div>{isWaitingForResponse && <StreamingIndicator />}</div>

      <div ref={chatEndRef} />
    </div>
  );
};

function MessageBubble({ message, agentState }: { message: UIMessage; agentState: AgentState | null }) {
  return (
    <div className={cn("flex gap-2", message.role === "user" ? "items-center justify-end" : "justify-start")}>
      {match(message.role)
        .with("user", () => <UserMessage message={message} />)
        .with("assistant", () => <AssistantMessage message={message} agentState={agentState} />)
        .otherwise(() => (
          <></>
        ))}
    </div>
  );
}

function AssistantMessage({ message, agentState }: { message: UIMessage; agentState: AgentState | null }) {
  return (
    <div className="w-full max-w-full space-y-2">
      <div className="flex items-center gap-3">
        <Avatar className="h-7 w-7">
          <AvatarImage src="/favicon.svg" />
        </Avatar>
        <p className="font-bold text-primary">Chris</p>
      </div>
      <div>
        {message.parts.map((part, index) => {
          return match(part)
            .with({ type: "text" }, (part) => <AssistantTextMessagePart key={`text-${index}`} part={part} />)
            .with({ type: "tool-showCarTypeUpsellOffer" }, (part) => {
              const offerId = part.input.offerId;
              const offer = agentState?.availableOffers[offerId];

              if (offer) {
                return (
                  <UpgradeOfferUI className="mb-4" key={`upsell-${offer.offer_id}`} offer={offer} baseOffer={agentState.initialOffer} />
                );
              }
            })
            .otherwise(() => <React.Fragment key={`unknown-${message.id}`} />);
        })}
      </div>
    </div>
  );
}

function UserMessage({ message }: { message: UIMessage }) {
  const textParts = useMemo(
    () =>
      message.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("")
        .split("\n"),
    [message.parts],
  );

  return (
    <div className="flex max-w-[90%] flex-col items-end gap-2">
      <div className="prose prose-chat wrap-anywhere break-[words] w-fit rounded-2xl bg-accent px-4 py-2.5">
        {textParts.map((part, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: OK in this case, as nothing will be "moved around"
          <React.Fragment key={index}>
            {part}
            {index < textParts.length - 1 && <br />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function AssistantTextMessagePart({ part }: { part: TextUIPart }) {
  return (
    <div className="prose prose-chat w-[90%] max-w-[90%]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children, ...props }) => (
            <div className="-mx-4 overflow-x-scroll px-4">
              <table {...props} className="min-w-full">
                {children}
              </table>
            </div>
          ),
        }}
      >
        {part.text}
      </ReactMarkdown>
    </div>
  );
}
/*const AssistantMessage: React.FC<{ message: UIMessage }> = ({ message }) => {
  return (
    <div className="grid w-full gap-3">
      {message.parts.map((part, index) => {
        switch (part.type) {
          case "text":
            return (
              <div className="w-full whitespace-pre-wrap text-wrap" key={index}>
                {part.text}
              </div>
            );

          case "tool-exampleTool":
            return <div key={part.toolCallId}>{JSON.stringify(part)}</div>;

          case "step-start":
            return <React.Fragment key={index} />;

          default:
            return (
              <div key={index}>
                [UNKNOWN PART TYPE: {part.type}] {JSON.stringify(part)}
              </div>
            );
        }
      })}
    </div>
  );
};*/
