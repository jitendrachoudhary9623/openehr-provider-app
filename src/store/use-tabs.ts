import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Tab {
  id: string
  title: string
  path: string
  icon?: string
}

interface TabState {
  tabs: Tab[]
  activeTab: string | null
  addTab: (tab: Tab) => void
  removeTab: (id: string) => void
  setActiveTab: (id: string) => void
  hasTab: (path: string) => boolean
  getTabById: (id: string) => Tab | undefined
}

export const useTabStore = create<TabState>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTab: null,
      addTab: (tab: Tab) => {
        set((state) => {
          // Don't add if tab with same path already exists
          if (state.tabs.some((t) => t.path === tab.path)) {
            return state
          }
          return {
            tabs: [...state.tabs, tab],
            activeTab: tab.id,
          }
        })
      },
      removeTab: (id: string) => {
        set((state) => {
          const newTabs = state.tabs.filter((tab) => tab.id !== id)
          let newActiveTab = state.activeTab

          // If we're removing the active tab, activate the last tab
          if (state.activeTab === id && newTabs.length > 0) {
            newActiveTab = newTabs[newTabs.length - 1].id
          }

          return {
            tabs: newTabs,
            activeTab: newActiveTab,
          }
        })
      },
      setActiveTab: (id: string) => set({ activeTab: id }),
      hasTab: (path: string) => {
        const state = get()
        return state.tabs.some((tab) => tab.path === path)
      },
      getTabById: (id: string) => {
        const state = get()
        return state.tabs.find((tab) => tab.id === id)
      },
    }),
    {
      name: 'tab-storage',
    }
  )
)
