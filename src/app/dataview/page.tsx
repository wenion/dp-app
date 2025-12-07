"use client"

// TraceTableSupabase.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  RotateCcw as RefreshIcon,
} from 'lucide-react';

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

export type Trace = {
  id: number;
  created_at: string; // ISO string
  event_type: string | null;
  user_id: string | null;
  url: string | null;
  page_type: string | null;
  author: string | null;
  message: string | null;
  cursor_position: number | null;
  event_value: string | null;
  tag_name: string | null;
  element_text: string | null;
  offset_x: number | null;
  offset_y: number | null;
  width: number | null;
  height: number | null;
  x_path: string | null;
  container_id: string | null;
  event_state: string | null;
  event_id: string | null;
  event_time: string | null;
};

type TraceTableSupabaseProps = {
  supabase: SupabaseClient;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
};


export const TraceTableSupabase: React.FC<TraceTableSupabaseProps> = ({
  supabase,
  pageSizeOptions = [10, 20, 50, 100],
  defaultPageSize = 20,
}) => {
  const [data, setData] = useState<Trace[]>([]);
  const [totalRows, setTotalRows] = useState(0);

  const defaultLenght = 10;

  const [sorting, setSorting] = useState<SortingState>([
    { id: "id", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});
  const [rowSelection, setRowSelection] = useState({});

  const [pageIndex, setPageIndex] = useState(0); // 0-based
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Define columns (same as before, but without client-side pagination)
  const columns = useMemo<ColumnDef<Trace>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      { accessorKey: "id", header: "ID" },
      {
        accessorKey: "created_at",
        header: "Created At",
        cell: ({ getValue }) => {
          const v = getValue<string>();
          return v ? new Date(v).toLocaleString() : "";
        },
      },
      { accessorKey: "event_type", header: "Event Type" },
      { accessorKey: "user_id", header: "User ID" },
      {
        accessorKey: "url",
        header: "URL",
        cell: ({ getValue }) => {
          const v = getValue<string | null>();
          if (!v) return "";
          return (
            <a
              href={v}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline"
            >
              {v}
            </a>
          );
        },
      },
      { accessorKey: "page_type", header: "Page Type" },
      { accessorKey: "author", header: "Author" },
      {
        accessorKey: "message",
        header: "Message",
        cell: ({ getValue }) => {
          const v = getValue<string | null>() || "";
          const truncated = v.length > 80 ? v.slice(0, 80) + "…" : v;
          return <span title={v}>{truncated}</span>;
        },
      },
      { accessorKey: "cursor_position", header: "Cursor Pos" },
      { accessorKey: "event_value", header: "Event Value" },
      { accessorKey: "tag_name", header: "Tag" },
      {
        accessorKey: "element_text",
        header: "Element Text",
        cell: ({ getValue }) => {
          const v = getValue<string | null>() || "";
          const truncated = v.length > 60 ? v.slice(0, 60) + "…" : v;
          return <span title={v}>{truncated}</span>;
        },
      },
      { accessorKey: "offset_x", header: "Offset X" },
      { accessorKey: "offset_y", header: "Offset Y" },
      { accessorKey: "width", header: "Width" },
      { accessorKey: "height", header: "Height" },
      {
        accessorKey: "x_path",
        header: "XPath",
        cell: ({ getValue }) => {
          const v = getValue<string | null>() || "";
          const truncated = v.length > 80 ? v.slice(0, 80) + "…" : v;
          return <span title={v}>{truncated}</span>;
        },
      },
      { accessorKey: "container_id", header: "Container ID" },
      { accessorKey: "event_state", header: "Event State" },
      { accessorKey: "event_id", header: "Event ID" },
      {
        accessorKey: "event_time",
        header: "Event Time",
        cell: ({ getValue }) => {
          const v = getValue<string | null>();
          return v ? new Date(v).toLocaleString() : "";
        },
      },
    ],
    []
  );

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);

    // calculate range from page & size (this is your "request with page")
    const from = pageIndex * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("Trace")
      .select("*", { count: "exact" }) // count: exact -> returns total
      .range(from, to);

    // Apply sorting (only the first sort rule, others ignored for simplicity)
    const firstSort = sorting[0];
    if (firstSort && firstSort.id && firstSort.id !== "select") {
      const column = firstSort.id as keyof Trace;
      query = query.order(column as string, {
        ascending: !firstSort.desc,
      });
    } else {
      // default ordering if no sorting set
      query = query.order("created_at", { ascending: false });
    }

    // Apply global search via OR across a few useful text columns
    if (globalFilter.trim() !== "") {
      const search = globalFilter.trim();
      query = query.or(
        [
          `event_type.ilike.%${search}%`,
          `url.ilike.%${search}%`,
          `page_type.ilike.%${search}%`,
          `author.ilike.%${search}%`,
          `message.ilike.%${search}%`,
          `tag_name.ilike.%${search}%`,
          `element_text.ilike.%${search}%`,
          `x_path.ilike.%${search}%`,
          `container_id.ilike.%${search}%`,
          `event_state.ilike.%${search}%`,
          `event_id.ilike.%${search}%`,
        ].join(",")
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error loading traces:", error);
      setErrorMsg(error.message);
    } else {
      setData((data as Trace[]) ?? []);
      setTotalRows(count ?? 0);
    }

    setIsLoading(false);
  }, [
    supabase,
    pageIndex,
    pageSize,
    globalFilter,
    sorting,
  ]);

  // ---- Fetch data from Supabase whenever page, size, sorting, or filter changes ----
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pageCount =
    pageSize > 0 ? Math.ceil((totalRows || 0) / pageSize) : 0;

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      columnVisibility,
      rowSelection,
      pagination: { pageIndex, pageSize },
    },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      setSorting(next);
      setPageIndex(0); // reset to first page on sort change
    },
    onGlobalFilterChange: (value) => {
      setGlobalFilter(String(value ?? ""));
      setPageIndex(0); // reset to first page on search change
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    // we manage pagination manually by calling Supabase
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), // only for client-side row order within current page
  });

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="space-y-4">
      {/* Top controls */}
      <div className="flex items-center justify-between">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Columns</MenubarTrigger>
            <MenubarContent>
              {table.getAllLeafColumns().map((column) => {
                if (column.id === "select") return null;
                return (
                  <MenubarItem
                    key={column.id}
                    className="flex w-full items-center whitespace-nowrap px-2"
                  >
                    <Input
                      type="checkbox"
                      checked={column.getIsVisible()}
                      onChange={column.getToggleVisibilityHandler()}
                      className="h-fit w-fit cursor-pointer"
                    />
                    <span>{column.columnDef.header as string}</span>
                  </MenubarItem>
                );
              })}
            </MenubarContent>
          </MenubarMenu>
        </Menubar>

        <div className="flex items-center gap-2" >
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Search</label>
            <input
              className="border rounded px-2 py-1 text-sm"
              placeholder="Search event_type, URL, message…"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            aria-label="Refresh"
            className="cursor-pointer"
            onClick={fetchData}
          >
            <RefreshIcon />
          </Button>
        </div>

      </div>

      {/* Status / error */}
      {isLoading && (
        <div className="text-sm text-gray-500">Loading traces…</div>
      )}
      {errorMsg && (
        <div className="text-sm text-red-600">Error: {errorMsg}</div>
      )}

      {/* Table */}
      <div className="border rounded-md overflow-auto max-h-[600px]">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className="px-2 py-2 border-b border-x text-left font-semibold whitespace-nowrap"
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          className={`flex items-center gap-1 ${
                            canSort ? "cursor-pointer select-none" : ""
                          }`}
                          onClick={
                            canSort
                              ? header.column.getToggleSortingHandler()
                              : undefined
                          }
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {canSort && (
                            <span className="text-xs">
                              {sortDir === "asc"
                                ? "▲"
                                : sortDir === "desc"
                                ? "▼"
                                : ""}
                            </span>
                          )}
                        </button>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {!isLoading && table.getRowModel().rows.length === 0 && (
              <tr>
                <td
                  colSpan={table.getAllLeafColumns().length}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No data.
                </td>
              </tr>
            )}
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={row.getIsSelected() ? "bg-blue-50" : ""}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-2 py-1 border-b border-x align-top truncate">
                    {(() => {
                      const colId = cell.column.id;
                      const raw = cell.getValue();

                      // Only apply for these long-text columns
                      if (["user_id", "x_path", "url"].includes(colId)) {
                        const text = raw ? String(raw) : "";
                        // const truncated = text.length > defaultLenght ? text.slice(0, defaultLenght) + "…" : text;
                        if (text.length > defaultLenght) {
                          return (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>{text.slice(0, defaultLenght) + "…"}</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{text}</p>
                              </TooltipContent>
                            </Tooltip>
                          )
                        }
                      }

                      // Fallback to default cell rendering
                      return flexRender(cell.column.columnDef.cell, cell.getContext());
                    })()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span>
            Total rows: <strong>{totalRows}</strong>
          </span>
          <span>
            Selected on this page:{" "}
            <strong>
              {selectedCount} / {table.getRowModel().rows.length}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            className="border rounded px-1 py-0.5"
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              setPageSize(newSize);
              setPageIndex(0);
            }}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="border rounded px-2 py-1 disabled:opacity-50"
            onClick={() => setPageIndex(0)}
            disabled={pageIndex === 0}
          >
            ⏮ First
          </button>
          <button
            className="border rounded px-2 py-1 disabled:opacity-50"
            onClick={() => setPageIndex((p) => Math.max(p - 1, 0))}
            disabled={pageIndex === 0}
          >
            ◀ Prev
          </button>
          <span>
            Page{" "}
            <strong>
              {pageIndex + 1} of {pageCount || 1}
            </strong>
          </span>
          <button
            className="border rounded px-2 py-1 disabled:opacity-50"
            onClick={() =>
              setPageIndex((p) => (pageCount ? Math.min(p + 1, pageCount - 1) : p + 1))
            }
            disabled={pageCount > 0 && pageIndex >= pageCount - 1}
          >
            Next ▶
          </button>
          <button
            className="border rounded px-2 py-1 disabled:opacity-50"
            onClick={() => pageCount && setPageIndex(pageCount - 1)}
            disabled={pageCount === 0 || pageIndex >= pageCount - 1}
          >
            Last ⏭
          </button>
        </div>
      </div>
    </div>
  );
};

export default function TracePage() {
  const supabase = createClient();
  return (
    <div className="p-4">
      <TraceTableSupabase supabase={supabase} />
    </div>
  );
}
