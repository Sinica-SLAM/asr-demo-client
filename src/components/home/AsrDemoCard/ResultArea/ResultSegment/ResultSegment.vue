<template>
  <div class="result-segment">
    <div class="time-code-container">
      <div
        class="start-time-code"
        @click="
          e => {
            e.preventDefault();
            emit('wordClicked', {
              start: props.segmentStart.getTime() / 1000,
              length: props.segmentLength / 1000
            });
          }
        "
      >
        {{ startTimeCode }}
      </div>
      <div class="length-code" v-if="props.completed">
        {{ "(" + lengthCode + ")" }}
      </div>
    </div>

    <div class="sub-segment-container">

    <ResultSubSegment
      type="r"
      :text="props.rText"
      :wordAlignment="props.rWordAlignment"
      :candidatesMap="props.rCandidatesMap"
      :segmentStart="props.segmentStart"
      :canPlay="true"
      @wordClicked="v => emit('wordClicked', v)"
    />

    <ResultSubSegment
      v-if="isPosted && postWordAlignment.length > 0"
      type="p"
      :wordAlignment="postWordAlignment"
      :segmentStart="props.segmentStart"
      :tokens="postTokens"
      :canPlay="true"
      @wordClicked="v => emit('wordClicked', v)"
    />

    <ResultSubSegment
      v-if="isTranslated"
      type="t"
      :wordAlignment="translateWordAlignment"
      :segment-start="props.segmentStart"
      :can-play="false"
    />
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  Ref,
  ref,
  watchEffect
} from "vue";

import Axios from "axios";

import "@/assets/scss/components/home/AsrDemoCard/ResultArea/ResultSegment/result-segment.scss";
import { WordAlignment } from "@/utils/dictate";
import { timeFormat } from "@/utils/timeFormat";
import { Candidate } from "@/utils/candidates";
import ResultSubSegment from "@/components/home/AsrDemoCard/ResultArea/ResultSegment/ResultSubSegment.vue";
import axios from "axios";

export default defineComponent({
  name: "AsrDemoSegment",
  components: { ResultSubSegment },
  emits: {
    wordClicked(payload: { start: number; length: number }) {
      return payload.start >= 0 && payload.length >= 0;
    }
  },
  props: {
    id: {
      type: String,
      required: true
    },
    rText: {
      type: String,
      required: false
    },
    completed: {
      type: Boolean,
      required: true
    },
    rWordAlignment: {
      type: Array as PropType<Array<WordAlignment>>,
      required: false
    },
    segmentStart: {
      type: Date as PropType<Date>,
      required: true
    },
    segmentLength: {
      type: Number,
      required: true
    },
    rCandidatesMap: {
      type: Map as PropType<Map<number, Candidate[]>>,
      required: false
    },
    modelName: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    const startTimeCode = computed(() => timeFormat(props.segmentStart));
    const lengthCode = computed(() =>
      timeFormat(new Date(props.segmentLength))
    );
    const isPosted = ref(false);

    const postWordAlignment: Ref<WordAlignment[]> = ref([]);
    const postTokens: Ref<string[][]> = ref([]);

    const isTranslated = ref(false);
    const translateWordAlignment: Ref<WordAlignment[]> = ref([]);

    watchEffect(async () => {
      if (props.completed) {
        const data: {
          wordAlignments: WordAlignment[];
          tokens: string[][];
        } = (
          await Axios.post("https://140.109.16.218:8080/recognize", {
            modelName: props.modelName,
            id: props.id,
            start: props.segmentStart.getTime() / 1000,
            length: props.segmentLength / 1000 //second
          })
        ).data;

        postWordAlignment.value = data.wordAlignments.map(w => ({
          ...w,
          start: Number(w.start),
          length: Number(w.length)
        }));
        postTokens.value = data.tokens;

        isPosted.value = true;
      }
    });

    watchEffect(async () => {
      if (isPosted.value && postWordAlignment.value.length > 0) {
        const src = props.modelName.split("E")[0];
        const trg = src === "mandarin" ? "taigi" : "mandarin";
        const text = postWordAlignment.value
          .map(word => word.word.replace(/<|>/, ""))
          .join(" ");

        const translatedText = (
          await axios.post("https://140.109.16.218:8080/translate", {
            src,
            trg,
            text
          })
        ).data.result as string;

        translateWordAlignment.value = translatedText.split(" ").map(s => ({
          word: s
        }));

        isTranslated.value = true;
      }
    });
    return {
      props,
      emit,
      startTimeCode,
      lengthCode,
      isPosted,
      postWordAlignment,
      postTokens,
      isTranslated,
      translateWordAlignment
    };
  }
});
</script>
