import type { Tool } from "ai";
import { z } from "zod";

/**
 * User Profile Scratchpad Model
 * Designed to capture comprehensive user information for personalized upselling
 */
export interface UserProfileScratchpad {
  // Personal Information
  personalInfo: {
    name?: string;
    surname?: string;
    age?: number;
  };

  // Travel Details
  travelDetails: {
    destination?: string;
    travelDates?: {
      departure?: string;
      return?: string;
    };
    duration?: number; // in days
  };

  // Travel Companions
  companions: {
    travelingWith?: "alone" | "partner" | "family" | "friends" | "business" | "other";
    numberOfAdults?: number;
    numberOfChildren?: number;
    childrenAges?: number[];
  };

  // Interests & Preferences (for upselling opportunities)
  preferences: {
    hobbies?: string[];
    interests?: string[];
    travelPurpose?: "leisure" | "business" | "adventure" | "relaxation" | "family" | "other";
  };

  // Circumstances & Context (important for personalization)
  circumstances: {
    occasion?: string; // e.g., "anniversary", "birthday", "honeymoon", "business trip"
    specialNeeds?: string[]; // e.g., "child seats", "accessibility", "pet-friendly"
    budget?: "economy" | "mid-range" | "premium" | "luxury" | "flexible";
  };

  // Flexible notes field - allows LLM to save unstructured insights
  notes: {
    [key: string]: string | number | boolean | null;
  };
}

/**
 * Zod schema for validating scratchpad updates
 */
export const UserProfileUpdateSchema = z.object({
  personalInfo: z
    .object({
      name: z.string().optional(),
      surname: z.string().optional(),
      age: z.number().min(0).max(120).optional(),
    })
    .optional(),

  travelDetails: z
    .object({
      destination: z.string().optional(),
      travelDates: z
        .object({
          departure: z.string().optional(),
          return: z.string().optional(),
        })
        .optional(),
      duration: z.number().min(1).optional(),
    })
    .optional(),

  companions: z
    .object({
      travelingWith: z.enum(["alone", "partner", "family", "friends", "business", "other"]).optional(),
      numberOfAdults: z.number().min(1).optional(),
      numberOfChildren: z.number().min(0).optional(),
      childrenAges: z.array(z.number().min(0).max(18)).optional(),
    })
    .optional(),

  preferences: z
    .object({
      hobbies: z.array(z.string()).optional(),
      interests: z.array(z.string()).optional(),
      travelPurpose: z.enum(["leisure", "business", "adventure", "relaxation", "family", "other"]).optional(),
    })
    .optional(),

  circumstances: z
    .object({
      occasion: z.string().optional(),
      specialNeeds: z.array(z.string()).optional(),
      budget: z.enum(["economy", "mid-range", "premium", "luxury", "flexible"]).optional(),
    })
    .optional(),

  notes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
});

/**
 * Get the initial empty scratchpad
 */
export const getInitialScratchpad = (): UserProfileScratchpad => ({
  personalInfo: {},
  travelDetails: {},
  companions: {},
  preferences: {},
  circumstances: {},
  notes: {},
});

/**
 * Create update scratchpad tool with access to agent state
 * Allows the LLM to incrementally build user profile during conversation
 */
export function createUpdateScratchpadTool(
  getCurrentState: () => UserProfileScratchpad,
  updateState: (scratchpad: UserProfileScratchpad) => void,
) {
  return {
    description: `Update the user profile scratchpad to track information learned during conversation.
  
Use this tool to save any user information that could be valuable for personalization and upselling:
- Personal details (name, age)
- Travel plans (destination, dates, duration)
- Who they're traveling with (companions, family size, children)
- Interests and hobbies (for targeted recommendations)
- Special circumstances (occasions, needs, budget)
- Any other relevant notes in the 'notes' field

IMPORTANT: Only update fields you have learned from the conversation. Leave other fields unchanged.
Always update the scratchpad when you learn new information about the user.`,

    inputSchema: UserProfileUpdateSchema,

    execute: async (updates: z.infer<typeof UserProfileUpdateSchema>) => {
      console.log("Updating scratchpad with updates:", updates);
      // Deep merge the updates into existing scratchpad
      const currentScratchpad = getCurrentState();
      const updatedScratchpad = deepMergeScratchpad(currentScratchpad, updates);

      // Update state
      updateState(updatedScratchpad);

      // Return summary of what was updated
      const updatedFields = getUpdatedFields(updates);
      return `Scratchpad updated successfully. Updated: ${updatedFields.join(", ")}`;
    },
  } satisfies Tool<z.infer<typeof UserProfileUpdateSchema>, string>;
}

