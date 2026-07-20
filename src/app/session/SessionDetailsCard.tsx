import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useSelectedSession } from "./Context";


function formatDuration(
  startedAt: number,
  endedAt: number
): string {
  const duration = Math.max(0, endedAt - startedAt);

  const totalSeconds = Math.floor(duration / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

export function SessionDetailsCard() {
  const selectedSession = useSelectedSession();

  if (!selectedSession) {
    return null;
  }

  return (
    <Card>

      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{selectedSession.name?? "Untitled session"}</CardTitle>

          <Badge>{selectedSession.uploadStatus}</Badge>
        </div>
      </CardHeader>

      <CardContent>

        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">

          <div>
            <div className="text-muted-foreground">
              Started
            </div>

            <div>{new Date(selectedSession.startedAt).toLocaleString()}</div>
          </div>

          <div>
            <div className="text-muted-foreground">
              Ended
            </div>

            <div>
              {selectedSession.endedAt &&
                new Date(selectedSession.endedAt).toLocaleString()
              }
            </div>
          </div>

          <div>
            <div className="text-muted-foreground">
              Duration
            </div>

            <div>
              {selectedSession.endedAt && formatDuration(selectedSession.startedAt, selectedSession.endedAt)}
            </div>
          </div>

          <div>
            <div className="text-muted-foreground">
              Events
            </div>

            <div>{selectedSession.eventCount.toLocaleString()}</div>
          </div>

          <div className="col-span-2">
            <div className="text-muted-foreground mb-2">
              Sites
            </div>

            <div className="flex gap-2">
              {selectedSession.urls?.map(site => (
                <Badge
                  key={site}
                  variant="secondary"
                >
                  {site}
                </Badge>
              ))}
            </div>
          </div>

        </div>

      </CardContent>

    </Card>
  );
}
