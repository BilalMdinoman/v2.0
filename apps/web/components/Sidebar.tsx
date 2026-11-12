"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gauge, Route } from "lucide-react";
import { NAV } from "@/lib/nav";

// Backend systems (no dedicated page yet). Analysis lives in the main nav above.
const INFRA = [
  { label: "API Performance", icon: Gauge },
  { label: "Model Routing", icon: Route },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-full w-56 shrink-0 flex-col border-r border-terminal-border bg-terminal-bg2/60 lg:flex">
      {/* logo */}
      <Link href="/" className="flex items-center gap-2 border-b border-terminal-border px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-cyan to-accent-blue text-xs font-black text-terminal-bg">
          V2
        </div>
        <div>
          <div className="text-sm font-bold tracking-tight text-slate-100">V.2.0</div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500">
            Multi-Agent Trading
          </div>
        </div>
      </Link>

      {/* nav */}
      <nav className="space-y-1 p-2">
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                active
                  ? "bg-accent-cyan/10 text-accent-cyan"
                  : "text-slate-400 hover:bg-terminal-panel hover:text-slate-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              {n.label}
            </Link>
          );
        })}
      </nav>

      {/* infrastructure */}
      <div className="px-4 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
        Infrastructure
      </div>
      <div className="space-y-1 px-2">
        {INFRA.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600"
              title="Coming with the backend"
            >
              <Icon className="h-4 w-4" />
              <span>{s.label}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-auto border-t border-terminal-border p-3 text-[10px] leading-relaxed text-slate-600">
        Paper trading only.
        <br />
        No real funds are ever at risk.
      </div>
    </aside>
  );
}
