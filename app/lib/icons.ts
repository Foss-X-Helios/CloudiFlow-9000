import type { LucideIcon } from "lucide-react";
import {
  CloudCog,
  Database,
  GitBranch,
  Globe,
  HardDrive,
  Network,
  Server,
  Shield,
  Zap,
} from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  Server,
  Zap,
  Network,
  HardDrive,
  Database,
  Shield,
  GitBranch,
  Globe,
  CloudCog,
};

export type IconName = keyof typeof iconMap;
