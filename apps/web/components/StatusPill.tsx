import { AgentStatus } from "@/lib/types";

const MAP: Record<AgentStatus, { label: string; cls: string; dot: string }> = {
  online: {
    label: "ONLINE",
    cls: "border-accent-green/40 text-accent-green bg-accent-green/10",
    dot: "bg-accent-green",
  },
  degraded: {
    label: "DEGRADED",
    cls: "border-accent-amber/40 text-accent-amber bg-accent-amber/10",
    dot: "bg-accent-amber",
  },
  offline: {
    label: "OFFLINE",
    cls: "border-slate-600 text-slate-400 bg-slate-500/10",
    dot: "bg-slate-500",
  },
};

export default function StatusPill({ status }: { status: AgentStatus }) {
  const s = MAP[status];
  return (
    <span className={`pill ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
