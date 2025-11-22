import type { OfferId } from "./sixt/types";

export type ControlMessage =
  | AcceptUpgradeControlMessage
  | SelectProtectionPackageControlMessage
  | ToggleProductControlMessage;

export type AcceptUpgradeControlMessage = {
  controlMessageType: "ACCEPT_UPGRADE";
  offerId: OfferId;
};

export type SelectProtectionPackageControlMessage = {
  controlMessageType: "SELECT_PROTECTION_PACKAGE";
  packageId: string;
};

export type ToggleProductControlMessage = {
  controlMessageType: "TOGGLE_PRODUCT";
  productChargeCode: string;
};

export type ChatMessageMetadata = "hidden" | undefined;
