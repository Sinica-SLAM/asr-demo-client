<template>
  <div class="audio-player-container">
    <audio
        ref="player"
        :src="props.audioURL"
        @durationchange="()=>audioPlayerStore.ondurationchange()"
        @ended="()=>audioPlayerStore.onended()"
        @timeupdate="() => audioPlayerStore.ontimeupdate()"
    />
    <AudioProgressBar
        :current="audioPlayerStore.getCurrentTime"
        :max="audioPlayerStore.getDuration"
        @changeEnd="() => audioPlayerStore.play()"
        @currentTimeChange="(newTime)=>audioPlayerStore.setCurrentTime(newTime)"
    />
    <div class="controls-section">
      <div class="buttons-container">
        <button
            @click="
            () => audioPlayerStore.addCurrentTime(-10)
          "
        >
          <img :src="rewindSVG" alt="rewind" height="24" width="24"/>
        </button>
        <button
            v-if="!audioPlayerStore.getPlaying"
            @click="() => audioPlayerStore.play()"
        >
          <img :src="playButtonSVG" alt="play" height="30" width="30"/>
        </button>
        <button
            v-else
            @click="() =>audioPlayerStore.pause()"
        >
          <img :src="pauseSVG" alt="pause" height="30" width="30"/>
        </button>
        <button
            @click="
            () => audioPlayerStore.addCurrentTime(10)
          "
        >
          <img :src="fastForwardSVG" alt="fastForward" height="24" width="24"/>
        </button>
        <button
            @click="onDownloadClick()"
        >
          <img :src="downloadSVG" alt="downloadSVG" height="24" width="24"/>
        </button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {defineComponent, ref, watchEffect} from "vue";
import "@/assets/scss/components/home/AsrDemoCard/AudioPlayer/audio-player.scss";
import AudioProgressBar from "./AudioProgressBar.vue";
import playButtonSVG from "@/assets/svg/play-button.svg";
import pauseSVG from "@/assets/svg/pause.svg";
import fastForwardSVG from "@/assets/svg/fast-forward.svg";
import rewindSVG from "@/assets/svg/rewind.svg";
import downloadSVG from "@/assets/svg/download.svg";
import {useAudioPlayerStore} from "@/store/modules/audioPlayerStore";
import { useMainResultStore } from "@/store/modules/mainResultStore";

export default defineComponent({
  components: {AudioProgressBar},
  name: "AudioController",
  props: {
    audioURL: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const player = ref<HTMLAudioElement>();
    const audioPlayerStore = useAudioPlayerStore()
    const mainResultStore = useMainResultStore()

    watchEffect(() => {
          if (player.value) {
            useAudioPlayerStore().setPlayer(player.value)
          }
        },
        {
          flush: 'post'
        })

    function onDownloadClick(){
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([mainResultStore.getSubtitle], {type: 'text/plain'}));
      link.setAttribute('download', 'result.srt');
      link.click();
      URL.revokeObjectURL(link.href);

    }


    return {
      props,
      player,
      audioPlayerStore,
      playButtonSVG,
      pauseSVG,
      fastForwardSVG,
      rewindSVG,
      downloadSVG,
      mainResultStore,
      onDownloadClick,
    };
  },
});
</script>
