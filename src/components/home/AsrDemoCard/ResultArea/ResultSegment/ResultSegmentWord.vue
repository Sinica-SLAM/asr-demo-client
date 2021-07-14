<template>
  <span
      class="word-container underline"
      @click="
      (e) => {
        e.preventDefault();
        emit('click', {
          start: props.alignment.start*1000,
          length: props.alignment.length*1000,
        });
      }
    "
      @mouseout="() => (hover = false)"
      @mouseover="() =>(hover = true)"
  >
    <ruby
        v-for="(char, charIndex) in props.alignment.word"
        :key="props.alignment.start + char"
    >
      {{ char }}
      <rp>(</rp>
      <rt>{{ tokens.length > charIndex ? tokens[charIndex] : undefined }}</rt>
      <rp>)</rp>
    </ruby>
    <WordCandidates
        v-if="hover && props.alignment.candidates"
        :candidates="props.alignment.candidates"
    />
  </span>
</template>
<script lang="ts">

import {WordAlignment} from "@/utils/dictate";
import {computed, defineComponent, PropType, ref} from "vue";
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
    alignment: {
      type: Object as PropType<WordAlignment>,
      required: true,
    },
  },
  setup(props, {emit}) {
    const hover = ref(false);
    const tokens = computed(() => (props.alignment.token ?? "").split("-"))
    return {props, emit, hover, tokens};
  },
});
</script>
