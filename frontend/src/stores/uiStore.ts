import { create } from 'zustand'

interface UIState {
  isModalOpen: boolean
  setModalOpen: (open: boolean) => void
  loading: boolean
  setLoading: (loading: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  isModalOpen: false,
  setModalOpen: (open) => set({ isModalOpen: open }),
  loading: false,
  setLoading: (loading) => set({ loading }),
}))
