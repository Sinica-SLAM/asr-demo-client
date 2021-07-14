<template>
  <div :class="`result-sub-segment ${props.type}`">
    <div class="status-container">
      <div>{{ props.type.toUpperCase() }}</div>
    </div>
    <div
        v-if="text"
        class="text-container"
    >
      {{ props.text }}
    </div>
    <div class="text-container" v-else>
      <ResultSegmentWord
          v-for="(alignment, i) in wordAlignment ?? []"
          :key="alignment.word + i + props.type"
          :alignment="alignment"
          @click="(v) => {
            if(props.canPlay){
              emit('wordClicked', v)
            }}"
      />
    </div>
  </div>
</template>
<script lang="ts">
import {defineComponent} from "@vue/runtime-core";
import ResultSegmentWord from "@/components/home/AsrDemoCard/ResultArea/ResultSegment/ResultSegmentWord.vue";
import "@/assets/scss/components/home/AsrDemoCard/ResultArea/ResultSegment/result-sub-segment.scss";
import {computed, PropType} from "vue";
import {useMainResultStore} from "@/store/modules/mainResultStore";
import {usePostResultStore} from "@/store/modules/postResultStore";

export default defineComponent({
  name: "ResultSubSegment",
  emits: {
    wordClicked(payload: { start: number; length: number }) {
      return payload.start >= 0 && payload.length >= 0;
    },
  },
  components: {ResultSegmentWord},
  props: {
    index: {
      type: Number,
      required: false,
    },
    text: {
      type: String,
      required: false,
    },
    type: {
      // p r t
      type: String as PropType<"r" | "p" | "t">,
      required: true,
    },
    canPlay: {
      type: Boolean,
      required: false,
    },
  },
  setup(props, {emit}) {
    const wordAlignment = computed(() => {
      if (typeof props.index === "undefined") {
        return undefined
      }
      switch (props.type) {
        case "r":
          return useMainResultStore().segments[props.index].wordAlignment
        case "p":
          return usePostResultStore().wordAlignments[props.index]
        default:
          return useMainResultStore().segments[props.index].wordAlignment
      }
    })
    return {props, emit, wordAlignment, log: console.log};
  },
});
</script>
