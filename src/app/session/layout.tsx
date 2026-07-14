import { Header } from "@/components/Layouts/header";
import NextTopLoader from "nextjs-toploader";

export default async function DataLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col bg-background">
      <NextTopLoader color="#5750F1" showSpinner={false} />
      <Header />
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
