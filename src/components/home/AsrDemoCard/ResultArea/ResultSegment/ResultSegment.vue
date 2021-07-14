<template>
  <div class="result-segment">
    <div class="time-code-container">
      <div
          class="start-time-code"
          @click="
          (e) => {
            e.preventDefault();
            emit('wordClicked', {
              start: mainSegment.segmentStart.getTime() / 1000,
              length: mainSegment.segmentLength / 1000,
            });
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
          @wordClicked="(v) => emit('wordClicked', v)"
      />

      <ResultSubSegment
          v-if="typeof props.index !== 'undefined' && postWordAlignmentsLength > props.index"
          :canPlay="true"
          :index="props.index"
          type="p"
          @wordClicked="(v) => emit('wordClicked', v)"
      />

      <!--      <ResultSubSegment-->
      <!--        v-if="isTranslated"-->
      <!--        type="t"-->
      <!--        :index="props.index"-->
      <!--        :can-play="false"-->
      <!--      />-->
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, Ref, ref,} from "vue";

import "@/assets/scss/components/home/AsrDemoCard/ResultArea/ResultSegment/result-segment.scss";
import {WordAlignment} from "@/utils/dictate";
import {timeFormat} from "@/utils/timeFormat";
import ResultSubSegment from "@/components/home/AsrDemoCard/ResultArea/ResultSegment/ResultSubSegment.vue";
import {useMainResultStore} from "@/store/modules/mainResultStore";
import {usePostResultStore} from "@/store/modules/postResultStore";

export default defineComponent({
  name: "ResultSegment",
  components: {ResultSubSegment},
  emits: {
    wordClicked(payload: { start: number; length: number }) {
      return payload.start >= 0 && payload.length >= 0;
    },
  },
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
  setup(props, {emit}) {
    const mainSegment = computed(() => {
      const mainResultStore = useMainResultStore();
      if (typeof props.index === "undefined") {
        return {segmentStart: new Date(mainResultStore.getCurrentTimeCode), segmentLength: 0}
      }
      return mainResultStore.getSegments[props.index]
    })
    const startTimeCode = computed(() => timeFormat(mainSegment.value.segmentStart));
    const lengthCode = computed(() => {
          if (!mainSegment.value.segmentLength) {
            return ""
          }
          return timeFormat(new Date(mainSegment.value.segmentLength))
        }
    );

    const postWordAlignmentsLength = computed(() => usePostResultStore().getWordAlignmentsLength);


    const isTranslated = ref(false);
    const translateWordAlignment: Ref<WordAlignment[]> = ref([]);

    //     postWordAlignment.value = data.map((w) => ({
    //       ...w,
    //       start: Number(w.start),
    //       length: Number(w.length),
    //     }));
    //
    //     isPosted.value = true;
    //   }
    // });
    //
    // watchEffect(async () => {
    //   if (isPosted.value && postWordAlignment.value.length > 0) {
    //     const src = props.modelName.split("E")[0];
    //     const trg = src === "mandarin" ? "taigi" : "mandarin";
    //     const text = postWordAlignment.value
    //       .map((word) => word.word.replace(/[<>]/, ""))
    //       .join(" ");
    //
    //     const translatedText = (
    //       await axios.post("https://140.109.16.218:8080/translate", {
    //         src,
    //         trg,
    //         text,
    //       })
    //     ).data.result as string;
    //
    //     translateWordAlignment.value = translatedText.split(" ").map((s) => ({
    //       word: s,
    //     }));
    //
    //     isTranslated.value = true;
    //   }
    // });
    return {
      props,
      emit,
      mainSegment,
      startTimeCode,
      lengthCode,
      postWordAlignmentsLength,
      isTranslated,
      translateWordAlignment,
    };
  },
});
</script>
