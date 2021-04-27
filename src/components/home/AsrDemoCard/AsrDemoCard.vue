<template>
  <div id="demo-card-container">
    <div class="title-container"></div>
    <ResultArea
      :segments="segments"
      :modelName="props.modelName"
      @wordClicked="
        (v) => {
          if (!recording) {
            audioPlayer.playWithLength(v.start, v.length);
          }
        }
      "
    />
    <div class="controller-container" v-if="!audioURL">
      <div
        class="svg-container"
        @click="
          () => {
            if (recording) {
              dicatate.stopListening().then((url) => (audioURL = url));
            } else {
              dicatate.startListening(props.port);
            }
            recording = !recording;
          }
        "
      >
        <img :src="microphoneSVG" width="64" height="64" v-if="!recording" />
        <img :src="stopSVG" width="44" height="44" v-else />
      </div>
    </div>
    <AudioPlayer v-else :audioURL="audioURL" ref="audioPlayer" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, watch } from "vue";
import "@/assets/scss/components/home/AsrDemoCard/asr-demo-card.scss";
import Dictate from "@/utils/dictate";
import AudioPlayer from "./AudioPlayer/AudioPlayer.vue";
import microphoneSVG from "@/assets/svg/microphone.svg";
import stopSVG from "@/assets/svg/stop.svg";
import { Segment } from "@/components/home/AsrDemoCard/asrDemoCard";
import ResultArea from "@/components/home/AsrDemoCard/ResultArea/ResultArea.vue";
import { getCandidates, getCandidatesFlat } from "@/utils/candidates";

export default defineComponent({
  name: "AsrDemoCard",
  components: {
    AudioPlayer,
    ResultArea,
  },
  props: {
    port: {
      type: Number,
      required: true,
    },
    modelName: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const recording = ref(false);
    const segments = reactive<Segment[]>([]);
    let currentTimeCode = 0;
    const segmentFinal = ref(true);
    const audioURL = ref<string>();
    const audioPlayer = ref<InstanceType<typeof AudioPlayer>>();
    const dicatate = new Dictate({
      onResult: async (result) => {
        if (result?.adaptation_state) {
          if (dicatate.recording) {
            audioURL.value = await dicatate.stopListening();
          }
          dicatate.destroy();
          recording.value = false;

          return;
        }
        if (segmentFinal.value) {
          segments.push({
            id: "",
            text: "",
            wordAlignment: [],
            segmentStart: new Date(currentTimeCode),
            completed: false,
            segmentLength: 0,
            candidatesMap: new Map(),
          });
          segmentFinal.value = false;
        }
        if (result?.result) {
          const currentSegmentIndex = segments.length - 1;
          segments[currentSegmentIndex].id = result.id;
          segments[
            currentSegmentIndex
          ].text = result.result.hypotheses[0].transcript.replace(" ", "");

          if (result.result.final) {
            currentTimeCode += result["segment-length"] * 1000;
            segmentFinal.value = true;

            segments[currentSegmentIndex].segmentStart = new Date(
              result["segment-start"] * 1000
            );

            segments[currentSegmentIndex].segmentLength =
              result["segment-length"] * 1000;

            segments[currentSegmentIndex].wordAlignment =
              result.result.hypotheses[0]["word-alignment"] ?? [];

            segments[currentSegmentIndex].candidatesMap = getCandidates(
              result.result.hypotheses
            );

            segments[currentSegmentIndex].completed = true;
          }
        }
      },
    });

    watch(
      () => props.port,
      () => {
        dicatate.destroy();
        recording.value = false;
        segments.length = 0;
        currentTimeCode = 0;
        segmentFinal.value = true;
        audioURL.value = "";
      }
    );

    return {
      recording,
      dicatate,
      segments,
      audioURL,
      microphoneSVG,
      stopSVG,
      audioPlayer,
      getCandidatesFlat,
      props,
    };
  },
});
</script>
