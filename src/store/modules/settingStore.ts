import {defineStore} from "pinia";

interface settingState {
  asrKind: string,
  langKind: "Mandarin" | "Taibun" | "Other"
}

export const useSettingStore = defineStore({
  id: "settingStore",
  state: (): settingState => ({
    langKind: "Mandarin",
    asrKind: "formospeech_me_1",
  }),
  getters: {
    getAsrKind: (state) => state.asrKind,
    getLangKind: (state) => state.langKind,
  },
  actions: {},
})