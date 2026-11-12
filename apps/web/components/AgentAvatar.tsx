import { AGENT_BY_KEY, AGENT_ICONS } from "@/lib/agents";

// A distinctive, colour-coded icon badge for each agent. Gives every agent a
// "real" icon (not a letter) with its own brand colour and a soft glow.

const SIZES = {
  sm: { box: "h-7 w-7", icon: "h-4 w-4", rounded: "rounded-md" },
  md: { box: "h-9 w-9", icon: "h-5 w-5", rounded: "rounded-lg" },
  lg: { box: "h-14 w-14", icon: "h-7 w-7", rounded: "rounded-xl" },
} as const;

export default function AgentAvatar({
  agentKey,
  size = "md",
}: {
  agentKey: string;
  size?: keyof typeof SIZES;
}) {
  const agent = AGENT_BY_KEY[agentKey];
  const Icon = AGENT_ICONS[agentKey];
  if (!agent || !Icon) return null;

  const s = SIZES[size];
  return (
    <span
      className={`flex shrink-0 items-center justify-center ${s.box} ${s.rounded}`}
      style={{
        background: `linear-gradient(135deg, ${agent.hex}33, ${agent.hex}0f)`,
        color: agent.hex,
        boxShadow: `inset 0 0 0 1px ${agent.hex}40, 0 2px 10px ${agent.hex}1f`,
      }}
    >
      <Icon className={s.icon} />
    </span>
  );
}
