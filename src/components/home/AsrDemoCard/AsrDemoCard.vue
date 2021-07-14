<template>
  <div id="demo-card-container">
    <div class="title-container">
      <div>{{ settingStore.getModuleName }}</div>
    </div>
    <ResultArea
      @wordClicked="
        (v) => {
          if (!recognizing) {
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
            if (recognizing) {
              dictate.stopListening().then((url) => (audioURL = url));
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
    <AudioPlayer v-else :audioURL="audioURL" ref="audioPlayer" />
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, ref, watch} from "vue";
import "@/assets/scss/components/home/AsrDemoCard/asr-demo-card.scss";
import Dictate from "@/utils/dictate";
import AudioPlayer from "./AudioPlayer/AudioPlayer.vue";
import microphoneSVG from "@/assets/svg/microphone.svg";
import stopSVG from "@/assets/svg/stop.svg";
import ResultArea from "@/components/home/AsrDemoCard/ResultArea/ResultArea.vue";
import {useMainResultStore} from "@/store/modules/mainResultStore";
import {useSettingStore} from "@/store/modules/settingStore";

export default defineComponent({
  name: "AsrDemoCard",
  components: {
    AudioPlayer,
    ResultArea,
  },
  setup() {
    const audioURL = ref<string>();
    const audioPlayer = ref<InstanceType<typeof AudioPlayer>>();
    const dictate = new Dictate();
    const recognizing = computed(() => useMainResultStore().getRecognizing)
    const settingStore = useSettingStore()
    watch(
        () => settingStore.getModulePort,
        () => {
          dictate.destroy();
          audioURL.value = "";
        }
    );

    return {
      dictate,
      audioURL,
      microphoneSVG,
      stopSVG,
      audioPlayer,
      recognizing,
      settingStore,
    };
  },
});
</script>
