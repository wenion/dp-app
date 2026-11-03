export type VersionStatus = "draft" | "published" | "deprecated";
export type MatchType = "domain" | "hostname" | "path_prefix";

export type MutationConfigSnapshot = {
  source_id: number;
  platform: string;
  selectors: Record<string, unknown>;
};
export type BlacklistSnapshot = {
  source_id: number;
  domain: string;
  match_type: MatchType;
  path: string | null;
  reason: string | null;
};

export type ConfigSnapshot = {
  mutation_configs: MutationConfigSnapshot[];
  site_blacklist: BlacklistSnapshot[];
  // Additional configuration categories can be added in later releases.
  [key: string]: unknown;
};

export type VersionRecord = {
  id: number;
  version: string;
  description: string | null;
  status: VersionStatus;
  created_at: string;
  published_at: string | null;
  config_snapshot: ConfigSnapshot;
};
export type MutationOption = { id: number; platform: string; selectors: Record<string, unknown>; created_at: string };
export type BlacklistOption = { id: number; domain: string; match_type: MatchType; path: string | null; reason: string | null };
