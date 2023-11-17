import { create } from "zustand";

interface PlayerStore {
  key: string | null;
  setKey: (key: string | null) => void;
}

export const usePlayer = create<PlayerStore>((set) => ({
  key: null,
  setKey: (key) => set({ key }),
}));
