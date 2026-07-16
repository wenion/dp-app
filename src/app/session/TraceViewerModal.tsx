import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "@heroui/modal";

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
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="full"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="border-b">
          <div className="flex w-full items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Trace Viewer
              </h2>
              <p className="text-sm text-default-500">
                {traces.length} traces
              </p>
            </div>

            {/* Search / Filter / Export */}
          </div>
        </ModalHeader>

        <ModalBody className="p-0">
          <div className="h-full overflow-auto">
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
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}