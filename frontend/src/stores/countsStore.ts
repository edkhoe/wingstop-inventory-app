import { create } from 'zustand'
import { CountEntry } from '../types'

interface CountsState {
  counts: CountEntry[]
  setCounts: (counts: CountEntry[]) => void
  addCount: (count: CountEntry) => void
  updateCount: (count: CountEntry) => void
  removeCount: (id: string) => void
}

export const useCountsStore = create<CountsState>((set) => ({
  counts: [],
  setCounts: (counts) => set({ counts }),
  addCount: (count) => set((state) => ({ counts: [...state.counts, count] })),
  updateCount: (count) =>
    set((state) => ({
      counts: state.counts.map((c) => (c.id === count.id ? count : c)),
    })),
  removeCount: (id) =>
    set((state) => ({
      counts: state.counts.filter((c) => c.id !== id),
    })),
}))
