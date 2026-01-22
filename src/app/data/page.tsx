"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { type DateRange } from "react-day-picker";
import { startOfDay, endOfDay, format } from "date-fns";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  ArrowDownAZ as ArrowUpIcon,
  ArrowDownZA as ArrowDownIcon,
  Play as NextIcon,
  FastForward as LastIcon,
  Rewind as FirstIcon,
  ListTodo as ListIcon,
  Download as ExportIcon,
} from 'lucide-react';
import { useAppContext } from "@/components/Layouts/context";

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
    { id: "event_time", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});
  const [rowSelection, setRowSelection] = useState({});

  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [eventTypeFilter, setEventTypeFilter] = useState<string | null>(null);

  const [pageIndex, setPageIndex] = useState(0); // 0-based
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { session } = useAppContext();

  const sortedEventTypes = useMemo(() => {
    return [...eventTypes].sort();
  }, [eventTypes]);

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
        header: () => {
          return (
            <div className="flex flex-col gap-1 items-center justify-between">
              <span>Event Type</span>

              <select
                className="text-xs border rounded px-1 py-0.5 cursor-pointer"
                value={eventTypeFilter ?? ""}
                onChange={(e) => {
                  const v = e.target.value || null;
                  setEventTypeFilter(v);
                  setPageIndex(0);
                }}
              >
                <option value="">All</option>
                {sortedEventTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        enableSorting: eventTypeFilter ? false : true,
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
    [searchInput, sortedEventTypes, eventTypeFilter]
  );

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);

    // Determine sorting parameters
    const firstSort = sorting[0];
    // if no sorting, firstSort == null default to created_at desc
    const sortBy = (firstSort && firstSort.id !== "select") ? firstSort.id : "event_time";
    const sortDesc = firstSort ? firstSort.desc : true;

    // Build query parameters
    const params = new URLSearchParams({
      pageIndex: pageIndex.toString(),
      pageSize: pageSize.toString(),
      sortBy,
      sortDesc: sortDesc.toString(),
      globalFilter: globalFilter.trim(),
      eventTypeFilter: eventTypeFilter ?? "",
    });

    await fetch("/api/v1/aggregate",{
      method: "POST",
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
    eventTypeFilter,
    sorting,
  ]);

  const fetchEventTypes = useCallback(async () => {
    try {
      const response = await fetch("/api/traces/columns");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      setEventTypes(result.data ?? []);
    } catch (error) {
      console.error(error instanceof Error ? error.message : "Failed to load event types");
    }
  }, []);

  // ---- Fetch data from Supabase whenever page, size, sorting, or filter changes ----
  useEffect(() => {
    fetchData();
  }, [fetchData, eventTypeFilter]);

  useEffect(() => {
    fetchEventTypes();
  }, [fetchEventTypes]);

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

  /* -------------------- Export CSV -------------------- */
  const downloadCSV = (rows: Trace[], filename: string) => {
    if (!rows.length) return;

    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map(row =>
        headers.map(h =>
          JSON.stringify((row as any)[h] ?? "")
        ).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  };

  const userName = useMemo(() => {
    return session?.user?.identities?.[0]?.identity_data?.name + "_" || "";
  }, [session]);

  const exportCurrentPage = async () => {
    downloadCSV(
      data,
      `${userName}traces_page_${pageIndex + 1}.csv`
    );
  };

  const [showDateExport, setShowDateExport] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  const exportByDate = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      alert("Please select a valid date range.");
      return;
    }
    setShowDateExport(false);

    const exportFrom = startOfDay(dateRange.from);
    const exportTo = endOfDay(dateRange.to);

    const params = new URLSearchParams({
      from: exportFrom.toISOString(),
      to: exportTo.toISOString(),
      sortBy: sorting[0]?.id ?? "event_time",
      sortDesc: String(sorting[0]?.desc ?? true),
      globalFilter,
    });

    let result;
    try {
      const res = await fetch(
        `/api/traces/export?${params.toString()}`,
        {
          headers: {
            "x-timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        }
      );
      result = await res.json();
    } catch (error) {
      console.error(error);
      alert("Failed to export data.");
      return;
    }

    const fromLabel = format(exportFrom, "yyyy-MM-dd");
    const toLabel = format(exportTo, "yyyy-MM-dd");

    const filename = `${userName}traces_${fromLabel}_to_${toLabel}.csv`;
    downloadCSV(result.data, filename);

    // Reset date range
    setDateRange(undefined);
  };

  const exportLast100Pages = async () => {
    const maxRows = pageSize * 100;

    const params = new URLSearchParams({
      limit: maxRows.toString(),
      sortBy: sorting[0]?.id ?? "event_time",
      sortDesc: String(sorting[0]?.desc ?? true),
      globalFilter,
    });

    let result;
    try {
      const res = await fetch(`/api/traces/export?${params.toString()}`);
      result = await res.json();
    } catch (error) {
      console.error(error);
      alert("Failed to export data.");
      return;
    }

    const filename = `${userName}traces_all.csv`;

    downloadCSV(result.data, filename);
  };

  return (
    <div className="bg-white flex flex-col flex-1 w-full space-y-4 p-4">
      {/* Top controls */}
      <div className="flex items-center justify-between">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger className="cursor-pointer">
              <ListIcon className="pr-2" />
              Show Columns
            </MenubarTrigger>
            <MenubarContent>
              {table.getAllLeafColumns().map((column) => {
                if (column.id === "select") return null;
                return (
                  <MenubarItem
                    key={column.id}
                    className="flex w-full items-center whitespace-nowrap px-2 cursor-pointer"
                    onSelect={(e) => {
                      e.preventDefault();
                      column.toggleVisibility();
                    }}
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
          <MenubarMenu>
            <MenubarTrigger className="cursor-pointer">
              <ExportIcon className="pr-2" />
              Export Data
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={exportCurrentPage}>
                Export Current Page
              </MenubarItem>
              <MenubarItem
                onSelect={(e) => {
                  e.preventDefault();
                  setShowDateExport((v) => !v);
                }}
              >
                Export By Date Range
                {showDateExport && (
                  <div className="fixed pt-24 pl-24 inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded shadow space-y-3">
                      <h3 className="font-semibold">Select Date Range</h3>

                      <div className="space-y-1">
                        <Calendar
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                          className="rounded-lg border shadow-sm"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault();
                            setShowDateExport(false);
                          }}
                          className="cursor-pointer"
                        >
                          Cancel
                        </Button>
                        <Button onClick={exportByDate} className="cursor-pointer">
                          Confirm
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </MenubarItem>
              <MenubarItem onClick={exportLast100Pages}>
                Export All (max 100 pages)
              </MenubarItem>
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
      <div className="border rounded-md md:h-[400px] lg:h-[500px] xl:h-[600px] overflow-y-auto">
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
                        <div className="flex items-center gap-1 justify-between">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {canSort && (
                            <Button
                              variant="outline"
                              className="h-8 w-4 border-none cursor-pointer"
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
