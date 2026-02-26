import { create } from "zustand";
import type { MoveCategory } from "@/types/frame-data";
import type { SortMode } from "@/services/punishService";

interface FilterState {
  categoryFilter: MoveCategory | "all";
  sortMode: SortMode;
  punishableOnly: boolean;
  searchQuery: string;
  setCategoryFilter: (category: MoveCategory | "all") => void;
  setSortMode: (mode: SortMode) => void;
  setPunishableOnly: (value: boolean) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>()((set) => ({
  categoryFilter: "all",
  sortMode: "startup",
  punishableOnly: false,
  searchQuery: "",
  setCategoryFilter: (category) => set({ categoryFilter: category }),
  setSortMode: (mode) => set({ sortMode: mode }),
  setPunishableOnly: (value) => set({ punishableOnly: value }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  resetFilters: () =>
    set({
      categoryFilter: "all",
      sortMode: "startup",
      punishableOnly: false,
      searchQuery: "",
    }),
}));
