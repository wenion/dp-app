import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useSearchParams,
  useRouter,
  usePathname,
} from "next/navigation";

import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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

import { useSession, useSelectedSession } from "./Context";

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const clientId = searchParams.get("clientId");

  const { sessions, setSessions } = useSession();
  const selectedSession = useSelectedSession();

  const abortControllerRef = useRef<AbortController | null>(null);

  const [range, setRange] = useState("7d");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 11;
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

  useEffect(() => {
    if (!sessions.length || !clientId) {
      return;
    }

    const index = filteredSessions.findIndex(
      (s) => s.clientId === clientId
    );

    if (index === -1) {
      return;
    }

    setPage(Math.floor(index / pageSize) + 1);
  }, [
    filteredSessions,
    clientId,
    pageSize,
  ]);

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
    <div className="flex h-full min-h-0 flex-col">

      {/* Header */}
      <div className="space-y-3 border-b px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">
            Sessions
          </h2>

          <p className="text-xs text-muted-foreground">
            Browse recorded sessions
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={keyword}
            onChange={event =>
              setKeyword(event.target.value)
            }
            placeholder="Search sessions..."
            className="pl-9"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Select
            value={status}
            onValueChange={value =>
              setStatus(value as typeof status)
            }
          >
            <SelectTrigger className="min-w-0 flex-1">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                All Status
              </SelectItem>

              <SelectItem value="waiting">
                Waiting
              </SelectItem>

              <SelectItem value="uploading">
                Uploading
              </SelectItem>

              <SelectItem value="uploaded">
                Uploaded
              </SelectItem>

              <SelectItem value="failed">
                Failed
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={range}
            onValueChange={setRange}
          >
            <SelectTrigger className="min-w-0 flex-1">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="today">
                Today
              </SelectItem>

              <SelectItem value="7d">
                Last 7 days
              </SelectItem>

              <SelectItem value="30d">
                Last 30 days
              </SelectItem>

              <SelectItem value="all">
                All
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sessions */}
      <ScrollArea className="min-h-0 flex-1">
        <div>
          {loading && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Loading sessions...
            </div>
          )}

          {!loading && error && (
            <div className="px-4 py-8 text-center text-sm text-destructive">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            pagedSessions.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No sessions found.
              </div>
            )}

          {!loading &&
            !error &&
            pagedSessions.map(session => {
              const isSelected =
                selectedSession?.clientId ===
                session.clientId;

              return (
                <button
                  key={session.clientId}
                  type="button"
                  onClick={() => {
                    router.replace(
                      `${pathname}?clientId=${session.clientId}`,
                      {
                        scroll: false,
                      },
                    );
                  }}
                  className={cn(
                    `
                      relative block w-full
                      border-b px-4 py-3
                      text-left
                      transition-colors
                      hover:bg-muted/50
                    `,
                    isSelected &&
                      "bg-violet-50 hover:bg-violet-50",
                  )}
                >
                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="absolute inset-y-0 left-0 w-0.5 bg-violet-600" />
                  )}

                  {/* Name + status */}
                  <div className="flex min-w-0 items-center justify-between gap-3">
                    <div
                      className={cn(
                        "min-w-0 truncate text-sm font-medium",
                        !session.name &&
                          "italic text-muted-foreground",
                      )}
                    >
                      {session.name ??
                        "Untitled session"}
                    </div>

                    <Badge
                      variant="secondary"
                      className="shrink-0"
                    >
                      {session.uploadStatus}
                    </Badge>
                  </div>

                  {/* Metadata */}
                  <div className="mt-1.5 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span className="truncate">
                      {new Date(
                        session.startedAt,
                      ).toLocaleString()}
                    </span>

                    <span className="shrink-0 tabular-nums">
                      {session.eventCount.toLocaleString()}{" "}
                      events
                    </span>
                  </div>
                </button>
              );
            })}
        </div>
      </ScrollArea>

      {/* Pagination */}
      <div className="shrink-0 border-t px-3 py-2">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={event => {
                  event.preventDefault();

                  if (page > 1) {
                    setPage(page - 1);
                  }
                }}
              >
                {"<"}
              </PaginationLink>
            </PaginationItem>

            {visiblePages.map(currentPage => (
              <PaginationItem
                key={currentPage}
              >
                <PaginationLink
                  href="#"
                  isActive={
                    currentPage === page
                  }
                  onClick={event => {
                    event.preventDefault();
                    setPage(currentPage);
                  }}
                >
                  {currentPage}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={event => {
                  event.preventDefault();

                  if (page < totalPages) {
                    setPage(page + 1);
                  }
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
