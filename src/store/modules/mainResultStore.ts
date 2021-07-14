import {Segment} from "@/components/home/AsrDemoCard/asrDemoCard";
import {defineStore} from "pinia";
import {WSResponse} from "@/utils/dictate";
import {getCandidates} from "@/utils/candidates";

interface mainResultState {
  tempText: string,
  segments: Segment[],
  currentTimeCode: number,
  recognizing: boolean
}

export const useMainResultStore = defineStore({
  id: "mainResultStore", state: (): mainResultState => ({
    tempText: "",
    segments: [],
    currentTimeCode: 0,
    recognizing: false,
  }),
  getters: {
    getTempText: (state): string => state.tempText,
    getSegments: (state): Segment[] => state.segments,
    getCurrentTimeCode: (state): number => state.currentTimeCode,
    getRecognizing: (state): boolean => state.recognizing,
  },
  actions: {
    appendFromDictate(res: WSResponse) {
      if (!res.result?.hypotheses[0]["word-alignment"]) {
        return
      }

      const candidatesMap = getCandidates(
        res.result?.hypotheses
      )

      this.segments.push({
        id: res.id,
        wordAlignment: res.result.hypotheses[0]["word-alignment"].map((alignment) => ({
          ...alignment,
          candidates: candidatesMap.get(alignment.start) ?? []
        })),
        segmentStart: new Date(this.currentTimeCode),
        segmentLength: res["segment-length"] * 1000,

      })
      this.currentTimeCode += res["segment-length"] * 1000
      this.tempText = ""
      console.log(this.segments)
    },
    changeTempText(text: string) {
      this.tempText = text
    },
    startRecognition() {
      this.recognizing = true
    },
    endRecognition() {
      this.recognizing = false
    }
  }
})

