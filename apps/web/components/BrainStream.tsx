"use client";

import Link from "next/link";
import { BrainMessage } from "@/lib/types";
import { Brain, Activity, ArrowRight } from "lucide-react";

export default function BrainStream({ messages = [] }: { messages?: BrainMessage[] }) {
  // The agent is "working" only while the newest message is a STATUS (it has
  // started but not yet produced its result).
  const workingId = messages[0]?.messageType === "STATUS" ? messages[0].id : null;
  return (
    <div className="panel flex flex-col p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="panel-title flex items-center gap-1.5">
          <Brain className="h-3.5 w-3.5 text-accent-cyan" /> Brain Stream
        </h2>
        <Link
          href="/board"
          className="flex items-center gap-1 text-[11px] font-medium text-accent-cyan hover:underline"
        >
          View blackboard <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex-1 space-y-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <Activity className="h-6 w-6 text-slate-600" />
            <p className="text-sm text-slate-500">No agent messages yet.</p>
            <p className="text-xs text-slate-600">
              The blackboard fills with real reports once the daemon is running.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isStatus = m.messageType === "STATUS";
            return (
              <div key={m.id} className={`rounded-lg border border-terminal-border bg-terminal-bg2/60 p-3 ${isStatus ? "border-accent-green/30" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-accent-cyan">{m.agentName}</span>
                  <span className={`mono-num text-[10px] ${isStatus ? "text-accent-green" : "text-slate-500"}`}>{m.messageType}</span>
                </div>
                <p className={`mt-1 text-xs ${isStatus ? "text-accent-green" : "text-slate-300"}`}>
                  {m.messageText}
                  {m.id === workingId && (
                    <span className="ml-1.5 inline-flex gap-0.5 align-middle">
                      <span className="h-1 w-1 animate-bounce rounded-full bg-accent-green" />
                      <span className="h-1 w-1 animate-bounce rounded-full bg-accent-green [animation-delay:0.15s]" />
                      <span className="h-1 w-1 animate-bounce rounded-full bg-accent-green [animation-delay:0.3s]" />
                    </span>
                  )}
                </p>
                <div className="mt-1 text-[10px] text-slate-600">
                  {new Date(m.timestamp).toLocaleTimeString()}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
