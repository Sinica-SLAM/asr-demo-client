<template>
  <span
    class="word-container underline"
    @click="
      (e) => {
        e.preventDefault();
        emit('click', {
          start: props.start,
          length: props.word.length,
        });
      }
    "
    @mouseover="() => (hover = true)"
    @mouseout="() => (hover = false)"
  >
    <ruby
      v-for="(char, charIndex) in props.word.word"
      :key="props.start + char"
    >
      {{ char }}
      <rp>(</rp>
      <rt>{{ props.tokens ? props.tokens[charIndex] : "" }}</rt>
      <rp>)</rp>
    </ruby>
    <WordCandidates
      v-if="hover && props.candidates"
      :candidates="props.candidates"
    />
  </span>
</template>
<script lang="ts">
import { WordAlignment } from "@/utils/dictate";
import { defineComponent, PropType, ref } from "vue";
import "@/assets/scss/components/home/AsrDemoCard/ResultArea/ResultSegment/result-segment-word.scss";
import WordCandidates from "./WordCandidates.vue";

export default defineComponent({
  name: "ResultSegmentWord",
  components: {
    WordCandidates,
  },
  emits: {
    click(payload: { start: number; length: number }) {
      return payload.start >= 0 && payload.length >= 0;
    },
  },
  props: {
    start: {
      type: Number, // second
      required: true,
    },
    word: {
      type: Object as PropType<WordAlignment>,
      required: true,
    },
    tokens: {
      type: Array as PropType<Array<string>>,
      required: false,
    },
    candidates: {
      type: Array as PropType<Array<string>>,
      required: false,
    },
  },
  setup(props, { emit }) {
    const hover = ref(false);

    return { props, emit, hover };
  },
});
</script>
