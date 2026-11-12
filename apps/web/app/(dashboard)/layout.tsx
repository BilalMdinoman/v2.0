"use client";

import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { LiveDataProvider } from "@/lib/live-data";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LiveDataProvider>
      <div className="terminal-grid flex h-screen w-screen overflow-hidden">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="mx-auto max-w-6xl space-y-4">{children}</div>
          </main>
        </div>
      </div>
    </LiveDataProvider>
  );
}
