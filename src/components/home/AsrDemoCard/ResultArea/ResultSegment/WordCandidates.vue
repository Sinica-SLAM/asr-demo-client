<template>
  <div
    :class="[
      'candidates-container',
      clipped ? 'candidates-container-down' : 'candidates-container-up',
    ]"
    ref="candidatesContainer"
  >
    <div
      class="candidate"
      v-for="(candidate, i) in props.candidates"
      :key="'candidate' + i"
    >
      <div class="candidate-word">{{ candidate.word }}</div>
      <div>{{ candidate.confidence.toFixed(2) }}</div>
    </div>
    <span class="candidates-container-arrow"></span>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType, ref, Ref, watchEffect } from "vue";
import { Candidate } from "@/utils/candidates";
import "@/assets/scss/components/home/AsrDemoCard/ResultArea/ResultSegment/word-candidates.scss";
export default defineComponent({
  name: "WordCandidates",
  props: {
    candidates: { type: Array as PropType<Array<Candidate>>, required: true },
  },
  setup(props) {
    const candidatesContainer: Ref<HTMLDivElement | undefined> = ref();
    const clipped = ref(false);
    watchEffect(
      () => {
        if (clipped.value) {
          return;
        }

        clipped.value =
          (candidatesContainer.value?.parentNode?.parentNode?.parentNode
            ?.parentNode as HTMLDivElement).offsetTop >
          (candidatesContainer.value?.offsetTop ?? 0) +
            (candidatesContainer.value?.parentNode as HTMLDivElement).offsetTop;
      },
      {
        flush: "post",
      }
    );

    return { props, candidatesContainer, clipped };
  },
});
</script>
