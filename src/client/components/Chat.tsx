import type { TextUIPart, ToolUIPart, UIMessage } from "ai";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { match } from "ts-pattern";
import { Avatar, AvatarImage } from "@/components/ui/avatar.tsx";
import type { ChatMessageMetadata } from "@/lib/messages.ts";
import { cn } from "@/lib/utils";
import type {
  AnswerSuggestionsToolInput,
  CarUpsellOfferToolInput,
  ProductsToolInput,
  ProtectionPackagesToolInput,
} from "@/server/tools.ts";
import { useAgentState } from "./AgentStateContext";
import { StreamingIndicator } from "./chat-streaming";
import { CurrentBookingUI } from "./ui-elements/CurrentBookingUI";
import { ProductsUI } from "./ui-elements/ProductsUI";
import { ProtectionPlansUI } from "./ui-elements/ProtectionPlansUI";
import { UpgradeOfferUI } from "./ui-elements/UpgradeOfferUI";

type Props = {
  messages: UIMessage<ChatMessageMetadata>[];
  isWaitingForResponse: boolean;
  sendChatMessage: (message: string) => void;
};

export const Chat: React.FC<Props> = ({ messages, isWaitingForResponse, sendChatMessage }) => {
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
      {agentState?.initialOffer && (
        <>
          <CurrentBookingUI
            booking={agentState.initialOffer}
            pickupLocation={agentState.pickupLocation}
            returnLocation={agentState.returnLocation}
          />

          <div className="mb-1" />
        </>
      )}

      {messages
        .filter((message) => !message.metadata || message.metadata !== "hidden")
        .map((message, index, arr) => {
          return (
            <MessageBubble
              key={message.id}
              message={message}
              isLast={index === arr.length - 1}
              sendChatMessage={sendChatMessage}
            />
          );
        })}

      <div>{isWaitingForResponse && <StreamingIndicator />}</div>

      <div ref={chatEndRef} />
    </div>
  );
};

function MessageBubble({
  message,
  isLast,
  sendChatMessage,
}: {
  message: UIMessage;
  isLast: boolean;
  sendChatMessage: (message: string) => void;
}) {
  return (
    <div className={cn("flex gap-2", message.role === "user" ? "items-center justify-end" : "justify-start")}>
      {match(message.role)
        .with("user", () => <UserMessage message={message} />)
        .with("assistant", () => (
          <AssistantMessage message={message} isLast={isLast} sendChatMessage={sendChatMessage} />
        ))
        .otherwise(() => (
          <></>
        ))}
    </div>
  );
}

function AssistantMessage({
  message,
  isLast,
  sendChatMessage,
}: {
  message: UIMessage;
  isLast: boolean;
  sendChatMessage: (message: string) => void;
}) {
  const doesShowWidget =
    message.parts.filter((p) => p.type.startsWith("tool-show") && p.type !== "tool-showAnswerSuggestions").length > 0;

  // Find answer suggestions part to handle separately
  const answerSuggestionsPart = message.parts.find((p) => p.type === "tool-showAnswerSuggestions");

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
          // Skip answer suggestions here - they're handled separately at the end
          if (part.type === "tool-showAnswerSuggestions") {
            return null;
          }

          return match(part)
            .with({ type: "text" }, (part) => (
              <AssistantTextMessagePart key={`${message.id}-text-${index}`} part={part} />
            ))
            .with({ type: "tool-showCarTypeUpsellOffer" }, (part) => (
              <AssistantShowCarTypeUpsellOfferToolMessagePart key={part.toolCallId || `upsell-${index}`} part={part} />
            ))
            .with({ type: "tool-showProtectionPackages" }, (part) => (
              <AssistantShowProtectionPackagesToolMessagePart
                key={part.toolCallId || `packages-${index}`}
                part={part}
              />
            ))
            .with({ type: "tool-showProducts" }, (part) => (
              <AssistantShowProductsToolMessagePart key={part.toolCallId || `products-${index}`} part={part} />
            ))
            .otherwise(() => <React.Fragment key={`unknown-${message.id}-${index}`} />);
        })}

        {isLast && !doesShowWidget && answerSuggestionsPart && answerSuggestionsPart.type === "tool-showAnswerSuggestions" && (
          <AssistantShowAnswerSuggestionsToolMessagePart
            part={answerSuggestionsPart as ToolUIPart}
            sendChatMessage={sendChatMessage}
          />
        )}
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
      offer={offer}
      baseOffer={agentState.initialOffer}
      booking={agentState?.booking}
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

function AssistantShowProtectionPackagesToolMessagePart({ part }: { part: ToolUIPart }) {
  const { agentState, selectProtectionPackage } = useAgentState();

  if (!part.input || part.state === "input-streaming") {
    return;
  }

  const input = part.input as ProtectionPackagesToolInput;
  const availablePackages = agentState?.booking?.available_add_ons_v2.packages || [];
  let packagesToShow = availablePackages.filter((pkg) => input.packageIds.includes(pkg.id));

  // If any package is selected, only show the selected one
  const selectedPackage = packagesToShow.find((pkg) => pkg.is_selected);
  if (selectedPackage) {
    packagesToShow = [selectedPackage];
  }

  if (packagesToShow.length === 0) {
    return;
  }

  return (
    <ProtectionPlansUI
      packages={packagesToShow}
      bestValuePackageId={input.bestValuePackageId}
      onPackageSelect={selectProtectionPackage}
    />
  );
}

function AssistantShowProductsToolMessagePart({ part }: { part: ToolUIPart }) {
  const { agentState, toggleProduct } = useAgentState();

  if (!part.input || part.state === "input-streaming") {
    return;
  }

  const input = part.input as ProductsToolInput;
  const availableProducts = agentState?.booking?.available_add_ons_v2.products || [];
  const productsToShow = availableProducts.filter((product) => input.productChargeCodes.includes(product.charge_code));

  if (productsToShow.length === 0) {
    return;
  }

  return (
    <ProductsUI
      products={productsToShow}
      onProductToggle={toggleProduct}
    />
  );
}

function AssistantShowAnswerSuggestionsToolMessagePart({
  part,
  sendChatMessage,
}: {
  part: ToolUIPart;
  sendChatMessage: (message: string) => void;
}) {
  if (!part) {
    return;
  }

  if (!part.input || part.state === "input-streaming") {
    return;
  }

  const answers = (part.input as AnswerSuggestionsToolInput).answers;

  return (
    <div className="my-5 flex flex-col justify-start gap-0.5">
      {answers.map((answer, _index) => (
        <button
          key={`anseroption-${answer}`}
          type="button"
          className="mb-2 w-max cursor-pointer rounded-lg border border-primary bg-background p-2 px-4 text-primary"
          onClick={() => sendChatMessage(answer)}
        >
          {answer}
        </button>
      ))}
    </div>
  );
}
