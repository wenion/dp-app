"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { createClient } from "@/utils/supabase/client";

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  image?: string;
};

export default function Home() {
  const [data, setData] = useState<TeamMember[]>([]);
  const supabase = createClient();

  const fetchData = useCallback(
    async () => {
      let query = supabase
        .from("TeamMember")
        .select()
        .order("order_index", { ascending: true })
        .limit(6);

      const { data: rows } = await query;
      setData((rows as TeamMember[]) ?? []);
    }
    , []
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <div className="bg-white flex flex-col flex-1 w-full transition-all duration-300 hover:border-sky-500/50 focus-within:border-sky-500/50">
        <main className="flex flex-col py-6 px-16 text-base mt-auto mb-auto">
          <section className="space-y-6">
            <h2 className="text-xl font-semibold text-sky-700">Project Team</h2>

            <div className="grid gap-4 md:grid-cols-3 text-sm">
              {data.map((member) => (
                <div key={member.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-[1px]">
                  <div className="flex items-start gap-5">

                    {/* Portrait */}
                    <div className="relative h-16 w-16 flex-shrink-0">
                      {member.image && (
                        <Image
                          src={member.image ?? ""}
                          alt={member.name}
                          fill
                          className="rounded-full object-cover shadow-sm border border-gray-200"
                        />
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1">
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400 mb-1">
                        {member.role}
                      </p>

                      <p className="text-lg font-bold text-sky-800 leading-tight">
                        {member.name}
                      </p>

                      <p className="mt-2 text-sm leading-relaxed text-gray-600 max-w-prose">
                        {member.bio}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      <footer className="flex gap-6 pt-8 pb-4 flex-wrap items-center justify-center text-sm text-gray-500 h-20">
        ARC Discovery Project (DP24) · Monash University
      </footer>
    </>
  );
}
