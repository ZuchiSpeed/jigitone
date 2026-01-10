// Import Zustand's create function for store creation
import { create } from "zustand";

// Define TypeScript type for the exit modal state
type HeartsModelState = {
  isOpen: boolean;      // Current visibility state of the modal
  open: () => void;     // Function to open/show the modal
  close: () => void;    // Function to close/hide the modal
};

// Create and export the Zustand store
export const useHeartsModel = create<HeartsModelState>((set) => ({
// Initial state: modal is closed by default
  isOpen: false,

  // Action: open the modal by setting isOpen to true
  open: () => set({ isOpen: true }),
  // Action: close the modal by setting isOpen to false
  close: () => set({ isOpen: false }),
}));
