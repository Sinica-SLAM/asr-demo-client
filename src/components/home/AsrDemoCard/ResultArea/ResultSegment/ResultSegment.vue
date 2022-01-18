<template>
  <div class="result-segment">
    <div class="time-code-container">
      <div
        class="start-time-code"
        @click="
          (e) => {
            e.preventDefault();
            audioPlayerStore.playWithLength(
              mainSegment.segmentStart.getTime(),
              mainSegment.segmentLength
            );
          }
        "
      >
        {{ startTimeCode }}
      </div>
      <div v-if="lengthCode" class="length-code">
        {{ "(" + lengthCode + ")" }}
      </div>
    </div>

    <div class="sub-segment-container">
      <ResultSubSegment
        :canPlay="true"
        :index="props.index"
        :text="props.text"
        type="r"
        @wordClicked="
          (wordTime) =>
            audioPlayerStore.playWithLength(
              wordTime.start + mainSegment.segmentStart.getTime(),
              wordTime.length
            )
        "
      />

      <ResultSubSegment
        v-if="
          typeof props.index !== 'undefined' &&
            postWordAlignmentsLength > props.index
        "
        :canPlay="true"
        :index="props.index"
        type="p"
        @wordClicked="
          (wordTime) =>
            audioPlayerStore.playWithLength(
              wordTime.start + mainSegment.segmentStart.getTime(),
              wordTime.length
            )
        "
      />

      <ResultSubSegment
        v-if="
          typeof props.index !== 'undefined' &&
            translateWordAlignmentsLength > props.index
        "
        :canPlay="false"
        :index="props.index"
        type="t"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";

import "@/assets/scss/components/home/AsrDemoCard/ResultArea/ResultSegment/result-segment.scss";
import { timeFormat } from "@/utils/timeFormat";
import ResultSubSegment from "@/components/home/AsrDemoCard/ResultArea/ResultSegment/ResultSubSegment.vue";
import { useMainResultStore } from "@/store/modules/mainResultStore";
import { usePostResultStore } from "@/store/modules/postResultStore";
import { useTranslateResultStore } from "@/store/modules/translateResultStore";
import { useAudioPlayerStore } from "@/store/modules/audioPlayerStore";

export default defineComponent({
  name: "ResultSegment",
  components: { ResultSubSegment },
  props: {
    index: {
      type: Number,
      required: false,
    },
    text: {
      type: String,
      required: false,
    },
  },
  setup(props) {
    const audioPlayerStore = useAudioPlayerStore();
    const mainSegment = computed(() => {
      const mainResultStore = useMainResultStore();
      if (typeof props.index === "undefined") {
        return {
          segmentStart: new Date(mainResultStore.getCurrentTimeCode),
          segmentLength: 0,
        };
      }
      return mainResultStore.getSegments[props.index];
    });
    const startTimeCode = computed(() =>
      timeFormat(mainSegment.value.segmentStart)
    );
    const lengthCode = computed(() => {
      if (!mainSegment.value.segmentLength) {
        return "";
      }
      return timeFormat(new Date(mainSegment.value.segmentLength));
    });

    const postWordAlignmentsLength = computed(
      () => usePostResultStore().getWordAlignmentsLength
    );

    const translateWordAlignmentsLength = computed(
      () => useTranslateResultStore().getWordAlignmentsLength
    );

    return {
      props,
      audioPlayerStore,
      mainSegment,
      startTimeCode,
      lengthCode,
      postWordAlignmentsLength,
      translateWordAlignmentsLength,
    };
  },
});
</script>
