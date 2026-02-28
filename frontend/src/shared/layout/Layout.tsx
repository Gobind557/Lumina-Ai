import { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 min-h-0 w-full min-w-0">
        <Sidebar />
        <main className="flex-1 min-h-0 min-w-0 overflow-y-auto basis-0">{children}</main>
      </div>
    </div>
  );
}
