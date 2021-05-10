<template>
  <div class="result-area" ref="resultArea">
    <ResultSegment
      v-for="(segment, index) in props.segments"
      :key="'result-' + index"
      :id="segment.id"
      :rText="segment.text"
      :segmentStart="segment.segmentStart"
      :segmentLength="segment.segmentLength"
      :rWordAlignment="segment.wordAlignment"
      :completed="segment.completed"
      :rCandidatesMap="segment.candidatesMap"
      @wordClicked="(v) => emit('wordClicked', v)"
      :modelName="props.modelName"
    />
  </div>
</template>
<script lang="ts">
import {
  defineAsyncComponent,
  defineComponent,
  PropType,
  ref,
  watch,
} from "vue";
import { Segment } from "@/components/home/AsrDemoCard/asrDemoCard";
import "@/assets/scss/components/home/AsrDemoCard/ResultArea/result-area.scss";

const ResultSegment = defineAsyncComponent(() =>
  import(
    "@/components/home/AsrDemoCard/ResultArea/ResultSegment/ResultSegment.vue"
  )
);

export default defineComponent({
  components: { ResultSegment },
  emits: {
    wordClicked(payload: { start: number; length: number }) {
      return payload.start >= 0 && payload.length >= 0;
    },
  },
  props: {
    segments: {
      type: Array as PropType<Segment[]>,
      required: true,
    },
    modelName: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const resultArea = ref<HTMLDivElement>();
    watch(
      () => {
        if (props.segments.length > 0) {
          return [
            props.segments.length,
            props.segments[props.segments.length - 1].text,
          ];
        }
        return props.segments.length;
      },
      () => {
        if (resultArea.value) {
          if (resultArea.value.scrollHeight > resultArea.value.clientHeight) {
            resultArea.value.scrollTop = resultArea.value.scrollHeight;
          }
        }
      },
      { deep: true }
    );
    return {
      resultArea,
      emit,
      props,
    };
  },
});
</script>
