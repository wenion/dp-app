import { Badge } from "@/components/ui/badge";

import { useSelectedSession } from "./Context";

function formatDuration(
  startedAt: number,
  endedAt: number,
): string {
  const duration = Math.max(
    0,
    endedAt - startedAt,
  );

  const totalSeconds =
    Math.floor(duration / 1000);

  const hours =
    Math.floor(totalSeconds / 3600);

  const minutes =
    Math.floor(
      (totalSeconds % 3600) / 60,
    );

  const seconds =
    totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

export function SessionDetailsCard() {
  const selectedSession =
    useSelectedSession();

  if (!selectedSession) {
    return null;
  }

  const {
    name,
    uploadStatus,
    startedAt,
    endedAt,
    eventCount,
    urls,
  } = selectedSession;

  return (
    <div
      className="
        flex flex-wrap items-baseline justify-between
        gap-x-6 gap-y-1.5
        border-b px-[18px] py-[10px]
      "
    >
      {/* Session */}
      <div className="flex min-w-[200px] flex-1 items-baseline gap-2.5">
        <h1
          className="
            min-w-0 truncate whitespace-nowrap
            text-[19px] font-extrabold
            tracking-[-0.015em]
          "
        >
          {name ?? "Untitled session"}
        </h1>

        <Badge className="shrink-0">
          {uploadStatus}
        </Badge>
      </div>

      {/* Metadata */}
      <div
        className="
          flex min-w-0 flex-[0_1_auto]
          flex-wrap items-baseline
          gap-x-[22px] gap-y-1
          text-[11.5px]
          tabular-nums
        "
      >
        <div className="flex gap-1.5">
          <span className="text-muted-foreground">
            Started
          </span>

          <span>
            {new Date(
              startedAt,
            ).toLocaleString()}
          </span>
        </div>

        <div className="flex gap-1.5">
          <span className="text-muted-foreground">
            Ended
          </span>

          <span>
            {endedAt
              ? new Date(
                  endedAt,
                ).toLocaleString()
              : "—"}
          </span>
        </div>

        <div className="flex gap-1.5">
          <span className="text-muted-foreground">
            Duration
          </span>

          <span>
            {endedAt
              ? formatDuration(
                  startedAt,
                  endedAt,
                )
              : "—"}
          </span>
        </div>

        <div className="flex gap-1.5">
          <span className="text-muted-foreground">
            Events
          </span>

          <span>
            {eventCount.toLocaleString()}
          </span>
        </div>

        <div className="flex min-w-0 max-w-[280px] gap-1.5">
          <span className="shrink-0 text-muted-foreground">
            Sites
          </span>

          <span className="min-w-0 truncate whitespace-nowrap">
            {urls?.join(", ") || "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
