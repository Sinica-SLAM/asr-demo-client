<template>
  <div :class="`result-sub-segment ${props.type}`">
    <div class="status-container">
      <div>{{ props.type.toUpperCase() }}</div>
    </div>
    <div
      class="text-container"
      v-if="!props.wordAlignment || props.wordAlignment.length === 0"
    >
      {{ props.text }}
    </div>
    <div class="text-container" v-else>
      <ResultSegmentWord
        v-for="(alignment, i) in wordAlignment"
        :key="alignment.word + i + props.type"
        :word="alignment"
        :start="props.segmentStart.getTime() / 1000 + alignment.start"
        :candidates="
          props.candidatesMap
            ? props.candidatesMap.get(alignment.start)
            : undefined
        "
        :tokens="alignment.token ? alignment.token.split('-') : undefined"
        @click="canPlay ? (v) => emit('wordClicked', v) : () => {}"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { PropType, defineComponent } from "@vue/runtime-core";
import { WordAlignment } from "@/utils/dictate";
import { Candidate } from "@/utils/candidates";
import ResultSegmentWord from "@/components/home/AsrDemoCard/ResultArea/ResultSegment/ResultSegmentWord.vue";
import "@/assets/scss/components/home/AsrDemoCard/ResultArea/ResultSegment/result-sub-segment.scss";
export default defineComponent({
  name: "ResultSubSegment",
  emits: {
    wordClicked(payload: { start: number; length: number }) {
      return payload.start >= 0 && payload.length >= 0;
    },
  },
  components: { ResultSegmentWord },
  props: {
    text: {
      type: String,
      required: false,
    },
    wordAlignment: {
      type: Array as PropType<Array<WordAlignment>>,
      required: false,
    },
    candidatesMap: {
      type: Map as PropType<Map<number, Candidate[]>>,
      required: false,
    },
    type: {
      // p r t
      type: String,
      required: true,
    },
    segmentStart: {
      type: Date as PropType<Date>,
      required: true,
    },
    canPlay: {
      type: Boolean,
      required: false,
    },
  },
  setup(props, { emit }) {
    return { props, emit };
  },
});
</script>
