export interface MutationConfig {
  selectors: {
    human: readonly string[];
    ai: readonly string[];
    messageId: readonly string[];
    eventId: readonly string[];
  };
}

export type MutationConfigs = Record<string, MutationConfig>;