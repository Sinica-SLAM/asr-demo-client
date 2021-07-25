import {defineStore} from "pinia";

interface settingState {
  modulePort: number,
}

export const useSettingStore = defineStore({
  id: "settingStore",
  state: (): settingState => ({
    modulePort: 8890
  }),
  getters: {
    getModulePort: (state) => state.modulePort,
    getModuleName: (state) => {
      switch (state.modulePort) {
        case 8890:
          return "tailo_0630"
        default:
          return "unknown"
      }
    }
  },
  actions: {},
})