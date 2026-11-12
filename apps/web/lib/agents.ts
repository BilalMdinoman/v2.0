import type { LucideIcon } from "lucide-react";
import { Crown, Lightbulb, ShieldAlert, BarChart3, Radar, MessagesSquare, Zap } from "lucide-react";

export type Provider = "deepseek" | "google" | "x-ai";

export interface Agent {
  key: string;
  name: string;
  role: string;
  modelId: string; // locked model identifier (OpenRouter)
  modelName: string; // human friendly model name
  provider: Provider;
  providerLabel: string;
  color: string; // tailwind accent class token
  hex: string;
  description: string;
}

// Locked configuration. Do not rename agents or change their model IDs.
export const AGENTS: Agent[] = [
  {
    key: "orion",
    name: "Orion",
    role: "Master Supervisor",
    modelId: "deepseek/deepseek-r1",
    modelName: "DeepSeek R1",
    provider: "deepseek",
    providerLabel: "DeepSeek",
    color: "cyan",
    hex: "#22d3ee",
    description: "Coordinates the squad, reviews recommendations, evaluates cross-agent impact.",
  },
  {
    key: "cipher",
    name: "Cipher",
    role: "Strategy Generator",
    modelId: "deepseek/deepseek-r1",
    modelName: "DeepSeek R1",
    provider: "deepseek",
    providerLabel: "DeepSeek",
    color: "cyan",
    hex: "#22d3ee",
    description: "Generates and validates trading strategies and candidate configurations.",
  },
  {
    key: "lupus",
    name: "Lupus",
    role: "Risk Management",
    modelId: "deepseek/deepseek-chat",
    modelName: "DeepSeek Chat",
    provider: "deepseek",
    providerLabel: "DeepSeek",
    color: "blue",
    hex: "#3b82f6",
    description: "Evaluates risk, enforces deterministic safety, rejects unsafe proposals.",
  },
  {
    key: "argus",
    name: "Argus",
    role: "Performance Auditor",
    modelId: "deepseek/deepseek-chat",
    modelName: "DeepSeek Chat",
    provider: "deepseek",
    providerLabel: "DeepSeek",
    color: "blue",
    hex: "#3b82f6",
    description: "Audits performance, detects recurring problems, produces evidence-based findings.",
  },
  {
    key: "nova",
    name: "Nova",
    role: "Market Scanner",
    modelId: "google/gemini-2.0-flash-001",
    modelName: "Gemini 2.0 Flash",
    provider: "google",
    providerLabel: "Google Gemini",
    color: "teal",
    hex: "#14b8a6",
    description: "Scans markets, validates data freshness, supplies market context.",
  },
  {
    key: "zarah",
    name: "Zarah",
    role: "Sentiment Specialist",
    modelId: "google/gemini-2.0-flash-001",
    modelName: "Gemini 2.0 Flash",
    provider: "google",
    providerLabel: "Google Gemini",
    color: "teal",
    hex: "#14b8a6",
    description: "Classifies sentiment, checks source relevance and data freshness.",
  },
  {
    key: "elias",
    name: "Elias",
    role: "Execution Manager",
    modelId: "x-ai/grok-3-mini",
    modelName: "Grok 3 Mini",
    provider: "x-ai",
    providerLabel: "xAI Grok",
    color: "amber",
    hex: "#f59e0b",
    description: "Prepares and executes only authorized orders within existing permissions.",
  },
];

// Which providers share a quota scope (for the System 01 rate-limit engine).
export const PROVIDER_LABELS: Record<Provider, string> = {
  deepseek: "DeepSeek",
  google: "Google Gemini",
  "x-ai": "xAI Grok",
};

export const GATEWAY = "OpenRouter";

export const AGENT_BY_KEY: Record<string, Agent> = Object.fromEntries(
  AGENTS.map((a) => [a.key, a]),
);

// A distinct icon per agent, matching its role.
export const AGENT_ICONS: Record<string, LucideIcon> = {
  orion: Crown,
  cipher: Lightbulb,
  lupus: ShieldAlert,
  argus: BarChart3,
  nova: Radar,
  zarah: MessagesSquare,
  elias: Zap,
};
