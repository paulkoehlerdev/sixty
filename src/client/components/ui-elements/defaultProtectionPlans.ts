import type { ProtectionPlan } from "./ProtectionPlanCard";

export const defaultProtectionPlans: ProtectionPlan[] = [
  {
    id: "no-protection",
    title: "No extra protection",
    rating: 0,
    deductible: "up to full vehicle value",
    deductibleColor: "red",
    features: [
      {
        id: "loss-damage-waiver",
        name: "Loss damage waiver for collision damages, scratches, bumps and theft",
        included: false,
      },
      {
        id: "tire-windshield",
        name: "Tire and Windshield Protection",
        included: false,
      },
      {
        id: "interior-protection",
        name: "Interior Protection",
        included: false,
      },
      {
        id: "mobility-service",
        name: "Mobility service",
        included: false,
      },
    ],
  },
  {
    id: "basic-protection",
    title: "Basic Protection",
    rating: 1,
    deductible: "up to €1,100.00",
    deductibleColor: "default",
    features: [
      {
        id: "loss-damage-waiver",
        name: "Loss damage waiver for collision damages, scratches, bumps and theft",
        included: true,
      },
      {
        id: "tire-windshield",
        name: "Tire and Windshield Protection",
        included: false,
      },
      {
        id: "interior-protection",
        name: "Interior Protection",
        included: false,
      },
      {
        id: "mobility-service",
        name: "Mobility service",
        included: false,
      },
    ],
  },
  {
    id: "smart-protection",
    title: "Smart Protection",
    rating: 2,
    deductible: "No deductible",
    deductibleColor: "green",
    discount: "- 34% online discount",
    features: [
      {
        id: "loss-damage-waiver",
        name: "Loss damage waiver for collision damages, scratches, bumps and theft",
        included: true,
      },
      {
        id: "tire-windshield",
        name: "Tire and Windshield Protection",
        included: true,
      },
      {
        id: "interior-protection",
        name: "Interior Protection",
        included: false,
      },
      {
        id: "mobility-service",
        name: "Mobility service",
        included: false,
      },
    ],
  },
  {
    id: "all-inclusive-protection",
    title: "All Inclusive Protection",
    rating: 3,
    deductible: "No deductible",
    deductibleColor: "green",
    discount: "- 30% online discount",
    features: [
      {
        id: "loss-damage-waiver",
        name: "Loss damage waiver for collision damages, scratches, bumps and theft",
        included: true,
      },
      {
        id: "tire-windshield",
        name: "Tire and Windshield Protection",
        included: true,
      },
      {
        id: "interior-protection",
        name: "Interior Protection",
        included: true,
      },
      {
        id: "mobility-service",
        name: "Mobility service",
        included: true,
      },
    ],
  },
];
