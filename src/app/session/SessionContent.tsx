import { SessionDetailsCard } from "./SessionDetailsCard";
import { TraceTableCard } from "./TraceTableCard";


export function SessionContent() {
  return (
    <div className="flex h-full flex-col">

      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">

        <div className="flex items-center gap-2">

          <h2 className="text-lg font-semibold">
            Session Explorer
          </h2>

        </div>

      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-4 p-4">

        <SessionDetailsCard />

        <div className="min-h-0 flex-1">
          <TraceTableCard />
        </div>

      </div>

    </div>
  );
}
