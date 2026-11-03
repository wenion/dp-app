
"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

type Session = {
  id: number;
  user_id: string;
  name: string | null;
  event_count: number;
  started_at: number;
};

type Profile = {
  id: string;
  email: string;
  role: string;
  usedAt: string | null;
  sessions: Session[];
};

function formatDate(
  value: string | number | null | undefined,
) {
  if (value == null) return "—";

  const date =
    typeof value === "number"
      ? new Date(value < 1e12 ? value * 1000 : value)
      : new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString();
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === "admin";

  return (
    <span
      className={
        isAdmin
          ? "inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-700"
          : "inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
      }
    >
      {role}
    </span>
  );
}

export default function ProfilesTable({
  profiles,
}: {
  profiles: Profile[];
}) {
  const [expandedIds, setExpandedIds] =
    useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedIds((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  if (profiles.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center text-sm text-gray-500">
        No profiles found.
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full min-w-[850px] text-left text-sm">
        <thead className="sticky top-0 z-10 bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500 shadow-sm">
          <tr>
            <th className="px-5 py-4">Email</th>
            <th className="px-5 py-4">Role</th>
            <th className="px-5 py-4 text-right">
              Sessions
            </th>
            <th className="px-5 py-4 text-right">
              Total Traces
            </th>
            <th className="px-5 py-4">Last Used</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {profiles.map((profile) => {
            const expanded =
              expandedIds.has(profile.id);

            const totalTraces =
              profile.sessions.reduce(
                (sum, session) =>
                  sum + session.event_count,
                0,
              );

            return (
              <ProfileRows
                key={profile.id}
                profile={profile}
                expanded={expanded}
                totalTraces={totalTraces}
                onToggle={() =>
                  toggleExpanded(profile.id)
                }
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ProfileRows({
  profile,
  expanded,
  totalTraces,
  onToggle,
}: {
  profile: Profile;
  expanded: boolean;
  totalTraces: number;
  onToggle: () => void;
}) {
  type SortKey = "id" | "event_count" | "started_at";
  type SortDirection = "asc" | "desc";

  const [sortKey, setSortKey] = useState<SortKey>("started_at");
  const [sortDirection, setSortDirection] =
    useState<SortDirection>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((previous) =>
        previous === "asc" ? "desc" : "asc",
      );
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const sortedSessions = useMemo(() => {
    return [...profile.sessions].sort((a, b) => {
      const difference = a[sortKey] - b[sortKey];

      return sortDirection === "asc"
        ? difference
        : -difference;
    });
  }, [profile.sessions, sortKey, sortDirection]);

  const SortIcon = ({
    column,
  }: {
    column: SortKey;
  }) => {
    if (sortKey !== column) {
      return <ArrowUpDown size={13} />;
    }

    return sortDirection === "asc" ? (
      <ArrowUp size={13} />
    ) : (
      <ArrowDown size={13} />
    );
  };

  return (
    <>
      {/* Profile Row */}
      <tr className="transition-colors hover:bg-gray-50">
        <td className="px-5 py-4">
          <button
            type="button"
            aria-expanded={expanded}
            onClick={onToggle}
            className="flex max-w-full cursor-pointer items-center gap-3 text-left"
          >
            {expanded ? (
              <ChevronDown
                size={18}
                className="shrink-0 text-gray-400"
              />
            ) : (
              <ChevronRight
                size={18}
                className="shrink-0 text-gray-400"
              />
            )}

            <span className="truncate font-medium text-sky-800">
              {profile.email || profile.id}
            </span>
          </button>
        </td>

        <td className="px-5 py-4">
          <RoleBadge role={profile.role} />
        </td>

        <td className="px-5 py-4 text-right tabular-nums text-gray-700">
          {profile.sessions.length.toLocaleString()}
        </td>

        <td className="px-5 py-4 text-right tabular-nums font-medium text-gray-700">
          {totalTraces.toLocaleString()}
        </td>

        <td className="whitespace-nowrap px-5 py-4 text-gray-500">
          {formatDate(profile.usedAt)}
        </td>
      </tr>

      {/* Expanded Sessions */}
      {expanded && (
        <tr>
          <td colSpan={5} className="bg-gray-50 p-0">
            {profile.sessions.length === 0 ? (
              <p className="px-4 py-4 text-sm italic text-gray-400">
                No sessions found.
              </p>
            ) : (
              <div className="w-full">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="sticky top-0 z-20 bg-gray-100 text-xs text-gray-500 shadow-sm">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">
                        <button
                          type="button"
                          onClick={() => handleSort("id")}
                          className="inline-flex cursor-pointer items-center gap-1.5 hover:text-sky-700"
                        >
                          Session ID
                          <SortIcon column="id" />
                        </button>
                      </th>

                      <th className="px-4 py-3 text-left font-medium">
                        Name
                      </th>

                      <th className="px-4 py-3 text-right font-medium">
                        <button
                          type="button"
                          onClick={() => handleSort("event_count")}
                          className="inline-flex cursor-pointer items-center gap-1.5 hover:text-sky-700"
                        >
                          Traces
                          <SortIcon column="event_count" />
                        </button>
                      </th>

                      <th className="px-4 py-3 text-left font-medium">
                        <button
                          type="button"
                          onClick={() => handleSort("started_at")}
                          className="inline-flex cursor-pointer items-center gap-1.5 hover:text-sky-700"
                        >
                          Started At
                          <SortIcon column="started_at" />
                        </button>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 bg-white">
                    {sortedSessions.map((session) => (
                      <tr
                        key={session.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-gray-500">
                          {session.id}
                        </td>

                        <td className="max-w-[250px] truncate px-4 py-3 font-medium text-gray-700">
                          {session.name || "Unnamed"}
                        </td>

                        <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                          {session.event_count.toLocaleString()}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                          {formatDate(session.started_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
