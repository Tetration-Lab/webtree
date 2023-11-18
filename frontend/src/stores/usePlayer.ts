import { Address, Hex, fromHex, toHex } from "viem";
import { create } from "zustand";
import { buildMimc7, buildBabyjub } from "circomlibjs";
import { User } from "@/interfaces/user";

interface PlayerStore {
  chainId: number | null;
  key: {
    address: Address;
    raw: Hex;
    commitment: Hex;
    publicKey: {
      x: bigint;
      y: bigint;
    };
  } | null;
  setKey: (
    key: {
      key: Hex;
      address: Address;
    } | null
  ) => Promise<void>;
  player: User | null;
  setPlayer: (player: User | null) => void;
  setChainId: (chainId: number | null) => void;
}

export const usePlayer = create<PlayerStore>((set) => ({
  key: null,
  chainId: null,
  setKey: async (key) => {
    if (key === null) {
      set({ key: null });
      return;
    }
    const babyjubjub = await buildBabyjub();
    const keyModFr = fromHex(key.key, "bigint") % babyjubjub.order;
    const mimc = await buildMimc7();
    const randomness = mimc.multiHash([keyModFr], 0);
    const publicKey = babyjubjub.mulPointEscalar(
      babyjubjub.Generator,
      keyModFr
    );

    set({
      key: {
        raw: toHex(keyModFr),
        address: key.address,
        commitment: `0x${mimc.F.toString(randomness, 16)}`,
        publicKey: {
          x: fromHex(`0x${mimc.F.toString(publicKey[0], 16)}`, "bigint"),
          y: fromHex(`0x${mimc.F.toString(publicKey[1], 16)}`, "bigint"),
        },
      },
    });
  },
  setChainId: (chainId) => set({ chainId }),
  player: null,
  setPlayer: (player) => set({ player }),
}));
