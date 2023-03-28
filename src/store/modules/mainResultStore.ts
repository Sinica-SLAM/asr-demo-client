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
import srtParser2 from "srt-parser-2";

interface mainResultState {
  tempText: string;
  segments: Segment[];
  currentTimeCode: number;
  recognizing: boolean;
  type: "realtime" | "upload" | "youtube" | undefined;
  dictate: Dictate;
  vid: string | undefined;
  recognizeStatus: string;
}

function padLeft(value: number, length = 2): string
{
  return value.toString().padStart(length, '0')
}

function formatTimestamp(
  timestamp: number,
) {
  const date = new Date(0, 0, 0, 0, 0, 0, timestamp)

  const hours = date.getHours()
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()
  const ms = Math.floor(
    timestamp - (hours * 3600000 + minutes * 60000 + seconds * 1000)
  )

  return `${padLeft(hours)}:${padLeft(minutes)}:${padLeft(seconds)},${padLeft(ms, 3)}`
}

export const useMainResultStore = defineStore({
  id: "mainResultStore",
  state: (): mainResultState => ({
    tempText: "",
    segments: [],
    currentTimeCode: 0,
    recognizing: false,
    recognizeStatus: "",
    type: undefined,
    dictate: new Dictate(),
    vid: undefined
  }),
  getters: {
    getTempText: (state): string => state.tempText,
    getSegments: (state): Segment[] => state.segments,
    getCurrentTimeCode: (state): number => state.currentTimeCode,
    getRecognizing: (state): boolean => state.recognizing,
    getType: (state): "realtime" | "upload" | "youtube" | undefined =>
      state.type,
    getVid: (state): string | undefined => state.vid,
    getRecognizeStatus: (state): string => state.recognizeStatus,
    getSubtitle: (state): string => (new srtParser2()).toSrt(state.segments.map((segment, i) => ({id: (i+1).toString(), startTime: formatTimestamp(segment.segmentStart.getTime()),endTime: formatTimestamp(segment.segmentStart.getTime() + segment.segmentLength),text: segment.wordAlignment.map(alignment => alignment.word).join(''),startSeconds:0,endSeconds:0}))),
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
          alignment => ({
            ...alignment,
            candidates: candidatesMap.get(alignment.start) ?? []
          })
        ),
        segmentStart: new Date(res["segment-start"] * 1000),
        segmentLength: res["segment-length"] * 1000
      });
      if (useSettingStore().getLangKind !== "Other") {
        usePostResultStore().appendFromAPI(
          res.id,
          this.currentTimeCode,
          res["segment-length"] * 1000
        );
      }

      this.currentTimeCode =
        (res["segment-start"] + res["segment-length"]) * 1000;
      this.tempText = "";
    },
    setTempText(text: string) {
      this.tempText = text;
    },
    setType(type: "realtime" | "upload" | "youtube") {
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

    async pollRecognizeStatus(filename: string) {
      const executePoll = async (
        resolve: (value: any) => void,
        reject: (reason?: any) => void
      ) => {
        const res = await axios.get(
          `https://asrvm.iis.sinica.edu.tw/demo/result/${filename}`
        );

        if (res.data.done) {
          return resolve(res.data.data);
        } else {
          this.recognizeStatus = res.data.data;
          setTimeout(executePoll, 2000, resolve, reject);
        }
      };

      return new Promise(executePoll);
    },

    async startUploadRecognition(file: File) {
      this.reset();
      useAudioPlayerStore().reset();
      usePostResultStore().reset();
      useTranslateResultStore().reset();

      const formData = new FormData();
      this.recognizing = true;
      this.recognizeStatus = "上傳檔案中...(1/3)";
      this.type = "upload";
      formData.append("file", file);
      formData.append("asrKind", useSettingStore().getAsrKind);
      formData.append("langKind", useSettingStore().getLangKind);

      const res = await axios.post(
        "https://asrvm.iis.sinica.edu.tw/demo/uploadRecognize",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.status !== 200) {
        alert(`上傳失敗, status_code: ${res.status}\n${res.data}`);
        this.recognizing = false;
        return;
      }

      const result = await this.pollRecognizeStatus(res.data);

      if (typeof result === "string" || result instanceof String) {
        alert(`辨識失敗, ${result}`);
        this.recognizing = false;
        return;
      }

      const data: WordAlignment[][] = result as WordAlignment[][];

      const id = String(new Date().getTime());

      for (const [index, wordAlignment] of data.entries()) {
        const segmentStart = wordAlignment[0].start;
        const segmentLength =
          wordAlignment[wordAlignment.length - 1].start +
          wordAlignment[wordAlignment.length - 1].length -
          segmentStart;
        this.segments.push({
          id,
          wordAlignment: wordAlignment.map(alignment => ({
            ...alignment,
            start: alignment.start - segmentStart
          })),
          segmentStart: new Date(segmentStart * 1000),
          segmentLength: segmentLength * 1000
        });
        if (useSettingStore().getLangKind == "Taibun") {
          useTranslateResultStore().appendFromAPI(
            index,
            wordAlignment.map(w => w.word).join(" ")
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

      this.recognizeStatus = "上傳檔案中...(1/5)";

      const res = await axios.post(
        "https://asrvm.iis.sinica.edu.tw/demo/youtubeSrt",
        {
          asrKind: useSettingStore().getAsrKind,
          vid
        }
      );

      if (res.status !== 200) {
        alert(`上傳失敗, status_code: ${res.status}\n${res.data}`);
        return;
      }

      const result = await this.pollRecognizeStatus(res.data);

      if (typeof result === "string" || result instanceof String) {
        alert(`${result}`);
        return;
      }

      this.vid = result.vid;
    },
    reset() {
      this.tempText = "";
      this.segments = [];
      this.currentTimeCode = 0;
      this.vid = undefined;
    }
  }
});
