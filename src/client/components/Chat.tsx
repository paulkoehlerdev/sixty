import type { TextUIPart, ToolUIPart, UIMessage } from "ai";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { match } from "ts-pattern";
import { Avatar, AvatarImage } from "@/components/ui/avatar.tsx";
import type { ChatMessageMetadata } from "@/lib/messages.ts";
import { cn } from "@/lib/utils";
import type { CarUpsellOfferToolInput } from "@/server/tools.ts";
import { useAgentState } from "./AgentStateContext";
import { StreamingIndicator } from "./chat-streaming";
import { CurrentBookingUI } from "./ui-elements/CurrentBookingUI";
import { UpgradeOfferUI } from "./ui-elements/UpgradeOfferUI";

type Props = {
  messages: UIMessage<ChatMessageMetadata>[];
  isWaitingForResponse: boolean;
};

export const Chat: React.FC<Props> = ({ messages, isWaitingForResponse }) => {
  const { agentState } = useAgentState();
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
      {agentState?.initialOffer && <CurrentBookingUI booking={agentState.initialOffer} />}

      {messages
        .filter((message) => !message.metadata || message.metadata !== "hidden")
        .map((message) => {
          return <MessageBubble key={message.id} message={message} />;
        })}

      <div>{isWaitingForResponse && <StreamingIndicator />}</div>

      <div ref={chatEndRef} />
    </div>
  );
};

function MessageBubble({ message }: { message: UIMessage }) {
  return (
    <div className={cn("flex gap-2", message.role === "user" ? "items-center justify-end" : "justify-start")}>
      {match(message.role)
        .with("user", () => <UserMessage message={message} />)
        .with("assistant", () => <AssistantMessage message={message} />)
        .otherwise(() => (
          <></>
        ))}
    </div>
  );
}

function AssistantMessage({ message }: { message: UIMessage }) {
  return (
    <div className="w-full max-w-full space-y-2">
      <div className="flex items-center gap-3">
        <Avatar className="h-7 w-7">
          <AvatarImage src="/favicon.svg" />
        </Avatar>
        <p className="font-bold text-primary">Chris</p>
      </div>
      <div>
        {message.parts
          .filter((part) => part.type === "text")
          .map((part, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: ignored
            <AssistantTextMessagePart key={`text-${index}`} part={part} />
          ))}

        {message.parts.map((part, index) => {
          return match(part)
            .with({ type: "tool-showCarTypeUpsellOffer" }, (part) => (
              <AssistantShowCarTypeUpsellOfferToolMessagePart part={part} />
            ))
            .otherwise(() => <React.Fragment key={`unknown-${message.id}-${index}`} />);
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

function AssistantShowCarTypeUpsellOfferToolMessagePart({ part }: { part: ToolUIPart }) {
  const { agentState, acceptUpgradeOffer } = useAgentState();

  if (!part.input || part.state === "input-streaming") {
    return;
  }

  const input = part.input as CarUpsellOfferToolInput;
  const offer = agentState?.availableOffers?.[input.offerId];

  if (!offer) {
    return;
  }

  return (
    <UpgradeOfferUI
      className="my-4"
      key={`upsell-${offer.offer_id}`}
      offer={offer}
      baseOffer={agentState.initialOffer}
      aiTextInput={[
        {
          header: input.header_priority0,
          text: input.text_priority0,
        },
        {
          header: input.header_priority1,
          text: input.text_priority1,
        },
        {
          header: input.header_priority2,
          text: input.text_priority2,
        },
      ]}
      onUpgrade={() => {
        acceptUpgradeOffer(input.offerId);
      }}
    />
  );
}
