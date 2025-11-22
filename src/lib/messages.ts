import type { OfferId } from "./sixt/types";

export type ControlMessage = AcceptUpgradeControlMessage;

export type AcceptUpgradeControlMessage = {
  controlMessageType: "ACCEPT_UPGRADE";
  offerId: OfferId;
};

export type ChatMessageMetadata = "hidden" | undefined;
