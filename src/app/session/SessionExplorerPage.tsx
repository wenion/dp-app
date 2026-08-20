import { useState } from "react";

import {
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { SessionProvider } from "./Provider";
import { SessionBrowser } from "./SessionBrowser";
import { SessionContent } from "./SessionContent";
import { SessionResizeHandle } from "./SessionResizeHandle";

export default function SessionExplorerPage() {
  const [collapsed, setCollapsed] =
    useState(false);

  return (
    <SessionProvider>
      <ResizablePanelGroup
        orientation="horizontal"
        className="h-full border"
      >
        {!collapsed && (
          <ResizablePanel
            defaultSize="20%"
            minSize="15%"
            maxSize="40%"
          >
            <SessionBrowser />
          </ResizablePanel>
        )}

        <SessionResizeHandle
          collapsed={collapsed}
          onToggle={() =>
            setCollapsed(
              current => !current,
            )
          }
        />

        <ResizablePanel
          defaultSize="80%"
          minSize="60%"
        >
          <SessionContent />
        </ResizablePanel>
      </ResizablePanelGroup>
    </SessionProvider>
  );
}
