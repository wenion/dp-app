"use client"

import { Suspense } from "react";

import SessionExplorerPage from "./SessionExplorerPage";


export default function Page() {
  return (
    <Suspense>
      <SessionExplorerPage />
    </Suspense>
  );
}
