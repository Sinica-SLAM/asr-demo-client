import {defineStore} from "pinia";
import {WordAlignment} from "@/utils/dictate";
import axios from "axios";
import {useSettingStore} from "@/store/modules/settingStore";


interface postResultState {
  wordAlignments: WordAlignment[][]
}


export const usePostResultStore = defineStore({
  id: "postResultStore",
  state: (): postResultState => ({
    wordAlignments: []
  }),
  getters: {
    getWordAlignments: (state): WordAlignment[][] => state.wordAlignments,
    getWordAlignmentsLength: (state): number => state.wordAlignments.length,
  },
  actions: {
    async appendFromAPI(id: string, start: number, length: number) {
      const settingStore = useSettingStore();
      const data: WordAlignment[] = (await axios.post("https://140.109.16.218:8080/recognize", {
          langKind: settingStore.langKind,
          asrKind: settingStore.getAsrKind,
          id,
          start: start / 1000,
          length: length / 1000, //second
        })
      ).data;
      this.wordAlignments.push(data.filter((w) => w.word !== "，"))
    },
  }
})