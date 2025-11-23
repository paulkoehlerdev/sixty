import type { TextUIPart, ToolUIPart, UIMessage } from "ai";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { match } from "ts-pattern";
import { Avatar, AvatarImage } from "@/components/ui/avatar.tsx";
import type { ChatMessageMetadata } from "@/lib/messages.ts";
import type { Offer } from "@/lib/sixt/types";
import { cn } from "@/lib/utils";
import type {
  AnswerSuggestionsToolInput,
  CarUpsellOfferToolInput,
  ProductsToolInput,
  ProtectionPackagesToolInput,
} from "@/server/tools.ts";
import { useAgentState } from "./AgentStateContext";
import { StreamingIndicator } from "./chat-streaming";
import { ToolCallShimmer } from "./ToolCallShimmer";
import { BookingSummary } from "./ui-elements/BookingSummary";
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

  // Check if we should show the streaming indicator
  const shouldShowStreamingIndicator = useMemo(() => {
    if (isWaitingForResponse) {
      return true;
    }

    // Define which tool calls render content when finished
    const contentRenderingTools = [
      "tool-showCarTypeUpsellOffer",
      "tool-showProtectionPackages",
      "tool-showProducts",
      "tool-showAnswerSuggestions",
    ];

    // Find the last user message index
    let lastUserMessageIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        lastUserMessageIndex = i;
        break;
      }
    }

    // If no user message found, show indicator
    if (lastUserMessageIndex === -1) {
      return true;
    }

    let hasStreamingToolCall = false;
    let hasCompletedContentRenderingTool = false;

    // Check messages after the last user message
    for (let i = lastUserMessageIndex + 1; i < messages.length; i++) {
      const message = messages[i];
      if (message.role !== "assistant") {
        continue;
      }

      // Check parts
      for (const part of message.parts) {
        // If there's a text part, hide the indicator
        if (part.type === "text" && part.text && part.text.trim().length > 0) {
          return false;
        }

        // Check if it's a tool call
        if (part.type.startsWith("tool-")) {
          const isContentRenderingTool = contentRenderingTools.includes(part.type);

          // Check if tool is still streaming (input-streaming or input-available)
          if ("state" in part && (part.state === "input-streaming" || part.state === "input-available")) {
            hasStreamingToolCall = true;
          }
          // Check if it's a completed content-rendering tool
          else if ("state" in part && isContentRenderingTool && part.state === "output-available") {
            hasCompletedContentRenderingTool = true;
          }
        }
      }
    }

    // If there's a streaming tool call, hide indicator (show tool shimmer instead)
    if (hasStreamingToolCall) {
      return false;
    }

    // If there's a completed content-rendering tool, hide indicator (content is shown)
    if (hasCompletedContentRenderingTool) {
      return false;
    }

    // If we only have completed non-rendering tools, show indicator (still waiting for content)
    return true;
  }, [isWaitingForResponse, messages]);

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

      <div>{shouldShowStreamingIndicator && <StreamingIndicator />}</div>

      {agentState && agentState.stage === "completed" && <BookingSummary state={agentState} />}

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
            .with({ type: "tool-getAvailableCarUpgrades" }, (part) => (
              <AssistantGetAvailableCarUpgradesToolMessagePart
                key={part.toolCallId || `upgrades-${index}`}
                part={part}
              />
            ))
            .with({ type: "tool-abortCarTypeUpsell" }, (part) => (
              <AssistantAbortToolMessagePart
                key={part.toolCallId || `abort-car-${index}`}
                part={part}
                message="Got it"
              />
            ))
            .with({ type: "tool-abortProtectionUpselling" }, (part) => (
              <AssistantAbortToolMessagePart
                key={part.toolCallId || `abort-protection-${index}`}
                part={part}
                message="Understood"
              />
            ))
            .with({ type: "tool-abortAddonUpselling" }, (part) => (
              <AssistantAbortToolMessagePart
                key={part.toolCallId || `abort-addon-${index}`}
                part={part}
                message="Finalizing your booking"
              />
            ))
            .with({ type: "tool-endChat" }, (part) => (
              <AssistantAbortToolMessagePart
                key={part.toolCallId || `end-chat-${index}`}
                part={part}
                message="Preparing your booking summary"
              />
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

        {isLast &&
          !doesShowWidget &&
          answerSuggestionsPart &&
          answerSuggestionsPart.type === "tool-showAnswerSuggestions" && (
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

function AssistantGetAvailableCarUpgradesToolMessagePart({ part }: { part: ToolUIPart }) {
  // Show shimmer while tool is executing
  if (part.state === "input-streaming" || part.state === "input-available") {
    return <ToolCallShimmer message="Checking available car upgrades" />;
  }

  // Don't render anything after tool completes - the LLM will use the data
  return null;
}

function AssistantAbortToolMessagePart({ part, message }: { part: ToolUIPart; message: string }) {
  // Show shimmer while tool is executing
  if (part.state === "input-streaming" || part.state === "input-available") {
    return <ToolCallShimmer message={message} />;
  }

  // Don't render anything after tool completes
  return null;
}

function AssistantShowCarTypeUpsellOfferToolMessagePart({ part }: { part: ToolUIPart }) {
  const { agentState, acceptUpgradeOffer } = useAgentState();

  if (!part.input || part.state === "input-streaming") {
    return <ToolCallShimmer message="Finding the perfect upgrade options for you" />;
  }

  const input = part.input as CarUpsellOfferToolInput;

  // Map each input offer to its data and filter out any missing offers
  let offerData = input.offers
    .map((offerInput) => {
      const offer = agentState?.availableOffers?.[offerInput.offerId];
      if (!offer) {
        return null;
      }

      return {
        offer,
        aiTextInput: [
          { header: offerInput.header_priority0, text: offerInput.text_priority0 },
          { header: offerInput.header_priority1, text: offerInput.text_priority1 },
          { header: offerInput.header_priority2, text: offerInput.text_priority2 },
        ],
      };
    })
    .filter((o): o is { offer: Offer; aiTextInput: { header: string; text: string }[] } => o !== null);

  // If a booking exists with a selected offer, only show that offer
  const selectedOfferId = agentState?.booking?.offer_v2?.offer_id;
  if (selectedOfferId) {
    offerData = offerData.filter(({ offer }) => offer.offer_id === selectedOfferId);
  }

  if (offerData.length === 0) {
    return;
  }

  // Single offer - show without carousel
  if (offerData.length === 1) {
    const { offer, aiTextInput } = offerData[0];
    return (
      <UpgradeOfferUI
        className="my-4"
        offer={offer}
        baseOffer={agentState?.initialOffer}
        booking={agentState?.booking}
        aiTextInput={aiTextInput}
        onUpgrade={() => {
          acceptUpgradeOffer(offer.offer_id);
        }}
      />
    );
  }

  // Multiple offers - show horizontal scroll
  return (
    <div className="flex max-w-lg flex-col gap-4 overflow-x-scroll py-4">
      {offerData.map(({ offer, aiTextInput }) => (
        <div key={offer.offer_id} className="max-w-120 shrink-0">
          <UpgradeOfferUI
            offer={offer}
            baseOffer={agentState?.initialOffer}
            booking={agentState?.booking}
            aiTextInput={aiTextInput}
            onUpgrade={() => {
              acceptUpgradeOffer(offer.offer_id);
            }}
          />
        </div>
      ))}
    </div>
  );
}

function AssistantShowProtectionPackagesToolMessagePart({ part }: { part: ToolUIPart }) {
  const { agentState, selectProtectionPackage } = useAgentState();

  if (!part.input || part.state === "input-streaming") {
    return <ToolCallShimmer message="Preparing protection packages" />;
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
    return <ToolCallShimmer message="Loading available add-ons" />;
  }

  const input = part.input as ProductsToolInput;
  const availableProducts = agentState?.booking?.available_add_ons_v2.products || [];
  const productsToShow = availableProducts.filter((product) => input.productChargeCodes.includes(product.charge_code));

  if (productsToShow.length === 0) {
    return;
  }

  return <ProductsUI products={productsToShow} onProductToggle={toggleProduct} />;
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
