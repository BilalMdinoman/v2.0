import {
  LayoutDashboard,
  MessageSquareText,
  ArrowLeftRight,
  Radar,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact: boolean;
}

export const NAV: NavItem[] = [
  { href: "/", label: "Command Center", icon: LayoutDashboard, exact: true },
  { href: "/board", label: "Agent Blackboard", icon: MessageSquareText, exact: false },
  { href: "/trades", label: "Trades", icon: ArrowLeftRight, exact: false },
  { href: "/analysis", label: "Analysis", icon: Radar, exact: false },
];
