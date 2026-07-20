import { useMemo, useState } from "react";

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
}: ExportDataButtonProp
) {
  const { session } = useAppContext();
  const selectedSession = useSelectedSession();

  const [data, setData] = useState<TraceRow[]>(traces);

  const userName = useMemo(() => {
    return session?.user?.identities?.[0]?.identity_data?.name + "_" || "";
  }, [session]);

  const downloadCSV = (rows: TraceRow[], filename: string) => {
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

  const exportData = async () => {

    const filename = `${userName}traces_${
      selectedSession?.name?? selectedSession?.clientId
    }.csv`;

    downloadCSV(data, filename);
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
