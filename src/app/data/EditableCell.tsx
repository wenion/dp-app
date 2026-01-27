import React, { useEffect, useRef, useState } from "react";

type EditableCellProps = {
  value: string | null;
  searchInput: string;
};

export function EditableCell({ value, searchInput }: EditableCellProps) {
  const [editing, setEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editing]);

  if (editing) {
    return (
      <textarea
        ref={textareaRef}
        className="w-full min-h-[150px] resize-y border rounded p-2 text-sm"
        value={value ?? ""}
        readOnly
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setEditing(false);
          }
        }}
      />
    );
  }

  const truncated = value && value.length > 80 ? value.slice(0, 80) + "…" : value;

  return (
    <div
      className="truncate cursor-text"
      title="Double click to expand"
      onDoubleClick={() => setEditing(true)}
    >
      {truncated ?? <span className="text-gray-300">NULL</span>}
    </div>
  );
}
