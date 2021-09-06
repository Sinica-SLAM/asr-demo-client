import {defineStore} from "pinia";

interface settingState {
  asrKind: string,
  langKind: "Mandarin" | "Taibun" | "Tailo"
}

export const useSettingStore = defineStore({
  id: "settingStore",
  state: (): settingState => ({
    langKind: "Mandarin",
    asrKind: "formospeech_me_1",
  }),
  getters: {
    getModulePort: (state) => {
      switch (state.asrKind) {
        case "formospeech_me_1":
          return 8888
        case "tailo_0630":
          return 8889
        case "tailo_0630_taibun":
          return 8890
        case "kenkone":
          return 8891
        default:
          return 8888
      }
    },
    getAsrKind: (state) => state.asrKind,
    getLangKind: (state) => state.langKind,
  },
  actions: {},
})