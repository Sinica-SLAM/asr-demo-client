<template>
  <div class="result-segment">
    <div class="time-code-container">
      <div
        class="start-time-code"
        @click="
          (e) => {
            e.preventDefault();
            emit('wordClicked', {
              start: props.segmentStart.getTime() / 1000,
              length: props.segmentLength / 1000,
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
    <div class="status-container r">
      <div>R</div>
    </div>
    <div class="result-container">
      <div class="text-container" v-if="!props.completed">{{ props.text }}</div>
      <div class="text-container" v-else>
        <ResultSegmentWord
          v-for="(alignment, i) in props.wordAlignment"
          :key="alignment.word + i"
          :word="alignment"
          :segmentStart="props.segmentStart.getTime() / 1000"
          :candidates="props.candidatesMap.get(alignment.start)"
          @click="(v) => emit('wordClicked', v)"
        />
      </div>
      <div
        v-if="isRecognize && recongnizeWordAlignment.length > 0"
        class="post"
      >
        <div class="status-container post">
          <div>P</div>
        </div>
        <div class="text-container ">
          <ResultSegmentWord
            v-for="(alignment, i) in recongnizeWordAlignment"
            :key="alignment.word + i + 'r'"
            :word="alignment"
            :segmentStart="props.segmentStart.getTime() / 1000"
            :tokens="recongnizeTokens[i]"
            @click="(v) => emit('wordClicked', v)"
          />
        </div>
      </div>
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
  watchEffect,
} from "vue";

import Axios from "axios";

import "@/assets/scss/components/home/AsrDemoCard/ResultArea/result-segment.scss";
import { WordAlignment } from "@/utils/dictate";
import { timeFormat } from "@/utils/timeFormat";
import { Candidate } from "@/utils/candidates";
import ResultSegmentWord from "@/components/home/AsrDemoCard/ResultArea/ResultSegmentWord.vue";

export default defineComponent({
  name: "AsrDemoSegment",
  components: { ResultSegmentWord },
  emits: {
    wordClicked(payload: { start: number; length: number }) {
      return payload.start >= 0 && payload.length >= 0;
    },
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      required: true,
    },
    wordAlignment: {
      type: Array as PropType<Array<WordAlignment>>,
      required: true,
    },
    segmentStart: {
      type: Date as PropType<Date>,
      required: true,
    },
    segmentLength: {
      type: Number,
      required: true,
    },
    candidatesMap: {
      type: Map as PropType<Map<number, Candidate[]>>,
      required: true,
    },
    modelName: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const startTimeCode = computed(() => timeFormat(props.segmentStart));
    const lengthCode = computed(() =>
      timeFormat(new Date(props.segmentLength))
    );
    const isRecognize = ref(false);

    const recongnizeWordAlignment: Ref<WordAlignment[]> = ref([]);
    const recongnizeTokens: Ref<string[][]> = ref([]);

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
            length: props.segmentLength / 1000, //second
          })
        ).data;

        recongnizeWordAlignment.value = data.wordAlignments.map((w) => ({
          ...w,
          start: Number(w.start),
          length: Number(w.length),
        }));
        recongnizeTokens.value = data.tokens;

        isRecognize.value = true;
      }
    });
    return {
      props,
      startTimeCode,
      lengthCode,
      isRecognize,
      emit,
      recongnizeWordAlignment,
      recongnizeTokens,
    };
  },
});
</script>
