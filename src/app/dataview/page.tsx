"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Filter, Info, Search } from "lucide-react";
import Image from "next/image";

import { useMemo, useState } from "react";

const EVENT_TYPES = ["insert", "delete", "select (text)", "copy", "paste", "cursor-forward", "cursor-backward", "click(element)", "scroll", "mouseenter", "mouseleave", "blur"];
const PAGE_TYPES = ["AI", "editor", "other"];
const AUTHOR_TYPES = ["human", "AI", "other"];
const REGIONS_TYPES = ["human", "AI", "other"];

function randomChoice<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeMockRow(i: number): DataRow {
  const ts = new Date(Date.now() - randomInt(0, 1000 * 60 * 60 * 24 * 7)).toISOString();
  const ts2 = new Date(Date.now() - randomInt(0, 1000 * 60 * 60 * 24 * 7)).toISOString();
  const url = `https://example.com/page/${randomInt(1, 8)}`;
  const title = `Example Page ${randomInt(1, 8)}`;
  const pt = randomChoice(PAGE_TYPES);
  const at = randomChoice(AUTHOR_TYPES);
  const et = randomChoice(EVENT_TYPES);
  return {
    id: `${i}`,
    pk: `${i}`,
    user_id: `user_${randomInt(1, 6)}`,
    session_id: `sess_${randomInt(100, 999)}`,
    session_start: new Date(ts).toLocaleString(),
    session_end: new Date(ts2).toLocaleString(),
    url: url,
    page_type: pt,
    author: at,
    container_id: randomInt(1, 6),
    event_type: et,
    message: "Full text content of prompt sent to AI; full text content of AI response",
    cursor_position: randomInt(0, 1200),
    event_time: ts,
    event_value: "Most recently typed content in text field",
    event_id: "Identifier for the event",
    event_state: "Accumulated typed content",
    tag_name: randomChoice(["DIV", "A", "INPUT", "BUTTON", "SPAN"]),
    element_text: randomChoice(["header", "main", "sidebar", "footer"]),
    offset_x: randomInt(0, 1200),
    offset_y: randomInt(0, 2000),
    x_path: `/HTML/BODY/DIV[${randomInt(1, 5)}]/DIV[${randomInt(1, 5)}]`,
    width: randomInt(320, 1920),
    height: randomInt(480, 2160),
  };
}

const MOCK_DATA: DataRow[] = Array.from({ length: 120 }, (_, i) => makeMockRow(i + 1));

