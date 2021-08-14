import {defineStore} from "pinia";

interface settingState {
  asrKind: string,
  langKind: "Mandarin" | "Taigi"
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
        default:
          return 8888
      }
    },
    getAsrKind: (state) => state.asrKind,
    getLangKind: (state) => state.langKind,
  },
  actions: {},
})