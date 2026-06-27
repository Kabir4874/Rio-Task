import { create } from 'zustand';

interface UserState {
  selectedVehicleId: string | null;
  searchQuery: string;
  typeFilter: string;
  pathHistories: Record<string, [number, number][]>;

  setSelectedVehicleId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setTypeFilter: (filter: string) => void;
  setPathHistories: (
    histories:
      | Record<string, [number, number][]>
      | ((
          prev: Record<string, [number, number][]>,
        ) => Record<string, [number, number][]>),
  ) => void;
}

export const useUserStore = create<UserState>((set) => ({
  selectedVehicleId: null,
  searchQuery: '',
  typeFilter: 'ALL',
  pathHistories: {},

  setSelectedVehicleId: (id) => set({ selectedVehicleId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setTypeFilter: (filter) => set({ typeFilter: filter }),
  setPathHistories: (histories) =>
    set((state) => ({
      pathHistories:
        typeof histories === 'function'
          ? histories(state.pathHistories)
          : histories,
    })),
}));
