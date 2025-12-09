
import { Header } from "@/components/Layouts/header";
import NextTopLoader from "nextjs-toploader";

export default async function TeamLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NextTopLoader color="#5750F1" showSpinner={false} />
      <Header />
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
