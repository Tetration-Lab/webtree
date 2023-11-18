import { Stat } from "@/interfaces/stats";

export const DEFAULT_STAT = 100;
export const DEFAULT_GLOBAL_STAT = 1337;

export const STATS = {
  [Stat.Gold]: {
    name: "Gold",
    description: "Token of wealth and prosperity",
    color: "#FFD700",
    lottie: "/icons/coin.json",
    default: DEFAULT_STAT,
  },
  [Stat.Science]: {
    name: "Science",
    description: "Token of knowledge and wisdom",
    color: "#00BFFF",
    lottie: "/icons/lab.json",
    default: DEFAULT_STAT,
  },
  [Stat.Religion]: {
    name: "Religion",
    description: "Token of faith and devotion",
    color: "#FF0000",
    lottie: "/icons/pagoda.json",
    default: DEFAULT_STAT,
  },
  [Stat.Nature]: {
    name: "Nature",
    description: "Token of nature and life",
    color: "#008000",
    lottie: "/icons/tree.json",
    default: DEFAULT_GLOBAL_STAT,
  },
} as const;
