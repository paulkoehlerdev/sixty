export type AgentState = {
  current_stage: UpsellingStage;
};

export type UpsellingStage = "car_type_upselling" | "insurance_upselling" | "addon_upselling";

export const getInitialState = (): AgentState => ({
  current_stage: "car_type_upselling",
});
