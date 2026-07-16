import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { RawTrace as Trace } from "@/types/raw-trace";

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
          <div className="flex w-full items-center justify-between">
            <p className="text-sm text-default-500">
              {traces.length} traces
            </p>

            {/* Search / Filter / Export */}
          </div>
        </DialogHeader>


        <div className="min-h-0 flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
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
                  <TableCell className="whitespace-nowrap">
                    {new Date(trace.timestamp).toLocaleTimeString()}
                  </TableCell>

                  <TableCell>
                    {trace.eventType ?? "-"}
                  </TableCell>

                  <TableCell>
                    {trace.tag ?? "-"}
                  </TableCell>

                  <TableCell>
                    {trace.name ??
                      trace.placeholder ??
                      "-"}
                  </TableCell>

                  <TableCell className="max-w-sm truncate">
                    {trace.eventValue ??
                      trace.textContent ??
                      trace.valueLabel ??
                      trace.originValue ??
                      "-"}
                  </TableCell>

                  <TableCell className="max-w-md truncate">
                    {trace.message ?? "-"}
                  </TableCell>

                  <TableCell>
                    {trace.author ?? "-"}
                  </TableCell>

                  <TableCell className="max-w-md truncate">
                    {trace.url ?? "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
