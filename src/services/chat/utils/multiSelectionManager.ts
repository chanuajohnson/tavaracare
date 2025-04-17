
import { create } from 'zustand';

// Define the store interface
interface MultiSelectionStore {
  active: boolean;
  selections: string[];
  setActive: (isActive: boolean) => void;
  addSelection: (option: string) => string[];
  removeSelection: (option: string) => string[];
  toggleSelection: (option: string) => string[];
  resetSelections: (initialSelections?: string[]) => void;
  getSelections: () => string[];
  completeSelection: () => string[];
}

// Create store with zustand for better state management
export const useMultiSelectionStore = create<MultiSelectionStore>((set, get) => ({
  active: false,
  selections: [],
  
  setActive: (isActive: boolean) => set({ 
    active: isActive, 
    selections: isActive ? get().selections : [] 
  }),
  
  addSelection: (option: string) => {
    set((state) => ({
      selections: state.selections.includes(option) 
        ? state.selections 
        : [...state.selections, option]
    }));
    return get().selections;
  },
  
  removeSelection: (option: string) => {
    set((state) => ({
      selections: state.selections.filter(item => item !== option)
    }));
    return get().selections;
  },
  
  toggleSelection: (option: string) => {
    const currentSelections = get().selections;
    if (currentSelections.includes(option)) {
      return get().removeSelection(option);
    } else {
      return get().addSelection(option);
    }
  },
  
  resetSelections: (initialSelections = []) => {
    set({ selections: [...initialSelections] });
  },
  
  getSelections: () => {
    return get().selections;
  },
  
  completeSelection: () => {
    const selections = [...get().selections];
    set({ active: false, selections: [] });
    return selections;
  }
}));

// Legacy API compatibility functions
export const setMultiSelectionMode = (isActive: boolean, initialSelections: string[] = []) => {
  const store = useMultiSelectionStore.getState();
  store.setActive(isActive);
  store.resetSelections(initialSelections);
};

export const getMultiSelectionStatus = () => {
  const state = useMultiSelectionStore.getState();
  return {
    active: state.active,
    selections: state.selections
  };
};

export const addToMultiSelection = (option: string) => {
  return useMultiSelectionStore.getState().addSelection(option);
};

export const removeFromMultiSelection = (option: string) => {
  return useMultiSelectionStore.getState().removeSelection(option);
};

export const completeMultiSelection = () => {
  return useMultiSelectionStore.getState().completeSelection();
};
