import { useCallback, useEffect, useState } from "react";

import { Maximize2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useSession } from "./Context";
import { TraceViewerModal } from "./TraceViewerModal";

import type { RawTrace } from "@/types/raw-trace";


export function TraceTableCard() {
  
  const { selectedSession } = useSession();

  const [traces, setTraces] = useState<RawTrace[]>([]);
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  
  const fetchData = useCallback(async () => {
    if (!selectedSession) {
      setTraces([]);
      return;
    }

    setLoading(true);
    setError(undefined);

    selectedSession

    try {
      const params = new URLSearchParams({
        sessionId: selectedSession.clientId,
      });

      const response = await fetch(`/api/v1/traces?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch sessions.");
      }

      const data: RawTrace[] = await response.json();

      setTraces(data);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setTraces([]);
    } finally {
        setLoading(false);
    }
  }, [selectedSession]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <Card className="flex h-full flex-col">

        <CardHeader>

          <div className="flex items-center justify-between">

            <CardTitle>
              Session Trace
            </CardTitle>

            <div className="relative w-64">

              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

              <Input
                className="pl-9"
                placeholder="Search trace..."
              />

            </div>

            <Button
              className="cursor-pointer"
              variant="outline"
              size="sm"
              onClick={() => setOpen(true)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>

          </div>

        </CardHeader>

        <CardContent className="min-h-0 flex-1">

          <ScrollArea className="h-full">

            <Table>

              <TableHeader>

                <TableRow>

                  <TableHead>Time</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Tag</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>URL</TableHead>

                </TableRow>

              </TableHeader>

              <TableBody>

                {traces.map((trace, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {new Date(trace.timestamp).toLocaleTimeString()}
                    </TableCell>

                    <TableCell>{trace.eventType}</TableCell>

                    <TableCell>{trace.tag}</TableCell>

                    <TableCell>
                      {trace.name || trace.placeholder || "-"}
                    </TableCell>

                    <TableCell>
                      {trace.eventValue ??
                        trace.textContent ??
                        trace.valueLabel ??
                        trace.originValue ??
                        "-"}
                    </TableCell>

                    <TableCell className="max-w-sm truncate">
                      {trace.message ?? "-"}
                    </TableCell>

                    <TableCell>{trace.author ?? "-"}</TableCell>

                    <TableCell className="max-w-xs truncate">
                      {trace.url}
                    </TableCell>
                  </TableRow>
                ))}

              </TableBody>

            </Table>

          </ScrollArea>

        </CardContent>

      </Card>

      <TraceViewerModal
        isOpen={open}
        onOpenChange={setOpen}
        traces={traces}
      />
    </>
  );
}
