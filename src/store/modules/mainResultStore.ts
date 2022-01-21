import { useTranslateResultStore } from "./translateResultStore";
import { Segment } from "@/components/home/AsrDemoCard/asrDemoCard";
import { defineStore } from "pinia";
import { getCandidates } from "@/utils/candidates";
import Dictate, { WSResponse } from "@/utils/dictate";
import { usePostResultStore } from "@/store/modules/postResultStore";
import { useSettingStore } from "@/store/modules/settingStore";
import axios from "axios";
import { useAudioPlayerStore } from "@/store/modules/audioPlayerStore";
import { WordAlignment } from "@/utils/dictate";

interface mainResultState {
  tempText: string;
  segments: Segment[];
  currentTimeCode: number;
  recognizing: boolean;
  type: "realtime" | "upload" | "youtube" | undefined;
  dictate: Dictate;
  vid: string | undefined;
}

export const useMainResultStore = defineStore({
  id: "mainResultStore",
  state: (): mainResultState => ({
    tempText: "",
    segments: [],
    currentTimeCode: 0,
    recognizing: false,
    type: undefined,
    dictate: new Dictate(),
    vid: undefined,
  }),
  getters: {
    getTempText: (state): string => state.tempText,
    getSegments: (state): Segment[] => state.segments,
    getCurrentTimeCode: (state): number => state.currentTimeCode,
    getRecognizing: (state): boolean => state.recognizing,
    getType: (state): "realtime" | "upload" | "youtube" | undefined =>
      state.type,
    getVid: (state): string | undefined => state.vid,
  },
  actions: {
    appendFromDictate(res: WSResponse) {
      if (!res.result?.hypotheses[0]["word-alignment"]) {
        return;
      }

      const candidatesMap = getCandidates(res.result?.hypotheses);

      this.segments.push({
        id: res.id,
        wordAlignment: res.result.hypotheses[0]["word-alignment"].map(
          (alignment) => ({
            ...alignment,
            candidates: candidatesMap.get(alignment.start) ?? [],
          })
        ),
        segmentStart: new Date(res["segment-start"] * 1000),
        segmentLength: res["segment-length"] * 1000,
      });
      usePostResultStore().appendFromAPI(
        res.id,
        this.currentTimeCode,
        res["segment-length"] * 1000
      );
      this.currentTimeCode =
        (res["segment-start"] + res["segment-length"]) * 1000;
      this.tempText = "";
    },
    setTempText(text: string) {
      this.tempText = text;
    },
    setType(type: "realtime" | "upload") {
      this.type = type;
    },
    startReadTimeRecognition() {
      this.reset();
      useAudioPlayerStore().reset();
      usePostResultStore().reset();
      useTranslateResultStore().reset();
      this.recognizing = true;
      this.type = "realtime";
      this.dictate.startListening(useSettingStore().getAsrKind);
    },
    endReadTimeRecognition() {
      this.recognizing = false;
      this.dictate.stopListening();
    },
    async startUploadRecognition(file: File) {
      this.reset();
      useAudioPlayerStore().reset();
      usePostResultStore().reset();
      useTranslateResultStore().reset();

      const formData = new FormData();
      this.recognizing = true;
      this.type = "upload";
      formData.append("file", file);
      formData.append("asrKind", useSettingStore().getAsrKind);
      formData.append("langKind", useSettingStore().getLangKind);
      const data: WordAlignment[][] = (
        await axios.post(
          "https://asrvm.iis.sinica.edu.tw/demo/uploadRecognize",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        )
      ).data;

      const id = String(new Date().getTime());

      for (const wordAlignment of data) {
        const segmentStart = wordAlignment[0].start;
        const segmentLength =
          wordAlignment[wordAlignment.length - 1].start +
          wordAlignment[wordAlignment.length - 1].length -
          segmentStart;
        this.segments.push({
          id,
          wordAlignment: wordAlignment.map((alignment) => ({
            ...alignment,
            start: alignment.start - segmentStart,
          })),
          segmentStart: new Date(segmentStart * 1000),
          segmentLength: segmentLength * 1000,
        });
        if (useSettingStore().getLangKind == "Taibun") {
          useTranslateResultStore().appendFromAPI(
            wordAlignment.map((w) => w.word).join(" ")
          );
        }
      }

      useAudioPlayerStore().setAudioURL(URL.createObjectURL(file));
      this.recognizing = false;
    },
    async startYoutubeRecognition(vid: string) {
      this.reset();
      usePostResultStore().reset();
      useTranslateResultStore().reset();

      const data = (
        await axios.post("https://asrvm.iis.sinica.edu.tw/demo/youtubeSrt", {
          asrKind: useSettingStore().getAsrKind,
          vid,
        })
      ).data;

      this.vid = data.vid;

      console.log(data);
    },
    reset() {
      this.tempText = "";
      this.segments = [];
      this.currentTimeCode = 0;
      this.vid = undefined;
    },
  },
});
