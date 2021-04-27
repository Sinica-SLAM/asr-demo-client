<template>
  <div class="audio-progress-bar-container">
    <div
      class="audio-progress-bar"
      ref="audioProgressBar"
      @mousemove="(e) => (hoverWidth = calcPercentage(e.clientX))"
      @click="
        (e) => emit('currentTimeChange', calcPercentage(e.clientX) * props.max)
      "
      @mousedown="indicatorAndProgressMousedown"
    >
      <div
        v-if="mouseDown"
        class="progress-indicator"
        :style="{
          left: width * 100 + '%',
        }"
        @mousedown="indicatorAndProgressMousedown"
      >
        <div class="time-code-box">
          <div>{{ timeCode }}</div>
          <span class="time-code-box-arrow"></span>
        </div>
      </div>
      <div class="current-progress" :style="{ width: width * 100 + '%' }"></div>
      <div
        class="hover-progress"
        :style="{ width: hoverWidth * 100 + '%' }"
      ></div>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType, ref } from "vue";
import "@/assets/scss/components/home/AsrDemoCard/AudioPlayer/audio-progress-bar.scss";
import { timeFormat } from "@/utils/timeFormat";
export default defineComponent({
  name: "AudioProgressBar",
  emits: {
    currentTimeChange(payload: number) {
      return payload >= 0;
    },
  },
  props: {
    max: {
      type: Number,
      required: true,
    },
    current: {
      type: Number,
      required: true,
    },
    click: {
      type: Object as PropType<() => void>,
      required: false,
    },
  },
  setup(props, { emit }) {
    const audioProgressBar = ref<HTMLDivElement>();

    const mouseDown = ref(false);
    const hoverWidth = ref(0);
    const width = computed(() => {
      if (mouseDown.value) {
        return hoverWidth.value;
      }
      return props.current / props.max;
    });

    const timeCode = ref("00:00");

    const calcPercentage = (clientX: number) => {
      const offSetX =
        clientX - (audioProgressBar.value?.getBoundingClientRect().left ?? 0);
      let percentage =
        offSetX / (audioProgressBar.value?.getBoundingClientRect().width ?? 0);
      if (percentage < 0) {
        percentage = 0;
      } else if (percentage > 1) {
        percentage = 1;
      }

      if (mouseDown.value) {
        timeCode.value = timeFormat(new Date(percentage * props.max * 1000));
      }

      return percentage;
    };

    const bodyMousemoveListener = (e: MouseEvent) => {
      hoverWidth.value = calcPercentage(e.clientX);
    };

    const bodyMouseupListener = (e: MouseEvent) => {
      emit("currentTimeChange", calcPercentage(e.clientX) * props.max);

      document.body.removeEventListener("mousemove", bodyMousemoveListener);
      document.body.removeEventListener("mouseup", bodyMouseupListener);
      setTimeout(() => (mouseDown.value = false), 100);
    };

    const indicatorAndProgressMousedown = (e: MouseEvent) => {
      e.preventDefault();

      mouseDown.value = true;
      document.body.addEventListener("mousemove", bodyMousemoveListener);
      document.body.addEventListener("mouseup", bodyMouseupListener);
    };

    return {
      audioProgressBar,
      props,
      width,
      hoverWidth,
      mouseDown,
      indicatorAndProgressMousedown,
      calcPercentage,
      emit,
      timeCode,
    };
  },
});
</script>
