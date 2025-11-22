import type { TextUIPart, UIMessage } from "ai";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { match } from "ts-pattern";
import { Avatar, AvatarImage } from "@/components/ui/avatar.tsx";
import type { ChatMessageMetadata } from "@/lib/messages.ts";
import { cn } from "@/lib/utils";
import { useAgentState } from "./AgentStateContext";
import { StreamingIndicator } from "./chat-streaming";
import { CurrentBookingUI } from "./ui-elements/CurrentBookingUI";
import { ProductsUI } from "./ui-elements/ProductsUI";
import { ProtectionPlansUI } from "./ui-elements/ProtectionPlansUI";
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
  const { agentState, acceptUpgradeOffer } = useAgentState();

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
            .otherwise(() => <React.Fragment key={`unknown-${index}`} />);
        })}
        {message.parts.map((part, index) => {
          return match(part)
            .with({ type: "tool-showCarTypeUpsellOffer" }, (part) => {
              const input = part.input as { offerId: string };
              const offerId = input.offerId;
              const offer = agentState?.availableOffers?.[offerId];

              const aiText = [
                {
                  header: part.input.header_priority0,
                  text: part.input.text_priority0,
                },
                {
                  header: part.input.header_priority1,
                  text: part.input.text_priority1,
                },
                {
                  header: part.input.header_priority2,
                  text: part.input.text_priority2,
                },
              ];

              if (offer) {
                return (
                  <UpgradeOfferUI
                    className="my-4"
                    key={`upsell-${offer.offer_id}`}
                    offer={offer}
                    baseOffer={agentState.initialOffer}
                    booking={agentState?.booking}
                    aiTextInput={aiText}
                    onUpgrade={() => {
                      acceptUpgradeOffer(offerId);
                    }}
                  />
                );
              }
            })
            .with({ type: "tool-showProtectionPackages" }, (part) => {
              const packageIds = part.input.packageIds;
              const bestValuePackageId = part.input.bestValuePackageId;
              const availablePackages = agentState?.booking?.available_add_ons_v2.packages || [];
              const packagesToShow = availablePackages.filter((pkg) => packageIds.includes(pkg.id));

              if (packagesToShow.length > 0) {
                return (
                  <ProtectionPlansUI
                    key={`packages-${index}`}
                    packages={packagesToShow}
                    bestValuePackageId={bestValuePackageId}
                  />
                );
              }
            })
            .with({ type: "tool-showProducts" }, (part) => {
              const productChargeCodes = part.input.productChargeCodes;
              const popularProductChargeCode = part.input.popularProductChargeCode;
              const availableProducts = agentState?.booking?.available_add_ons_v2.products || [];
              const productsToShow = availableProducts.filter((product) =>
                productChargeCodes.includes(product.charge_code),
              );

              if (productsToShow.length > 0) {
                return (
                  <ProductsUI
                    key={`products-${index}`}
                    products={productsToShow}
                    popularProductId={popularProductChargeCode}
                  />
                );
              }
              return null;
            })
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