export default function Page() {
  const [data, setData] = useState({
    name: "Danish Heilium",
    profilePhoto: "/images/user/user-03.png",
    coverPhoto: "/images/cover/cover-01.png",
  });

  const [q, setQ] = useState("");
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [actionTypes, setActionTypes] = useState<string[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<keyof DataRow | "">("timestamp");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const filtered = useMemo(() => {
    let rows = [...MOCK_DATA];
    if (q.trim()) {
      const needle = q.toLowerCase();
      rows = rows.filter((r) =>
        [
          r.id,
          r.userid,
          r.event_type,
          r.base_url,
          r.ip_address,
          r.session_id,
          r.action_type,
          r.title,
          r.text_content,
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(needle))
      );
    }
    if (eventTypes.length) rows = rows.filter((r) => eventTypes.includes(r.event_type));
    if (regions.length) rows = rows.filter((r) => r.region && regions.includes(r.region));
    if (actionTypes.length) rows = rows.filter((r) => r.action_type && actionTypes.includes(r.action_type));

    if (from) {
      const f = new Date(from).getTime();
      rows = rows.filter((r) => new Date(r.timestamp).getTime() >= f);
    }
    if (to) {
      const t = new Date(to).getTime();
      rows = rows.filter((r) => new Date(r.timestamp).getTime() <= t);
    }

    if (sortBy) {
      rows.sort((a: any, b: any) => {
        const A = a[sortBy];
        const B = b[sortBy];
        if (A == null && B == null) return 0;
        if (A == null) return sortDir === "asc" ? -1 : 1;
        if (B == null) return sortDir === "asc" ? 1 : -1;
        if (sortBy === "timestamp") {
          const da = new Date(A).getTime();
          const db = new Date(B).getTime();
          return sortDir === "asc" ? da - db : db - da;
        }
        if (typeof A === "number" && typeof B === "number") {
          return sortDir === "asc" ? A - B : B - A;
        }
        const sA = String(A).toLowerCase();
        const sB = String(B).toLowerCase();
        if (sA < sB) return sortDir === "asc" ? -1 : 1;
        if (sA > sB) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }

    return rows;
  }, [q, eventTypes, regions, actionTypes, from, to, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const selectedRows = useMemo(() => Object.keys(selected).filter((id) => selected[id]), [selected]);

  const handleChange = (e: any) => {
    if (e.target.name === "profilePhoto" ) {
      const file = e.target?.files[0];

      setData({
        ...data,
        profilePhoto: file && URL.createObjectURL(file),
      });
    } else if (e.target.name === "coverPhoto") {
      const file = e.target?.files[0];

      setData({
        ...data,
        coverPhoto: file && URL.createObjectURL(file),
      });
    } else {
      setData({
        ...data,
        [e.target.name]: e.target.value,
      });
    }
  };

  function toggleSort(col: keyof DataRow) {
    if (sortBy !== col) {
      setSortBy(col);
      setSortDir("asc");
    } else {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    }
  }


  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-slate-50 p-6">
      <div className="mx-auto max-w-[1400px] space-y-6">
        {/* Header */}
        <div className="flex gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dataview</h1>
            <p className="text-sm text-muted-foreground">Explore and analyze interaction events</p>
          </div>
          <div className="flex flex-col gap-2 md:w-auto md:flex-row">
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-72">
                <Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search event, session, url, text…" className="pl-8" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2"><Filter className="h-4 w-4"/>Order</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>Event types</DropdownMenuLabel>
                  {EVENT_TYPES.map((et) => (
                    <DropdownMenuCheckboxItem
                      key={et}
                      checked={eventTypes.includes(et)}
                      onCheckedChange={(c) => setEventTypes((prev) => c ? [...prev, et] : prev.filter((x) => x !== et))}
                    >{et}</DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Page Type</DropdownMenuLabel>
                  {PAGE_TYPES.map((r) => (
                    <DropdownMenuCheckboxItem
                      key={r}
                      checked={regions.includes(r)}
                      onCheckedChange={(c) => setRegions((prev) => c ? [...prev, r] : prev.filter((x) => x !== r))}
                    >{r}</DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Author</DropdownMenuLabel>
                  {AUTHOR_TYPES.map((a) => (
                    <DropdownMenuCheckboxItem
                      key={a}
                      checked={actionTypes.includes(a)}
                      onCheckedChange={(c) => setActionTypes((prev) => c ? [...prev, a] : prev.filter((x) => x !== a))}
                    >{a}</DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => { setQ(""); setEventTypes([]); setRegions([]); setActionTypes([]); setFrom(""); setTo(""); }}>Clear</Button>
              <Button variant="default" className="gap-2">Export</Button>
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <Card className="shadow-sm">
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div className="space-y-1">
              <Label>From</Label>
              <Input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>To</Label>
              <Input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Event type</Label>
              <Select onValueChange={(v) => setEventTypes(v ? [v] : [])}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Page type</Label>
              <Select onValueChange={(v) => setActionTypes(v ? [v] : [])}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_TYPES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div><div className="space-y-1">
              <Label>Author type</Label>
              <Select onValueChange={(v) => setActionTypes(v ? [v] : [])}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  {AUTHOR_TYPES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-sm">
          {/* <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Events</CardTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Sort:</span>
                <Select onValueChange={(v) => { const col = v as keyof DataRow; setSortBy(col); setSortDir("desc"); }}>
                  <SelectTrigger className="h-8 w-44"><SelectValue placeholder="timestamp (desc)" /></SelectTrigger>
                  <SelectContent>
                    {(["timestamp", "userid", "event_type", "region", "session_id", "action_type"] as (keyof DataRow)[]).map((c) => (
                      <SelectItem key={String(c)} value={String(c)}>{String(c)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}>{sortDir.toUpperCase()}</Button>
              </div>
            </div>
          </CardHeader> */}
          <CardContent className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {/* <TableHead className="w-8">
                    <Checkbox
                      checked={selectedRows.length === paged.length && paged.length > 0}
                      onCheckedChange={(c) => {
                        const pageIds = Object.fromEntries(paged.map((r) => [r.id, Boolean(c)]));
                        setSelected((prev) => ({ ...prev, ...pageIds }));
                      }}
                    />
                  </TableHead> */}
                  {[
                    ["session_id", "Session ID"],
                    ["session_start", "Session Start"],
                    ["session_end", "Session End"],
                    ["url", "URL"],
                    ["page_type", "Page Type"],
                    ["author", "Author"],
                    ["event_type", "Event Type"],
                    ["message", "Message"],
                    ["cursor_position", "Cursor Position"],
                    ["event_value", "Event Value"],
                    ["event_state", "Event State"],
                    ["offset_x", "Offset X"],
                    ["offset_y", "Offset Y"],
                  ].map(([key, label]) => (
                    <TableHead key={key} className="cursor-pointer select-none" onClick={() => toggleSort(key as keyof DataRow)}>
                      <div className="flex items-center gap-1">
                        <span>{label}</span>
                        {sortBy === key && <span className="text-muted-foreground">{sortDir === "asc" ? "▲" : "▼"}</span>}
                      </div>
                    </TableHead>
                  ))}
                  {/* <TableHead className="text-right">Actions</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/40">
                    {/* <TableCell className="w-8">
                      <Checkbox checked={!!selected[r.id]} onCheckedChange={(c) => setSelected((prev) => ({ ...prev, [r.id]: Boolean(c) }))} />
                    </TableCell> */}
                    <TableCell title={r.session_id} className="whitespace-nowrap">{r.session_id}</TableCell>
                    <TableCell title={r.session_start} className="whitespace-nowrap">{r.session_start}</TableCell>
                    <TableCell title={r.session_end} className="whitespace-nowrap">{r.session_end}</TableCell>
                    <TableCell className="font-medium">{r.url}</TableCell>
                    <TableCell><Badge variant="secondary" className="rounded-2xl">{r.page_type}</Badge></TableCell>
                    <TableCell><Badge className="rounded-2xl" variant="outline">{r.author}</Badge></TableCell>
                    <TableCell className="max-w-[150px] truncate">{r.event_type}</TableCell>
                    <TableCell className="max-w-[150px] truncate" title={r.message}>{r.message}</TableCell>
                    <TableCell>{r.cursor_position}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground max-w-[150px] truncate">{r.event_value}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{r.event_state}</TableCell>
                    <TableCell>{r.offset_x}</TableCell>
                    <TableCell>{r.offset_y}</TableCell>
                    {/* <TableCell className="text-right">
                      <Button size="sm" variant="ghost" className="gap-1" onClick={() => setOpenRow(r)}>
                        <Info className="h-4 w-4" /> Details
                      </Button>
                    </TableCell> */}
                  </TableRow>
                ))}
                {paged.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="py-10 text-center text-muted-foreground">No results match your filters.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t p-3 text-sm">
              <div className="text-muted-foreground">Page <span className="font-medium text-foreground">{page}</span> of <span className="font-medium text-foreground">{totalPages}</span></div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(1)} disabled={page === 1}>First</Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(totalPages)} disabled={page === totalPages}>Last</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
