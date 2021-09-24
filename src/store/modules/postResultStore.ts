import {defineStore} from "pinia";
import {WordAlignment} from "@/utils/dictate";
import axios from "axios";
import {useSettingStore} from "@/store/modules/settingStore";


interface postResultState {
  wordAlignments: (WordAlignment[] | undefined)[]
}


export const usePostResultStore = defineStore({
  id: "postResultStore",
  state: (): postResultState => ({
    wordAlignments: []
  }),
  getters: {
    getWordAlignments: (state): (WordAlignment[] | undefined)[] => state.wordAlignments,
    getWordAlignmentsLength: (state): number => state.wordAlignments.length,
  },
  actions: {
    async appendFromAPI(id: string, start: number, length: number) {
      this.wordAlignments.push(undefined);
      const index = this.wordAlignments.length - 1;
      const settingStore = useSettingStore();
      const data: WordAlignment[] = (await axios.post("https://asrvm.iis.sinica.edu.tw/demo/postRecognize", {
          langKind: settingStore.langKind,
          asrKind: settingStore.getAsrKind,
          id,
          start: start / 1000,
          length: length / 1000, //second
        })
      ).data;
      this.wordAlignments[index] = data.filter((w) => w.word !== "，");
    },
  }
})