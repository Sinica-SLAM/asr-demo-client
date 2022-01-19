import { defineStore } from "pinia";

interface settingState {
  asrKind: string;
  langKind: "Mandarin" | "Taibun" | "Other";
}

export const useSettingStore = defineStore({
  id: "settingStore",
  state: (): settingState => ({
    langKind: "Mandarin",
    asrKind: "sa_me_2.0",
  }),
  getters: {
    getAsrKind: (state) => state.asrKind,
    getLangKind: (state) => state.langKind,
  },
  actions: {},
});
