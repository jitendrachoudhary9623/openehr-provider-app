import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Tab {
  id: string
  title: string
  path: string
}

interface TabState {
  tabs: Tab[]
  activeTab: string | null
  addTab: (tab: Tab) => void
  removeTab: (id: string) => void
  setActiveTab: (id: string) => void
  hasTab: (path: string) => boolean
  getTabById: (id: string) => Tab | undefined
  updateTab: (id: string, updates: Partial<Tab>) => void
}

export const useTabStore = create<TabState>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTab: null,
      addTab: (tab) => {
        set((state) => ({
          tabs: [...state.tabs, tab],
          activeTab: tab.id,
        }))
      },
      removeTab: (id) => {
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
      setActiveTab: (id) => set({ activeTab: id }),
      hasTab: (path) => {
        const state = get()
        return state.tabs.some((tab) => tab.path === path)
      },
      getTabById: (id) => {
        const state = get()
        return state.tabs.find((tab) => tab.id === id)
      },
      updateTab: (id, updates) => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === id ? { ...tab, ...updates } : tab
          ),
        }))
      },
    }),
    {
      name: 'tab-storage',
    }
  )
)
