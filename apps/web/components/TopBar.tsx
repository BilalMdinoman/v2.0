"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Wallet, Menu, X } from "lucide-react";
import { SolanaIcon } from "./BrandIcons";
import { useLiveData } from "@/lib/live-data";
import { usd } from "@/lib/format";
import { NAV } from "@/lib/nav";

export default function TopBar() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { data, connected, lastUpdated } = useLiveData();
  const pathname = usePathname();

  // Tick every second so "updated Xs ago" visibly counts up (proves live refresh).
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const secondsAgo = lastUpdated ? Math.max(0, Math.round((Date.now() - lastUpdated) / 1000)) : null;

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-terminal-border bg-terminal-bg2/60 px-4">
        {/* hamburger (mobile only) */}
        <button
          onClick={() => setMenuOpen(true)}
          className="rounded-lg border border-terminal-border p-2 text-slate-400 transition hover:text-slate-200 lg:hidden"
          title="Menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="flex min-w-0 items-center justify-end gap-2">
          {/* live refresh indicator */}
          <div className="mr-1 hidden items-center gap-1.5 text-[10px] text-slate-500 sm:flex">
            <span className={`h-1.5 w-1.5 rounded-full ${connected ? "animate-pulse bg-accent-green" : "bg-slate-600"}`} />
            {connected && secondsAgo !== null ? `updated ${secondsAgo}s ago` : "no live data"}
          </div>

          {/* virtual balance -> wallet */}
          <Link
            href="/wallet"
            className="flex items-center gap-2 rounded-lg border border-terminal-border bg-terminal-panel/60 px-3 py-1.5 transition hover:border-accent-cyan/40"
          >
            <Wallet className="h-4 w-4 text-accent-cyan" />
            <div className="text-right leading-tight">
              <div className="text-[9px] uppercase tracking-wide text-slate-500">Balance</div>
              <div className="mono-num text-sm font-semibold text-slate-100">
                {data.account ? usd(data.account.equity) : "—"}
              </div>
            </div>
          </Link>

          {/* solana network */}
          <div className="hidden items-center gap-1.5 rounded-lg border border-terminal-border px-3 py-1.5 sm:flex">
            <SolanaIcon className="h-4 w-4" />
            <span className="text-xs font-semibold text-slate-200">Solana</span>
          </div>
        </div>
      </header>

      {/* mobile drawer nav */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-terminal-border bg-terminal-bg2 p-4 lg:hidden">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-cyan to-accent-blue text-xs font-black text-terminal-bg">
                  V2
                </div>
                <div className="text-sm font-bold text-slate-100">V.2.0</div>
              </div>
              <button onClick={() => setMenuOpen(false)} className="rounded-lg p-1 text-slate-400 hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="space-y-1">
              {NAV.map((n) => {
                const Icon = n.icon;
                const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition ${
                      active ? "bg-accent-cyan/10 text-accent-cyan" : "text-slate-400 hover:bg-terminal-panel hover:text-slate-200"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {n.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-terminal-border pt-3 text-[10px] text-slate-600">
              Paper trading only. No real funds are ever at risk.
            </div>
          </div>
        </>
      )}
    </>
  );
}
