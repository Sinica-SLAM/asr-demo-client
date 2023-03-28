<template>
  <div id="demo-card-container">
    <div class="title-container">
      <div>{{ settingStore.displayName }}</div>
    </div>
    <ResultArea />
    <div v-if="type === 'realtime' && recognizing" class="controller-container">
      <div
        class="svg-container"
        @click="() => mainResultStore.endReadTimeRecognition()"
      >
        <img :src="stopSVG" alt="stop" height="44" width="44" />
      </div>
    </div>
    <div
      class="recognize-status"
      v-if="type === 'upload' && recognizing && recognizeStatus"
    >
      {{ recognizeStatus }}
    </div>
    <LoadingCircle v-if="type === 'upload' && recognizing" />
    <AudioPlayer v-if="audioURL" ref="audioPlayer" :audioURL="audioURL" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, watch } from "vue";
import "@/assets/scss/components/home/AsrDemoCard/asr-demo-card.scss";
import AudioPlayer from "./AudioPlayer/AudioPlayer.vue";
import microphoneSVG from "@/assets/svg/microphone.svg";
import stopSVG from "@/assets/svg/stop.svg";
import ResultArea from "@/components/home/AsrDemoCard/ResultArea/ResultArea.vue";
import { useMainResultStore } from "@/store/modules/mainResultStore";
import { useSettingStore } from "@/store/modules/settingStore";
import { useAudioPlayerStore } from "@/store/modules/audioPlayerStore";
import LoadingCircle from "@/components/shared/LoadingCircle.vue";

export default defineComponent({
  name: "AsrDemoCard",
  components: {
    LoadingCircle,
    AudioPlayer,
    ResultArea,
  },
  setup() {
    const audioPlayerStore = useAudioPlayerStore();
    const mainResultStore = useMainResultStore();
    const settingStore = useSettingStore();
    const audioURL = computed(() => audioPlayerStore.audioURL);
    const type = computed(() => mainResultStore.getType);
    const recognizing = computed(() => mainResultStore.getRecognizing);
    const recognizeStatus = computed(() => mainResultStore.getRecognizeStatus);
    watch(
      () => settingStore.getAsrKind,
      () => {
        mainResultStore.dictate.destroy();
        audioPlayerStore.setAudioURL("");
      }
    );

    return {
      type,
      audioURL,
      microphoneSVG,
      stopSVG,
      recognizing,
      settingStore,
      mainResultStore,
      recognizeStatus,
    };
  },
});
</script>
