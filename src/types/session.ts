export type UploadStatus =
  | "waiting"
  | "uploading"
  | "uploaded"
  | "failed";

export interface Session {
  clientId: string;
  ref?: number;
  name?: string;

  startedAt: number;
  endedAt?: number;
  eventCount: number;

  captureState:
    | "recording"
    | "paused";

  uploadStatus: UploadStatus;

  urls?: string[];
};

export type SessionRow = {
  id: number;
  client_id: string;
  user_id: string;

  name: string | null;

  started_at: number;
  ended_at: number | null;

  event_count: number;

  capture_state: Session["captureState"];

  upload_status: Session["uploadStatus"];

  urls: string[] | null;
};
