import type { OfferId } from "./sixt/types";

export type ControlMessage =
  | AcceptUpgradeControlMessage
  | SelectProtectionPackageControlMessage
  | ToggleProductControlMessage
  | RevertToInitialOfferControlMessage
  | ProcessPaymentControlMessage
  | UnlockCarControlMessage;

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

export type RevertToInitialOfferControlMessage = {
  controlMessageType: "REVERT_TO_INITIAL_OFFER";
};

export type ProcessPaymentControlMessage = {
  controlMessageType: "PROCESS_PAYMENT";
  paymentMethod: "apple" | "google" | "card";
};

export type UnlockCarControlMessage = {
  controlMessageType: "UNLOCK_CAR";
};

export type ChatMessageMetadata = "hidden" | undefined;
