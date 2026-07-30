import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { FileDown } from 'lucide-react';

import { useAppContext } from "@/components/Layouts/context";
import { useSelectedSession } from "./Context";

import type { TraceRow } from "@/types/trace";


type ExportDataButtonProp = {
  traces: TraceRow[];
};

export function ExportDataButton({
  traces
}: ExportDataButtonProp) {
  const { session } = useAppContext();
  const selectedSession = useSelectedSession();

  const userName = useMemo(() => {
    return (
      session?.user?.identities?.[0]?.identity_data?.name
        ? `${session.user.identities[0].identity_data.name}_`
        : ""
    );
  }, [session]);

  const downloadCSV = (rows: TraceRow[], filename: string) => {
    if (!rows.length) {
      console.log("No rows");
      return;
    }

    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map(row =>
        headers.map(h =>
          JSON.stringify((row as Record<string, unknown>)[h] ?? "")
        ).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  const exportData = async () => {

    const filename = `${userName}traces_${
      selectedSession?.name?? selectedSession?.clientId
    }.csv`;

    downloadCSV(traces, filename);
  };

  return (
    <Button
      className="cursor-pointer"
      variant="outline"
      size="sm"
      onClick={() => exportData()}
    >
      <FileDown/>Export All
    </Button>
  );
}
