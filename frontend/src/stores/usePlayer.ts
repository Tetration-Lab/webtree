import { Address, Hex, fromBytes, fromHex, toHex } from "viem";
import { create } from "zustand";
import { buildMimc7, buildBabyjub } from "circomlibjs";

interface PlayerStore {
  chainId: number | null;
  key: {
    address: Address;
    raw: Hex;
    randomness: Hex;
    publicKey: {
      x: Hex;
      y: Hex;
    };
  } | null;
  setKey: (
    key: {
      key: Hex;
      address: Address;
    } | null
  ) => Promise<void>;
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
    const randomness = mimc.hash(keyModFr, 0);
    const publicKey = babyjubjub.mulPointEscalar(
      babyjubjub.Generator,
      keyModFr
    );

    set({
      key: {
        raw: toHex(keyModFr),
        address: key.address,
        randomness: fromBytes(randomness, "hex"),
        publicKey: {
          x: fromBytes(publicKey[0], "hex"),
          y: fromBytes(publicKey[1], "hex"),
        },
      },
    });
  },
  setChainId: (chainId) => set({ chainId }),
}));
