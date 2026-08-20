import { SessionDetailsCard } from "./SessionDetailsCard";
import { TraceTableCard } from "./TraceTableCard";

import { useSelectedSession } from "./Context";

export function SessionContent() {
  const selectedSession =
    useSelectedSession();

  if (!selectedSession) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Select a session
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <SessionDetailsCard />

      <div className="min-h-0 flex-1">
        <TraceTableCard />
      </div>

    </div>
  );
}
