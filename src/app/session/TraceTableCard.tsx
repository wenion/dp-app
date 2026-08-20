import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ChevronDown,
  ChevronUp,
  Columns3,
  Maximize2,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useSelectedSession } from "./Context";
import { ExportDataButton } from "./ExportDataButton";
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
  const selectedSession =
    useSelectedSession();

  const [traces, setTraces] =
    useState<TraceRow[]>([]);

  const [open, setOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string>();

  const [query, setQuery] =
    useState("");

  const [eventFilter, setEventFilter] =
    useState("all");

  const [sortDirection, setSortDirection] =
    useState<"asc" | "desc">("desc");

  type ColumnKey =
    | "time"
    | "event"
    | "url"
    | "message"
    | "value"
    | "state"
    | "start"
    | "end";

  const [columns, setColumns] = useState<
    Record<ColumnKey, boolean>
  >({
    time: true,
    event: true,
    url: true,
    message: true,
    value: true,
    state: true,
    start: false,
    end: false,
  });

  const toggleColumn = (
    column: ColumnKey,
  ) => {
    setColumns(current => ({
      ...current,
      [column]: !current[column],
    }));
  };

  const visibleColumnCount =
    Object.values(columns).filter(Boolean).length;

  const [expanded, setExpanded] =
    useState<number | null>(null);

  const fetchData = useCallback(async () => {
    if (!selectedSession) {
      setTraces([]);
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      const params = new URLSearchParams({
        sessionId: selectedSession.clientId,
      });

      const response = await fetch(
        `/api/traces?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch traces.",
        );
      }

      const data: TraceListResponse =
        await response.json();

      setTraces(data.items);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unknown error",
      );

      setTraces([]);
    } finally {
      setLoading(false);
    }
  }, [selectedSession]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const eventTypes = useMemo(() => {
    return Array.from(
      new Set(
        traces
          .map(trace => trace.event_type)
          .filter(
            (type): type is string =>
              type !== null,
          ),
      ),
    ).sort();
  }, [traces]);

  const filteredTraces = useMemo(() => {
    const normalizedQuery =
      query.trim().toLowerCase();

    const rows = traces.filter(trace => {
      if (
        eventFilter !== "all" &&
        trace.event_type !== eventFilter
      ) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchable = [
        trace.event_type,
        trace.url,
        trace.message,
        trace.event_value,
        trace.event_state,
      ]
        .map(value => value ?? "")
        .join(" ")
        .toLowerCase();

      return searchable.includes(
        normalizedQuery,
      );
    });

    return rows.sort((a, b) => {
      const left =
        a.event_time ?? "";

      const right =
        b.event_time ?? "";

      return sortDirection === "asc"
        ? left.localeCompare(right)
        : right.localeCompare(left);
    });
  }, [
    traces,
    query,
    eventFilter,
    sortDirection,
  ]);

  const formatTime = (
    eventTime: string | null,
  ) => {
    if (!eventTime) {
      return "-";
    }

    return new Date(
      eventTime,
    ).toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });
  };

  const formatURL = (
    url: string | null,
  ) => {
    if (!url) {
      return "-";
    }

    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return (
    <>
      <div className="flex h-full min-h-0 flex-col overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b px-[18px] py-3">
          
          <h2 className="shrink-0 text-sm font-semibold">
            Session Trace
          </h2>

          <div className="relative ml-auto min-w-[180px] max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={query}
              onChange={event =>
                setQuery(event.target.value)
              }
              className="pl-9"
              placeholder="Search trace..."
            />
          </div>

          <Select
            value={eventFilter}
            onValueChange={setEventFilter}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                All events
              </SelectItem>

              {eventTypes.map(type => (
                <SelectItem
                  key={type}
                  value={type}
                >
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
              >
                <Columns3 className="h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                Toggle columns
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {(
                [
                  ["time", "Time"],
                  ["event", "Event"],
                  ["url", "URL"],
                  ["message", "Message"],
                  ["value", "Value"],
                  ["state", "State"],
                  ["start", "Start"],
                  ["end", "End"],
                ] as const
              ).map(([key, label]) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={columns[key]}
                  onCheckedChange={() =>
                    toggleColumn(key)
                  }
                  onSelect={event =>
                    event.preventDefault()
                  }
                >
                  {label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <ExportDataButton
            traces={filteredTraces}
          />

          <Button
            className="cursor-pointer"
            variant="outline"
            size="icon"
            onClick={() => setOpen(true)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          
        </div>

        {/* Table */}
        <div className="min-h-0 flex-1">
          <ScrollArea className="h-full">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow>
                  {columns.time && (
                    <TableHead
                      className="w-[110px] cursor-pointer"
                      onClick={() =>
                        setSortDirection(current =>
                          current === "asc"
                            ? "desc"
                            : "asc",
                        )
                      }
                    >
                      <div className="flex items-center gap-1">
                        Time

                        {sortDirection === "asc" ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </TableHead>
                  )}

                  {columns.event && (
                    <TableHead className="w-[130px]">
                      Event
                    </TableHead>
                  )}

                  {columns.url && (
                    <TableHead className="w-[150px]">
                      URL
                    </TableHead>
                  )}

                  {columns.message && (
                    <TableHead>
                      Message
                    </TableHead>
                  )}

                  {columns.value && (
                    <TableHead className="w-[200px]">
                      Value
                    </TableHead>
                  )}

                  {columns.state && (
                    <TableHead className="w-[320px]">
                      State
                    </TableHead>
                  )}

                  {columns.start && (
                    <TableHead className="w-20">
                      Start
                    </TableHead>
                  )}

                  {columns.end && (
                    <TableHead className="w-20">
                      End
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell
                      colSpan={visibleColumnCount}
                      className="h-32 text-center text-muted-foreground"
                    >
                      Loading traces...
                    </TableCell>
                  </TableRow>
                )}

                {!loading && error && (
                  <TableRow>
                    <TableCell
                      colSpan={visibleColumnCount}
                      className="h-32 text-center text-destructive"
                    >
                      {error}
                    </TableCell>
                  </TableRow>
                )}

                {!loading &&
                  !error &&
                  filteredTraces.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={visibleColumnCount}
                        className="h-32 text-center text-muted-foreground"
                      >
                        No trace events found.
                      </TableCell>
                    </TableRow>
                  )}

                {!loading &&
                  !error &&
                  filteredTraces.map((trace, index) => {
                    const isExpanded =
                      expanded === index;

                    return (
                      <Fragment key={index}>
                        {/* Main row */}
                        <TableRow
                          className={
                            isExpanded
                              ? "cursor-pointer bg-violet-100 hover:bg-violet-100"
                              : "cursor-pointer"
                          }
                          onClick={() =>
                            setExpanded(
                              isExpanded ? null : index,
                            )
                          }
                        >
                          {columns.time && (
                            <TableCell className="font-mono text-xs">
                              {formatTime(trace.event_time)}
                            </TableCell>
                          )}

                          {columns.event && (
                            <TableCell>
                              <span className="inline-flex rounded bg-muted px-2 py-1 text-xs font-medium">
                                {trace.event_type ?? "-"}
                              </span>
                            </TableCell>
                          )}

                          {columns.url && (
                            <TableCell
                              className="max-w-[150px] truncate"
                              title={trace.url ?? ""}
                            >
                              {formatURL(trace.url)}
                            </TableCell>
                          )}

                          {columns.message && (
                            <TableCell className="max-w-[240px] truncate">
                              {trace.message ?? "-"}
                            </TableCell>
                          )}

                          {columns.value && (
                            <TableCell className="max-w-[200px] truncate font-mono text-xs">
                              {trace.event_value ?? "-"}
                            </TableCell>
                          )}

                          {columns.state && (
                            <TableCell className="max-w-[320px] truncate">
                              {trace.event_state ?? "-"}
                            </TableCell>
                          )}

                          {columns.start && (
                            <TableCell className="font-mono text-xs">
                              {trace.cursor_position ?? "-"}
                            </TableCell>
                          )}

                          {columns.end && (
                            <TableCell className="font-mono text-xs">
                              {trace.end_position ?? "-"}
                            </TableCell>
                          )}
                        </TableRow>

                        {/* Expanded details */}
                        {isExpanded && (
                          <TableRow className="bg-violet-50 hover:bg-violet-50">
                            <TableCell colSpan={visibleColumnCount}>
                              <div className="space-y-5 text-sm">
                                <div>
                                  <div className="mb-1 text-xs font-medium text-foreground/30">
                                    URL
                                  </div>

                                  <div className="break-all font-mono text-xs text-foreground">
                                    {trace.url ?? "-"}
                                  </div>
                                </div>

                                <div>
                                  <div className="mb-1 text-xs font-medium text-foreground/30">
                                    Message
                                  </div>

                                  <div className="whitespace-pre-wrap text-foreground">
                                    {trace.message ?? "-"}
                                  </div>
                                </div>

                                <div>
                                  <div className="mb-1 text-xs font-medium text-foreground/30">
                                    Value
                                  </div>

                                  <div className="whitespace-pre-wrap font-mono text-xs text-foreground">
                                    {trace.event_value ?? "-"}
                                  </div>
                                </div>

                                <div>
                                  <div className="mb-1 text-xs font-medium text-foreground/30">
                                    State
                                  </div>

                                  <div className="whitespace-pre-wrap text-foreground">
                                    {trace.event_state ?? "-"}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </div>

      {/* <TraceViewerModal
        isOpen={open}
        onOpenChange={setOpen}
        traces={traces}
      /> */}
    </>
  );
}
