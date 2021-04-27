<template>
  <div class="audio-player-container">
    <audio
      :src="props.audioURL"
      ref="player"
      @durationchange="() => (maxTime = player.duration)"
      @timeupdate="
        () => {
          currentTime = player.currentTime;
        }
      "
      @ended="
        () => {
          playing = false;
        }
      "
    />
    <AudioProgressBar
      :current="currentTime"
      :max="maxTime"
      @currentTimeChange="setNewTime"
      @changeEnd="() => player.play()"
    />
    <div class="controls-section">
      <div class="buttons-container">
        <button
          @click="
            () => {
              player.currentTime -= 10;
            }
          "
        >
          <img :src="rewindSVG" width="24" height="24" />
        </button>
        <button
          v-if="!playing"
          @click="
            () => {
              player.play();
              playing = true;
            }
          "
        >
          <img :src="playButtonSVG" width="30" height="30" />
        </button>
        <button
          v-else
          @click="
            () => {
              player.pause();
              playing = false;
            }
          "
        >
          <img :src="pauseSVG" height="30" width="30" />
        </button>
        <button
          @click="
            () => {
              player.currentTime += 10;
            }
          "
        >
          <img :src="fastForwardSVG" width="24" height="24" />
        </button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import "@/assets/scss/components/home/AsrDemoCard/AudioPlayer/audio-player.scss";
import AudioProgressBar from "./AudioProgressBar.vue";
import playButtonSVG from "@/assets/svg/play-button.svg";
import pauseSVG from "@/assets/svg/pause.svg";
import fastForwardSVG from "@/assets/svg/fast-forward.svg";
import rewindSVG from "@/assets/svg/rewind.svg";

export default defineComponent({
  components: { AudioProgressBar },
  name: "AudioController",
  props: {
    audioURL: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const player = ref<HTMLAudioElement>();
    const playing = ref<boolean>(false);
    const currentTime = ref<number>(0);
    const maxTime = ref<number>(0);
    const timeout = ref<number>();

    const setNewTime = (newTime: number) => {
      if (player.value) {
        player.value.currentTime = newTime;
      }
    };

    const playWithLength = (start: number, length: number) => {
      if (timeout.value) {
        clearTimeout(timeout.value);
      }

      setNewTime(start);
      player.value?.play();
      playing.value = true;

      timeout.value = window.setTimeout(() => {
        player.value?.pause();
        playing.value = false;
      }, length * 1000);
    };

    return {
      props,
      player,
      playing,
      currentTime,
      maxTime,
      setNewTime,
      playButtonSVG,
      pauseSVG,
      fastForwardSVG,
      rewindSVG,
      playWithLength,
    };
  },
});
</script>
