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

import type { TraceRow } from "@/types/trace";


type Pagination = {
  page: number;
  pageSize: number;
  total: number;
};

type TraceListResponse = {
  items: TraceRow[];
  pagination: Pagination;
};

export function TraceTableCard() {
  
  const { selectedSession } = useSession();

  const [traces, setTraces] = useState<TraceRow[]>([]);
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

      const response = await fetch(`/api/traces?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch sessions.");
      }

      const data: TraceListResponse = await response.json();

      setTraces(data.items);

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

  const formatTime = (event_time: string | null) => {
    if (!event_time) return "-";

    return new Date(event_time).toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });
  }

  const formatURL = (url: string | null) => {
    if (!url) return "-";

    try {
      return new URL(url).hostname
    } catch {
      return "_";
    }
  }

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

            <Table className="table-fixed">

              <TableHeader>

                <TableRow>

                  <TableHead className="w-28">Time</TableHead>
                  <TableHead className="w-28">Event</TableHead>
                  <TableHead className="w-36">URL</TableHead>
                  <TableHead className="max-w-[220px]">Message</TableHead>
                  <TableHead className="w-24">Start Pos</TableHead>
                  <TableHead className="w-24">End Pos</TableHead>
                  <TableHead className="w-24">Value</TableHead>
                  <TableHead className="max-w-[220px]">State</TableHead>

                </TableRow>

              </TableHeader>

              <TableBody>

                {traces.map((trace, index) => (
                  <TableRow key={index}>
                    <TableCell className="w-28">
                      {trace.event_time ? formatTime(trace.event_time) : ""}
                    </TableCell>

                    <TableCell className="w-28 truncate">{trace.event_type}</TableCell>

                    <TableCell
                      className="max-w-[220px] truncate"
                      title={trace.url ?? ""}
                    >
                      {formatURL(trace.url)}
                    </TableCell>

                    <TableCell className="max-w-[220px] truncate">
                      {trace.message ?? "-"}
                    </TableCell>

                    <TableCell>
                      {trace.cursor_position}
                    </TableCell>

                    <TableCell>
                      {trace.end_position}
                    </TableCell>

                    <TableCell className="w-24">
                      {trace.event_value}
                    </TableCell>

                    <TableCell className="max-w-[220px] truncate">
                      {trace.event_state}
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
