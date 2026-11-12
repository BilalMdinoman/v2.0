"use client";

import { useLiveData } from "@/lib/live-data";
import { MessageSquareText, GitBranch } from "lucide-react";

export default function BoardPage() {
  const { data } = useLiveData();
  const messages = data.messages;
  const workingId = messages[0]?.messageType === "STATUS" ? messages[0].id : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-cyan/10">
          <MessageSquareText className="h-4 w-4 text-accent-cyan" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-slate-100">Agent Blackboard</h1>
          <p className="text-[11px] text-slate-500">
            The shared blackboard where the seven agents delegate, debate, and decide.
          </p>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="panel flex flex-col items-center justify-center gap-2 py-24 text-center">
          <GitBranch className="h-6 w-6 text-slate-600" />
          <p className="text-sm text-slate-500">No discussion yet.</p>
          <p className="max-w-sm text-xs text-slate-600">
            The blackboard fills with real agent messages, debates, and decisions once the daemon runs.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((m) => {
            const isStatus = m.messageType === "STATUS";
            return (
              <div
                key={m.id}
                className={`panel p-3 ${isStatus ? "border-accent-green/20 bg-accent-green/[0.03]" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-accent-cyan">{m.agentName}</span>
                  <span className={`mono-num text-[10px] ${isStatus ? "text-accent-green" : "text-slate-500"}`}>
                    {m.messageType}
                  </span>
                </div>
                <p className={`mt-1 whitespace-pre-wrap text-xs ${isStatus ? "text-accent-green" : "text-slate-300"}`}>
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
          })}
        </div>
      )}
    </div>
  );
}