/**
 * Helper function to deep merge scratchpad updates
 */
function deepMergeScratchpad(
  current: UserProfileScratchpad,
  updates: z.infer<typeof UserProfileUpdateSchema>,
): UserProfileScratchpad {
  return {
    personalInfo: {
      ...current.personalInfo,
      ...updates.personalInfo,
    },
    travelDetails: {
      ...current.travelDetails,
      ...updates.travelDetails,
      travelDates: {
        ...current.travelDetails.travelDates,
        ...updates.travelDetails?.travelDates,
      },
    },
    companions: {
      ...current.companions,
      ...updates.companions,
    },
    preferences: {
      ...current.preferences,
      ...updates.preferences,
      // Merge arrays instead of replacing
      hobbies: updates.preferences?.hobbies
        ? [...new Set([...(current.preferences.hobbies || []), ...updates.preferences.hobbies])]
        : current.preferences.hobbies,
      interests: updates.preferences?.interests
        ? [...new Set([...(current.preferences.interests || []), ...updates.preferences.interests])]
        : current.preferences.interests,
    },
    circumstances: {
      ...current.circumstances,
      ...updates.circumstances,
      specialNeeds: updates.circumstances?.specialNeeds
        ? [...new Set([...(current.circumstances.specialNeeds || []), ...updates.circumstances.specialNeeds])]
        : current.circumstances.specialNeeds,
    },
    notes: {
      ...current.notes,
      ...updates.notes,
    },
  };
}

/**
 * Helper function to get list of updated fields
 */
function getUpdatedFields(updates: z.infer<typeof UserProfileUpdateSchema>): string[] {
  const fields: string[] = [];

  if (updates.personalInfo && Object.keys(updates.personalInfo).length > 0) {
    fields.push("personal info");
  }
  if (updates.travelDetails && Object.keys(updates.travelDetails).length > 0) {
    fields.push("travel details");
  }
  if (updates.companions && Object.keys(updates.companions).length > 0) {
    fields.push("companions");
  }
  if (updates.preferences && Object.keys(updates.preferences).length > 0) {
    fields.push("preferences");
  }
  if (updates.circumstances && Object.keys(updates.circumstances).length > 0) {
    fields.push("circumstances");
  }
  if (updates.notes && Object.keys(updates.notes).length > 0) {
    fields.push("notes");
  }

  return fields.length > 0 ? fields : ["no fields"];
}

/**
 * Format scratchpad for inclusion in system prompt
 */
export function formatScratchpadForPrompt(scratchpad: UserProfileScratchpad): string {
  const sections: string[] = [];

  // Personal Info
  if (Object.keys(scratchpad.personalInfo).length > 0) {
    sections.push(`Personal: ${JSON.stringify(scratchpad.personalInfo)}`);
  }

  // Travel Details
  if (Object.keys(scratchpad.travelDetails).length > 0) {
    sections.push(`Travel: ${JSON.stringify(scratchpad.travelDetails)}`);
  }

  // Companions
  if (Object.keys(scratchpad.companions).length > 0) {
    sections.push(`Companions: ${JSON.stringify(scratchpad.companions)}`);
  }

  // Preferences
  if (Object.keys(scratchpad.preferences).length > 0) {
    sections.push(`Preferences: ${JSON.stringify(scratchpad.preferences)}`);
  }

  // Circumstances
  if (Object.keys(scratchpad.circumstances).length > 0) {
    sections.push(`Circumstances: ${JSON.stringify(scratchpad.circumstances)}`);
  }

  // Notes
  if (Object.keys(scratchpad.notes).length > 0) {
    sections.push(`Notes: ${JSON.stringify(scratchpad.notes)}`);
  }

  return sections.length > 0 ? sections.join("\n") : "No user information collected yet";
}
