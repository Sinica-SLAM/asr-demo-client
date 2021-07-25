<template>
  <div id="demo-card-container">
    <div class="title-container">
      <div>{{ settingStore.getModuleName }}</div>
    </div>
    <ResultArea/>
    <div v-if="type === 'realtime' && recognizing" class="controller-container">
      <div
          class="svg-container"
          @click="
          () => mainResultStore.endReadTimeRecognition()
        "
      >
        <img :src="stopSVG" alt="stop" height="44" width="44"/>
      </div>
    </div>
    <AudioPlayer v-if="audioURL" ref="audioPlayer" :audioURL="audioURL"/>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, watch} from "vue";
import "@/assets/scss/components/home/AsrDemoCard/asr-demo-card.scss";
import AudioPlayer from "./AudioPlayer/AudioPlayer.vue";
import microphoneSVG from "@/assets/svg/microphone.svg";
import stopSVG from "@/assets/svg/stop.svg";
import ResultArea from "@/components/home/AsrDemoCard/ResultArea/ResultArea.vue";
import {useMainResultStore} from "@/store/modules/mainResultStore";
import {useSettingStore} from "@/store/modules/settingStore";
import {useAudioPlayerStore} from "@/store/modules/audioPlayerStore";

export default defineComponent({
  name: "AsrDemoCard",
  components: {
    AudioPlayer,
    ResultArea,
  },
  setup() {
    const audioPlayerStore = useAudioPlayerStore()
    const mainResultStore = useMainResultStore()
    const settingStore = useSettingStore()
    const audioURL = computed(() => audioPlayerStore.audioURL)
    const type = computed(() => mainResultStore.getType)
    const recognizing = computed(() => mainResultStore.getRecognizing)
    watch(
        () => settingStore.getModulePort,
        () => {
          mainResultStore.dictate.destroy();
          audioPlayerStore.setAudioURL("")
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
    };
  },
});
</script>
