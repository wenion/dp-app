import { SessionDetailsCard } from "./SessionDetailsCard";
import { TraceTableCard } from "./TraceTableCard";

import { useSession } from "./Context";

export function SessionContent() {
  const { selectedSession } = useSession();

  return (
    <div className="flex h-full min-h-0 flex-col">

      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">

        <div className="flex items-center gap-2">

          <h2 className="text-lg font-semibold">
            Session Explorer
          </h2>

        </div>

      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
        {!selectedSession ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Select a session
          </div>
        ) : (
          <>
            <SessionDetailsCard />

            <div className="min-h-0 flex-1">
              <TraceTableCard />
            </div>
          </>
        )}
      </div>

    </div>
  );
}
