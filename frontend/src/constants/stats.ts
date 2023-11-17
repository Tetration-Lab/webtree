import { Stat } from "@/interfaces/stats";

export const STATS = {
  [Stat.Gold]: {
    name: "Gold",
    description: "Token of wealth and prosperity",
    color: "#FFD700",
    lottie: "/icons/coin.json",
  },
  [Stat.Science]: {
    name: "Science",
    description: "Token of knowledge and wisdom",
    color: "#00BFFF",
    lottie: "/icons/lab.json",
  },
  [Stat.Religion]: {
    name: "Religion",
    description: "Token of faith and devotion",
    color: "#FF0000",
    lottie: "/icons/pagoda.json",
  },
  [Stat.Nature]: {
    name: "Nature",
    description: "Token of nature and life",
    color: "#008000",
    lottie: "/icons/tree.json",
  },
} as const;
