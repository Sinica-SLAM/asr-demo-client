<template>
  <div id="demo-card-container">
    <div class="title-container">
      <div>{{ settingStore.getModuleName }}</div>
    </div>
    <ResultArea/>
    <div class="controller-container" v-if="!audioURL">
      <div
          class="svg-container"
          @click="
          () => {
            if (recognizing) {
              dictate.stopListening()
            } else {
              dictate.startListening(settingStore.modulePort);
            }
          }
        "
      >
        <img v-if="!recognizing" :src="microphoneSVG" alt="record" height="64" width="64"/>
        <img v-else :src="stopSVG" alt="stop" height="44" width="44"/>
      </div>
    </div>
    <AudioPlayer v-else ref="audioPlayer" :audioURL="audioURL"/>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, watch} from "vue";
import "@/assets/scss/components/home/AsrDemoCard/asr-demo-card.scss";
import Dictate from "@/utils/dictate";
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
    const audioURL = computed(() => useAudioPlayerStore().audioURL)
    const dictate = new Dictate();
    const recognizing = computed(() => useMainResultStore().getRecognizing)
    const settingStore = useSettingStore()
    watch(
        () => settingStore.getModulePort,
        () => {
          dictate.destroy();
          useAudioPlayerStore().setAudioURL("")
        }
    );

    return {
      dictate,
      audioURL,
      microphoneSVG,
      stopSVG,
      recognizing,
      settingStore,
    };
  },
});
</script>
