
import { Header } from "@/components/Layouts/header";
import NextTopLoader from "nextjs-toploader";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <NextTopLoader color="#5750F1" showSpinner={false} />
      <Header />
      {children}
    </div>
  );
}
