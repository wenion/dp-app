"use client"

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
  RotateCcw as RefreshIcon,
  ArrowUpDown as SortIcon,
  ArrowUp as ArrowUpIcon,
  ArrowDown as ArrowDownIcon,
  Play as NextIcon,
  FastForward as LastIcon,
  Rewind as FirstIcon,
} from 'lucide-react';

export type Trace = {
  id: number;
  created_at: string; // ISO string
  event_type: string | null;
  url: string | null;
  page_type: string | null;
  author: string | null;
  message: string | null;
  cursor_position: number | null;
  end_position: number | null;
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
  pageSizeOptions?: number[];
  defaultPageSize?: number;
};

export const TraceTableSupabase: React.FC<TraceTableSupabaseProps> = ({
  pageSizeOptions = [10, 20, 50, 100],
  defaultPageSize = 20,
}) => {
  const [data, setData] = useState<Trace[]>([]);
  const [totalRows, setTotalRows] = useState(0);

  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});
  const [rowSelection, setRowSelection] = useState({});

  const [pageIndex, setPageIndex] = useState(0); // 0-based
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const highlightText = (text: string, query: string) => {
    if (typeof text !== "string" || !query) {
      return <span>{String(text ?? "")}</span>;
    }

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "ig");

    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          className="bg-yellow-200 text-black rounded px-0.5"
        >
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  }

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
      {
        accessorKey: "event_type",
        header: "Event Type",
        cell: ({ getValue }) => {
          const v = getValue<string>();
          return v ?
            highlightText(v, searchInput) : <span className="text-gray-300">NULL</span>;
        },
      },
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
              title={v}
            >
              {v.length > 30 ? v.slice(0, 30) + "…" : v}
            </a>
          );
        },
      },
      {
        accessorKey: "page_type",
        header: "Page Type",
        cell: ({ getValue }) => {
          const v = getValue<string>();
          return v ?
            highlightText(v, searchInput) : <span className="text-gray-300">NULL</span>;
        },
      },
      {
        accessorKey: "author",
        header: "Author",
        cell: ({ getValue }) => {
          const v = getValue<string>();
          return v ?
            highlightText(v, searchInput) : <span className="text-gray-300">NULL</span>;
        },
      },
      {
        accessorKey: "message",
        header: "Message",
        cell: ({ getValue }) => {
          const v = getValue<string | null>() || "";

          if (!v) {
            return <span className="text-gray-300">NULL</span>;
          }

          const truncated =
            v.length > 80 ? v.slice(0, 80) + "…" : v;

          return (
            <span title={v}>
              {highlightText(truncated, searchInput)}
            </span>
          );
        },
      },
      {
        accessorKey: "cursor_position",
        header: "Cursor Pos",
        cell: ({ getValue }) => {
          const v = getValue<string>();
          return v ?
            highlightText(v, searchInput) : <span className="text-gray-300">NULL</span>;
        },
      },
      {
        accessorKey: "end_position",
        header: "End Pos",
        cell: ({ getValue }) => {
          const v = getValue<string>();
          return v ?
            highlightText(v, searchInput) : <span className="text-gray-300">NULL</span>;
        },
      },
      {
        accessorKey: "event_value",
        header: "Event Value",
        cell: ({ getValue }) => {
          const v = getValue<string>();
          return v ?
            highlightText(v, searchInput) : <span className="text-gray-300">NULL</span>;
        },
      },
      {
        accessorKey: "tag_name",
        header: "Tag",
        cell: ({ getValue }) => {
          const v = getValue<string>();
          return v ?
            highlightText(v, searchInput) : <span className="text-gray-300">NULL</span>;
        },
      },
      {
        accessorKey: "element_text",
        header: "Element Text",
        cell: ({ getValue }) => {
          const v = getValue<string | null>() || "";

          if (!v) {
            return <span className="text-gray-300">NULL</span>;
          }

          const truncated =
            v.length > 60 ? v.slice(0, 60) + "…" : v;

          return (
            <span title={v}>
              {highlightText(truncated, searchInput)}
            </span>
          );
        },
      },
      {
        accessorKey: "offset_x",
        header: "Offset X",
        enableSorting: false,
        cell: ({ getValue }) => {
          const v = getValue<number>();
          return v ? Math.round(v) : <span className="text-gray-300">NULL</span>;
        },
      },
      {
        accessorKey: "offset_y",
        header: "Offset Y",
        enableSorting: false,
        cell: ({ getValue }) => {
          const v = getValue<number>();
          return v ? Math.round(v) : <span className="text-gray-300">NULL</span>;
        },
      },
      {
        accessorKey: "width",
        header: "Width",
        enableSorting: false,
        cell: ({ getValue }) => {
          const v = getValue<number>();
          return v ? Math.round(v) : <span className="text-gray-300">NULL</span>;
        },
      },
      {
        accessorKey: "height",
        header: "Height",
        enableSorting: false,
        cell: ({ getValue }) => {
          const v = getValue<number>();
          return v ? Math.round(v) : <span className="text-gray-300">NULL</span>;
        },
      },
      {
        accessorKey: "x_path",
        header: "XPath",
        cell: ({ getValue }) => {
          const v = getValue<string | null>() || "";
          if (!v) return <span className="text-gray-300">NULL</span>;
          const truncated = v.length > 80 ? v.slice(0, 80) + "…" : v;
          return <span title={v}>{truncated}</span>;
        },
      },
      {
        accessorKey: "container_id",
        header: "Container ID",
        cell: ({ getValue }) => {
          const v = getValue<string>();
          return v ? highlightText(v, searchInput) : <span className="text-gray-300">NULL</span>;
        },
      },
      {
        accessorKey: "event_state",
        header: "Event State",
        cell: ({ getValue }) => {
          const v = getValue<string>();
          return v ? highlightText(v, searchInput) : <span className="text-gray-300">NULL</span>;
        },
      },
      {
        accessorKey: "event_id",
        header: "Event ID",
        cell: ({ getValue }) => {
          const v = getValue<string>();
          return v ? highlightText(v, searchInput) : <span className="text-gray-300">NULL</span>;
        },
      },
      {
        accessorKey: "event_time",
        header: "Event Time",
        cell: ({ getValue }) => {
          const v = getValue<string | null>();
          return v ? new Date(v).toLocaleString() : <span className="text-gray-300">NULL</span>;
        },
      },
    ],
    [searchInput]
  );

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);

    // Determine sorting parameters
    const firstSort = sorting[0];
    // if no sorting, firstSort == null default to created_at desc
    const sortBy = (firstSort && firstSort.id !== "select") ? firstSort.id : "created_at";
    const sortDesc = firstSort ? firstSort.desc : true;

    // Build query parameters
    const params = new URLSearchParams({
      pageIndex: pageIndex.toString(),
      pageSize: pageSize.toString(),
      sortBy,
      sortDesc: sortDesc.toString(),
      globalFilter: globalFilter.trim(),
    });

    try {
      const response = await fetch(`/api/traces?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      setData(result.data ?? []);
      setTotalRows(result.count ?? 0);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Failed to load traces");
    }

    setIsLoading(false);
  }, [
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
    <div className="bg-white flex flex-col flex-1 w-full space-y-4 p-4">
      {/* Top controls */}
      <div className="flex items-center justify-between">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger className=" cursor-pointer">Columns</MenubarTrigger>
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

        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault(); // prevent page reload
            setGlobalFilter(searchInput);
            fetchData();
          }}
        >
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Search</label>
            <Input
              type="text"
              className="border rounded px-2 py-1 text-sm"
              placeholder="Search event_type, URL, message…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              name="search"
            />
          </div>

          <Button
            type="submit"
            variant="outline"
            size="icon"
            aria-label="Search / Refresh"
            className="cursor-pointer"
          >
            <RefreshIcon />
          </Button>
        </form>

      </div>

      {/* Status / error */}
      {isLoading && (
        <div className="text-sm text-gray-500">Loading traces…</div>
      )}
      {errorMsg && (
        <div className="text-sm text-red-600">Error: {errorMsg}</div>
      )}

      {/* Table */}
      <div className="border rounded-md overflow-auto [height:800px]:max-h-[700px]">
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
                      className="px-2 py-2 min-w-16 max-w-28 border-b border-x text-left font-semibold whitespace-nowrap"
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-1 justify-between">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {canSort && (
                            <Button
                              variant="outline"
                              className="h-4 w-4 border-none cursor-pointer"
                              onClick={
                                canSort
                                  ? header.column.getToggleSortingHandler()
                                  : undefined
                              }
                            >
                              {sortDir === "asc"
                                ? <ArrowUpIcon className="h-1 w-1 text-blue-500" />
                                : sortDir === "desc"
                                ? <ArrowDownIcon className="h-1 w-1 text-blue-500" />
                                : <SortIcon className="h-1 w-1 text-gray-200" />}
                            </Button>
                          )}
                        </div>
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
                    { flexRender(cell.column.columnDef.cell, cell.getContext()) }
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
            className="border rounded px-1 py-0.5 cursor-pointer"
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
            className="flex border rounded gap-2 px-2 py-1 disabled:opacity-50 cursor-pointer items-center"
            onClick={() => setPageIndex(0)}
            disabled={pageIndex === 0}
          >
            First <FirstIcon className="w-4 h-4" />
          </button>
          <button
            className="flex border rounded gap-2 px-2 py-1 disabled:opacity-50 cursor-pointer items-center"
            onClick={() => setPageIndex((p) => Math.max(p - 1, 0))}
            disabled={pageIndex === 0}
          >
            Prev <NextIcon className="rotate-180 w-4 h-4" />
          </button>
          <span>
            Page{" "}
            <strong>
              {pageIndex + 1} of {pageCount || 1}
            </strong>
          </span>
          <button
            className="flex border rounded gap-2 px-2 py-1 disabled:opacity-50 cursor-pointer items-center"
            onClick={() =>
              setPageIndex((p) => (pageCount ? Math.min(p + 1, pageCount - 1) : p + 1))
            }
            disabled={pageCount > 0 && pageIndex >= pageCount - 1}
          >
            Next <NextIcon className="w-4 h-4" />
          </button>
          <button
            className="flex border rounded gap-2 px-2 py-1 disabled:opacity-50 cursor-pointer items-center"
            onClick={() => pageCount && setPageIndex(pageCount - 1)}
            disabled={pageCount === 0 || pageIndex >= pageCount - 1}
          >
            Last <LastIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function TracePage() {
  return (
    <div className="mt-auto mb-auto">
      <TraceTableSupabase />
    </div>
  );
}
