import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useSession } from "./Context";

import type { Session } from "@/types/session";


type SessionResponse = {
  items: Session[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
};

export function SessionBrowser() {
  const {
    selectedSession,
    setSelectedSession
  } = useSession();

  const abortControllerRef = useRef<AbortController | null>(null);

  const [range, setRange] = useState("7d");

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [status, setStatus] = useState<
    "all" | "waiting" | "uploading" | "uploaded" | "failed"
  >("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 100); // 100ms

    return () => clearTimeout(timer);
  }, [keyword]);

  const fetchData = useCallback(async () => {
    // Cancel previous request
    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(undefined);

    try {
      const params = new URLSearchParams();

      // if (keyword.trim()) {
      //   params.set("q", keyword.trim());
      // }
      if (debouncedKeyword.trim()) {
        params.set("q", debouncedKeyword.trim());
      }

      if (range !== "all") {
        params.set("range", range);
      }

      const response = await fetch(
        `/api/v1/sessions?${params.toString()}`, {
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch sessions.");
      }

      const data: SessionResponse = await response.json();

      setSessions(data.items);

    } catch (err) {
      if (
        err instanceof DOMException &&
        err.name === "AbortError"
      ) {
        return;
      }

      console.error(err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }, [debouncedKeyword, range]);

  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword, range, status]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredSessions = useMemo(() => {
    if (status === "all") {
      return sessions;
    }

    return sessions.filter(
      (s) => s.uploadStatus === status
    );
  }, [sessions, status]);

  const pagedSessions = useMemo(() => {
    const start = (page - 1) * pageSize;

    return filteredSessions.slice(
      start,
      start + pageSize
    );
  }, [filteredSessions, page, pageSize]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSessions.length / pageSize)
  );

  const visiblePages = useMemo(() => {
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from(
        { length: totalPages },
        (_, i) => i + 1
      );
    }

    let start = Math.max(
      page - Math.floor(maxVisible / 2),
      1
    );

    let end = start + maxVisible - 1;

    if (end > totalPages) {
      end = totalPages;
      start = end - maxVisible + 1;
    }

    return Array.from(
      { length: end - start + 1 },
      (_, i) => start + i
    );
  }, [page, totalPages]);

  return (
    <div className="flex h-full flex-col">

      <div className="border-b p-4 space-y-4">

        <div>
          <h2 className="font-semibold">Sessions</h2>
          <p className="text-sm text-muted-foreground">
            Browse recorded sessions
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search session..."
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={status}
            onValueChange={(v) =>
              setStatus(v as typeof status)
            }
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="uploading">Uploading</SelectItem>
              <SelectItem value="uploaded">Uploaded</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={range}
            onValueChange={setRange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>

        </div>

      </div>

      <ScrollArea className="flex-1">

        <div className="p-2 space-y-2">

          {pagedSessions.map((session, index) => (
            <Card
              key={session.clientId}
              onClick={() => setSelectedSession(session)}
              className={cn(
                "cursor-pointer transition-colors hover:bg-muted",
                selectedSession?.clientId === session.clientId && "border-primary bg-muted"
              )}
            >
              <CardContent>
                <div className="flex items-start justify-between">
                  <div
                    className={cn(
                      "truncate font-medium",
                      !session.name &&
                        "italic text-muted-foreground"
                    )}
                  >
                    {session.name ?? "Untitled session"}
                  </div>

                  <Badge variant="secondary">
                    {session.uploadStatus}
                  </Badge>
                </div>

                <div className="mt-2 text-sm text-muted-foreground">
                  {new Date(session.startedAt).toLocaleString()}
                </div>

                <div className="mt-1 text-xs text-muted-foreground">
                  {session.eventCount.toLocaleString()} events
                </div>
              </CardContent>
            </Card>
          ))}

        </div>

      </ScrollArea>

      <div className="border-t p-3">
        <Pagination>
          <PaginationContent>

            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) setPage(page - 1);
                }}
              >
                {"<"}
              </PaginationLink>
            </PaginationItem>

            {visiblePages.map((p) => (
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
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page < totalPages) setPage(page + 1);
                }}
              >
                {">"}
              </PaginationLink>
            </PaginationItem>

          </PaginationContent>
        </Pagination>
      </div>

    </div>
  );
}
