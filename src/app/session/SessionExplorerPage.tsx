import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ChevronRight , ChevronLeft } from "lucide-react";

import { SessionProvider } from "./Provider";
import { SessionBrowser } from "./SessionBrowser";
import { SessionContent } from "./SessionContent";


export default function SessionExplorerPage() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SessionProvider>
      <div className="flex h-full flex-col p-6">
        <ResizablePanelGroup
          orientation="horizontal"
          className="flex-1 rounded-lg border"
        >
          {!collapsed &&(
            <ResizablePanel
              defaultSize={collapsed ? 0 : 16}
            >
              <SessionBrowser />
            </ResizablePanel>
          )}
          <div className="relative h-full">
            <ResizableHandle withHandle className="h-full"/>

            <Button
              size="icon"
              variant="outline"
              className="absolute left-1/2 top-8 z-20 -translate-x-1/2 cursor-pointer"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <ChevronRight className="h-8 w-8" />
              ) : (
                <ChevronLeft className="h-8 w-8" />
              )}
            </Button>
          </div>

          <ResizablePanel defaultSize={collapsed ? 100 : 72}>
            <SessionContent />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </SessionProvider>
  );
}
