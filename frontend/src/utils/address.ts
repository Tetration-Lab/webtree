import { wagmiConfig } from "@/constants/web3";
import { Address } from "viem";

/**
 * Return address with ellipsis in the middle
 */
export const formatAddress = (address?: string | Address) => {
  const addr = address?.toLowerCase();
  return `${addr?.slice(0, 6)}..${addr?.slice(-4)}`;
};
