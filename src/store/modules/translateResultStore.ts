import { defineStore } from "pinia";
import axios from "axios";

interface translateResultState {
  wordAlignments: ({ word: string }[] | undefined)[];
}

export const useTranslateResultStore = defineStore({
  id: "translateResultStore",
  state: (): translateResultState => ({
    wordAlignments: [],
  }),
  getters: {
    getWordAlignments: (state): ({ word: string }[] | undefined)[] =>
      state.wordAlignments,
    getWordAlignmentsLength: (state): number => state.wordAlignments.length,
  },
  actions: {
    async appendFromAPI(index: number, sentence: string) {
      const data: { result: string } = (
        await axios.post("https://asrvm.iis.sinica.edu.tw/api/v1/translation", {
          sentence,
        })
      ).data;

      this.wordAlignments[index] = data.result
        .split(" ")
        .map((s) => ({ word: s }));
    },

    reset() {
      this.wordAlignments = [];
    },
  },
});
