import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import type { TraceRow as Trace } from "@/types/trace";


const PAGE_SIZE = 100;

type TraceViewerModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  traces: readonly Trace[];
};

export function TraceViewerModal({
  isOpen,
  onOpenChange,
  traces,
}: TraceViewerModalProps) {

  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(traces.length / PAGE_SIZE);

  const pageTraces = traces.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const TooltipCell = ({
    value,
    width = "max-w-[220px]",
  }: {
    value?: string | null;
    width?: string;
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <TableCell className={`${width} truncate`}>
          {value ?? "-"}
        </TableCell>
      </TooltipTrigger>

      <TooltipContent className="max-w-md break-all text-xl bg-muted text-foreground border">
        {value ?? "-"}
      </TooltipContent>
    </Tooltip>
  );

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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          !left-0
          !top-0
          !translate-x-0
          !translate-y-0
          !h-screen
          !w-screen
          !max-w-none
          rounded-none
          border-0
          p-0
          flex
          flex-col
        "
      >
        <DialogHeader className="border-b p-6">
          <DialogTitle>Trace Viewer</DialogTitle>
          <p className="text-sm text-default-500">
            {traces.length} traces
          </p>

          {/* Search / Filter / Export */}
        </DialogHeader>


        <div className="min-h-0 flex-1 mx-8 overflow-auto">
          <div className="overflow-x-auto">
            <Table className="table-fixed min-w-max">
              <TableHeader className="sticky border-b top-0 z-10 bg-background">
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Page</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Tag</TableHead>
                  <TableHead>Element</TableHead>
                  <TableHead>Offset X</TableHead>
                  <TableHead>Offset Y</TableHead>
                  <TableHead>Width</TableHead>
                  <TableHead>Height</TableHead>
                  <TableHead>XPath</TableHead>
                  <TableHead>Container</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Event ID</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Sequence</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {traces.map((trace) => (
                  <TableRow key={trace.id}>
                    <TableCell>{trace.id}</TableCell>

                    <TableCell>
                      {trace.event_time ? formatTime(trace.event_time) : "-"}
                    </TableCell>

                    <TableCell>{trace.event_type ?? "-"}</TableCell>

                    <TableCell
                      className="max-w-[220px] truncate"
                      title={trace.url ?? ""}
                    >
                      {trace.url ?? "-"}
                    </TableCell>

                    <TableCell>{trace.page_type ?? "-"}</TableCell>

                    <TableCell>{trace.author ?? "-"}</TableCell>

                    {/* <TableCell
                      className="max-w-[300px] truncate"
                      title={trace.message ?? ""}
                    >
                      {trace.message ?? "-"}
                    </TableCell> */}
                    <TooltipCell value={trace.message} width="max-w-[300px]" />

                    <TableCell>{trace.cursor_position ?? "-"}</TableCell>

                    <TableCell>{trace.end_position ?? "-"}</TableCell>

                    <TableCell
                      className="max-w-[180px] truncate"
                      title={trace.event_value ?? ""}
                    >
                      {trace.event_value ?? "-"}
                    </TableCell>

                    <TableCell>{trace.tag_name ?? "-"}</TableCell>

                    <TableCell
                      className="max-w-[220px] truncate"
                      title={trace.element_text ?? ""}
                    >
                      {trace.element_text ?? "-"}
                    </TableCell>

                    <TableCell className="text-right">{trace.offset_x?.toFixed(1) ?? "-"}</TableCell>

                    <TableCell className="text-right">{trace.offset_y?.toFixed(1) ?? "-"}</TableCell>

                    <TableCell className="text-right">{trace.width ?? "-"}</TableCell>

                    <TableCell className="text-right">{trace.height ?? "-"}</TableCell>

                    <TooltipCell value={trace.x_path} width="max-w-[100px]" />

                    <TooltipCell value={trace.container_id ?? "-"} width="max-w-[100px]" />

                    <TooltipCell value={trace.event_state ?? ""} width="max-w-[100px]" />

                    <TooltipCell value={trace.event_id ?? "-"} width="max-w-[100px]" />

                    <TableCell>{trace.version ?? "-"}</TableCell>

                    <TableCell>{trace.sequence ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="border-t p-3">
        <Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious
        href="#"
        onClick={(e) => {
          e.preventDefault();
          if (page > 1) setPage(page - 1);
        }}
      />
    </PaginationItem>

    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
      <PaginationItem key={p}>
        <PaginationLink
          href="#"
          isActive={p === page}
          onClick={(e) => {
            e.preventDefault();
            setPage(p);
          }}
        >
          {p}
        </PaginationLink>
      </PaginationItem>
    ))}

    <PaginationItem>
      <PaginationNext
        href="#"
        onClick={(e) => {
          e.preventDefault();
          if (page < totalPages) setPage(page + 1);
        }}
      />
    </PaginationItem>
  </PaginationContent>
</Pagination>
      </div>

      </DialogContent>
    </Dialog>
  );
}
