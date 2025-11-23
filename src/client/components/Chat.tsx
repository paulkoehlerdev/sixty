import type { TextUIPart, ToolUIPart, UIMessage } from "ai";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { match } from "ts-pattern";
import { SuggestionChip, SuggestionChipArea } from "@/components/ui/suggestion-chip";
import type { ChatMessageMetadata } from "@/lib/messages.ts";
import type { Offer } from "@/lib/sixt/types";
import { cn } from "@/lib/utils";
import type {
  AddProductToolInput,
  AddProtectionPackageToolInput,
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

const ignoredToolCalls = ["tool-updateScratchpad"];

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

    // Define which tool calls should be ignored for streaming indicator logic

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
          // Skip ignored tool calls
          if (ignoredToolCalls.includes(part.type)) {
            continue;
          }

          // If it's a tool call, hide the indicator
          return false;
        }
      }
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
        .map((message) => ({
          ...message,
          parts: message.parts.filter((part) => part.type !== "step-start" && !ignoredToolCalls.includes(part.type)),
        }))
        // remove messages that have no parts
        .filter((message) => message.parts.length > 0)
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

const MessageBubble = React.memo(function MessageBubble({
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
});

// Helper function to check if there are subsequent parts that would render something
// Only these tool calls actually render UI: addProduct, addProtectionPackage, showProducts, showProtectionPackages, showCarTypeUpsellOffer
function hasSubsequentRenderingParts(parts: UIMessage["parts"], currentIndex: number): boolean {
  for (let i = currentIndex + 1; i < parts.length; i++) {
    const part = parts[i];

    // Skip answer suggestions as they're handled separately
    if (part.type === "tool-showAnswerSuggestions") {
      continue;
    }

    // Text parts always render
    if (part.type === "text") {
      return true;
    }

    // Only these specific tool calls render something
    if (
      part.type === "tool-addProduct" ||
      part.type === "tool-addProtectionPackage" ||
      part.type === "tool-showProducts" ||
      part.type === "tool-showProtectionPackages" ||
      part.type === "tool-showCarTypeUpsellOffer"
    ) {
      return true;
    }
  }

  return false;
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
      {
        <div className="flex items-center gap-3">
          {/*<Avatar className="h-7 w-7">
          <AvatarImage src="/favicon.svg" />
        </Avatar>*/}
          <p className="font-bold text-primary">Chris</p>
        </div>
      }
      <div>
        {message.parts.map((part, index) => {
          // Skip answer suggestions here - they're handled separately at the end
          if (part.type === "tool-showAnswerSuggestions") {
            return null;
          }

          const hasSubsequentParts = hasSubsequentRenderingParts(message.parts, index);

          return match(part)
            .with({ type: "text" }, (part) => (
              <AssistantTextMessagePart key={`${message.id}-${part.type}-${index}`} part={part} />
            ))
            .with({ type: "tool-getAvailableCarUpgrades" }, (part) => (
              <AssistantGetAvailableCarUpgradesToolMessagePart
                key={part.toolCallId}
                part={part}
                hasSubsequentParts={hasSubsequentParts}
              />
            ))
            .with({ type: "tool-abortCarTypeUpsell" }, (part) => (
              <AssistantAbortToolMessagePart
                key={part.toolCallId}
                part={part}
                message="Got it"
                hasSubsequentParts={hasSubsequentParts}
              />
            ))
            .with({ type: "tool-abortProtectionUpselling" }, (part) => (
              <AssistantAbortToolMessagePart
                key={part.toolCallId}
                part={part}
                message="Understood"
                hasSubsequentParts={hasSubsequentParts}
              />
            ))
            .with({ type: "tool-abortAddonUpselling" }, (part) => (
              <AssistantAbortToolMessagePart
                key={part.toolCallId}
                part={part}
                message="Finalizing your booking"
                hasSubsequentParts={hasSubsequentParts}
              />
            ))
            .with({ type: "tool-endChat" }, (part) => (
              <AssistantAbortToolMessagePart
                key={part.toolCallId}
                part={part}
                message="Preparing your booking summary"
                hasSubsequentParts={hasSubsequentParts}
              />
            ))
            .with({ type: "tool-showCarTypeUpsellOffer" }, (part) => (
              <AssistantShowCarTypeUpsellOfferToolMessagePart
                key={part.toolCallId}
                part={part}
                hasSubsequentParts={hasSubsequentParts}
              />
            ))
            .with({ type: "tool-showProtectionPackages" }, (part) => (
              <AssistantShowProtectionPackagesToolMessagePart
                key={part.toolCallId}
                part={part}
                hasSubsequentParts={hasSubsequentParts}
              />
            ))
            .with({ type: "tool-showProducts" }, (part) => (
              <AssistantShowProductsToolMessagePart
                key={part.toolCallId}
                part={part}
                hasSubsequentParts={hasSubsequentParts}
              />
            ))
            .with({ type: "tool-addProtectionPackage" }, (part) => (
              <AssistantAddProtectionPackageToolMessagePart
                key={part.toolCallId}
                part={part}
                hasSubsequentParts={hasSubsequentParts}
              />
            ))
            .with({ type: "tool-addProduct" }, (part) => (
              <AssistantAddProductToolMessagePart
                key={part.toolCallId}
                part={part}
                hasSubsequentParts={hasSubsequentParts}
              />
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
      <div className="prose prose-chat wrap-anywhere break-[words] w-fit rounded-2xl bg-accent px-3 py-2">
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

function AssistantGetAvailableCarUpgradesToolMessagePart({
  part,
  hasSubsequentParts,
}: {
  part: ToolUIPart;
  hasSubsequentParts: boolean;
}) {
  // Show shimmer while tool is executing
  if (part.state === "input-streaming" || part.state === "input-available") {
    return <ToolCallShimmer message="Checking available car upgrades" />;
  }

  // Keep showing shimmer if tool completed but doesn't render and there are no subsequent parts
  if (!hasSubsequentParts) {
    return <ToolCallShimmer message="Checking available car upgrades" />;
  }

  // Don't render anything after tool completes - the LLM will use the data
  return null;
}

function AssistantAbortToolMessagePart({
  part,
  message,
  hasSubsequentParts,
}: {
  part: ToolUIPart;
  message: string;
  hasSubsequentParts: boolean;
}) {
  // Show shimmer while tool is executing
  if (part.state === "input-streaming" || part.state === "input-available") {
    return <ToolCallShimmer message={message} />;
  }

  // Keep showing shimmer if tool completed but doesn't render and there are no subsequent parts
  if (!hasSubsequentParts) {
    return <ToolCallShimmer message={message} />;
  }

  // Don't render anything after tool completes
  return null;
}

function AssistantShowCarTypeUpsellOfferToolMessagePart({
  part,
  hasSubsequentParts,
}: {
  part: ToolUIPart;
  hasSubsequentParts: boolean;
}) {
  const { agentState, acceptUpgradeOffer } = useAgentState();

  if (part.state === "input-streaming") {
    return <ToolCallShimmer message="Finding the perfect upgrade options for you" />;
  }

  if (!part.input) {
    // Keep showing shimmer if no subsequent parts
    if (!hasSubsequentParts) {
      return <ToolCallShimmer message="Finding the perfect upgrade options for you" />;
    }
    return null;
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
    // Keep showing shimmer if no offers and no subsequent parts
    if (!hasSubsequentParts) {
      return <ToolCallShimmer message="Finding the perfect upgrade options for you" />;
    }
    return null;
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
    <div className="scrollbar-none flex w-(--chat-width) max-w-lg snap-x snap-mandatory flex-row gap-4 overflow-x-scroll py-4">
      {offerData.map(({ offer, aiTextInput }) => (
        <div key={offer.offer_id} className="max-w-[calc(0.95*var(--chat-width))] shrink-0 snap-center">
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

function AssistantShowProtectionPackagesToolMessagePart({
  part,
  hasSubsequentParts,
}: {
  part: ToolUIPart;
  hasSubsequentParts: boolean;
}) {
  const { agentState, selectProtectionPackage } = useAgentState();

  if (part.state === "input-streaming") {
    return <ToolCallShimmer message="Preparing protection packages" />;
  }

  if (!part.input) {
    // Keep showing shimmer if no subsequent parts
    if (!hasSubsequentParts) {
      return <ToolCallShimmer message="Preparing protection packages" />;
    }
    return null;
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
    // Keep showing shimmer if no packages and no subsequent parts
    if (!hasSubsequentParts) {
      return <ToolCallShimmer message="Preparing protection packages" />;
    }
    return null;
  }

  return (
    <ProtectionPlansUI
      packages={packagesToShow}
      bestValuePackageId={input.bestValuePackageId}
      onPackageSelect={selectProtectionPackage}
    />
  );
}

function AssistantShowProductsToolMessagePart({
  part,
  hasSubsequentParts,
}: {
  part: ToolUIPart;
  hasSubsequentParts: boolean;
}) {
  const { agentState, toggleProduct } = useAgentState();

  if (part.state === "input-streaming") {
    return <ToolCallShimmer message="Loading available add-ons" />;
  }

  if (!part.input) {
    // Keep showing shimmer if no subsequent parts
    if (!hasSubsequentParts) {
      return <ToolCallShimmer message="Loading available add-ons" />;
    }
    return null;
  }

  const input = part.input as ProductsToolInput;
  const availableProducts = agentState?.booking?.available_add_ons_v2.products || [];
  const productsToShow = availableProducts.filter((product) => input.productChargeCodes.includes(product.charge_code));

  if (productsToShow.length === 0) {
    // Keep showing shimmer if no products and no subsequent parts
    if (!hasSubsequentParts) {
      return <ToolCallShimmer message="Loading available add-ons" />;
    }
    return null;
  }

  return <ProductsUI products={productsToShow} onProductToggle={toggleProduct} />;
}

function AssistantAddProtectionPackageToolMessagePart({
  part,
  hasSubsequentParts,
}: {
  part: ToolUIPart;
  hasSubsequentParts: boolean;
}) {
  const { agentState, selectProtectionPackage } = useAgentState();

  if (part.state === "input-streaming") {
    return <ToolCallShimmer message="Adding protection package to your booking" />;
  }

  if (!part.input) {
    // Keep showing shimmer if no subsequent parts
    if (!hasSubsequentParts) {
      return <ToolCallShimmer message="Adding protection package to your booking" />;
    }
    return null;
  }

  const input = part.input as AddProtectionPackageToolInput;
  const availablePackages = agentState?.booking?.available_add_ons_v2.packages || [];
  const packageToShow = availablePackages.find((pkg) => pkg.id === input.packageId);

  if (!packageToShow) {
    // Keep showing shimmer if package not found and no subsequent parts
    if (!hasSubsequentParts) {
      return <ToolCallShimmer message="Adding protection package to your booking" />;
    }
    return null;
  }

  // Render the package that was added (it should already be marked as selected in the state)
  return <ProtectionPlansUI packages={[packageToShow]} onPackageSelect={selectProtectionPackage} />;
}

function AssistantAddProductToolMessagePart({
  part,
  hasSubsequentParts,
}: {
  part: ToolUIPart;
  hasSubsequentParts: boolean;
}) {
  const { agentState, toggleProduct } = useAgentState();

  if (part.state === "input-streaming") {
    return <ToolCallShimmer message="Adding products to your booking" />;
  }

  if (!part.input) {
    // Keep showing shimmer if no subsequent parts
    if (!hasSubsequentParts) {
      return <ToolCallShimmer message="Adding products to your booking" />;
    }
    return null;
  }

  const input = part.input as AddProductToolInput;
  const availableProducts = agentState?.booking?.available_add_ons_v2.products || [];
  const productsToShow = availableProducts.filter((product) => input.productChargeCodes.includes(product.charge_code));

  if (productsToShow.length === 0) {
    // Keep showing shimmer if no products found and no subsequent parts
    if (!hasSubsequentParts) {
      return <ToolCallShimmer message="Adding products to your booking" />;
    }
    return null;
  }

  // Render the products that were added (they should already be marked as selected in the state)
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

  if (part.state === "input-streaming") {
    return;
  }

  if (!part.input) {
    return null;
  }

  const answers = (part.input as AnswerSuggestionsToolInput).answers;

  return (
    <SuggestionChipArea className="mt-1">
      {answers.map((answer, _index) => (
        <SuggestionChip key={`anseroption-${answer}`} suggestion={answer} onClick={() => sendChatMessage(answer)} />
      ))}
    </SuggestionChipArea>
  );
}
