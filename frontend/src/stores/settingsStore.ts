import { create } from 'zustand'
import { AppSettings } from '../types'

interface SettingsState {
  settings: AppSettings
  setSettings: (settings: AppSettings) => void
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
}

const defaultSettings: AppSettings = {
  theme: 'system',
  notificationsEnabled: true,
  language: 'en',
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: defaultSettings,
  setSettings: (settings) => set({ settings }),
  updateSetting: (key, value) =>
    set((state) => ({
      settings: { ...state.settings, [key]: value },
    })),
})) 