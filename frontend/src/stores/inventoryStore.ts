import { create } from 'zustand'
import { InventoryItem, Category } from '../types'

interface InventoryState {
  items: InventoryItem[]
  categories: Category[]
  setItems: (items: InventoryItem[]) => void
  setCategories: (categories: Category[]) => void
  addItem: (item: InventoryItem) => void
  updateItem: (item: InventoryItem) => void
  removeItem: (id: string) => void
}

export const useInventoryStore = create<InventoryState>((set) => ({
  items: [],
  categories: [],
  setItems: (items) => set({ items }),
  setCategories: (categories) => set({ categories }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  updateItem: (item) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === item.id ? item : i)),
    })),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),
}))
