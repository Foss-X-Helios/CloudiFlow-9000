import type { LucideIcon } from "lucide-react";
import {
  Server,
  Zap,
  Network,
  HardDrive,
  Database,
  Shield,
  GitBranch,
  Globe,
  CloudCog,
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
