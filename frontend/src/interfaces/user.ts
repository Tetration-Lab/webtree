import { Hex } from "viem";

export interface Point {
  x: bigint;
  y: bigint;
}

export interface CipherText {
  c1: Point;
  c2: Point;
}

export interface User {
  status: bigint;
  commitment: Hex;
  totalDonations: bigint;
  lastActionEpoch: number;
  totalActions: number;
  publicKey: Point;
  es1: CipherText;
  es2: CipherText;
  es3: CipherText;
}
