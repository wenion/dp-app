import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
} from "@/components/ui/resizable";

type Props = {
  collapsed: boolean;
  onToggle: () => void;
};

export function SessionResizeHandle({
  collapsed,
  onToggle,
}: Props) {
  return (
    <div className="relative h-full">
      <ResizableHandle
        withHandle
        className="h-full"
      />

      <Button
        size="icon"
        variant="outline"
        className="
          absolute left-1/2 top-8 z-20
          h-7 w-7
          -translate-x-1/2
          cursor-pointer
        "
        onClick={onToggle}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
