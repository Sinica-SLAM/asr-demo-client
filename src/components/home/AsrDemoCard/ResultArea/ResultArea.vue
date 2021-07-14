<template>
  <div class="result-area" ref="resultArea">
    <ResultSegment
        v-for="(_, index) in mainResultStore.segments"
        :key="'result-' + index"
        :index="index"
        :modelName="props.modelName"
        @wordClicked="(v) => emit('wordClicked', v)"
    />
    <ResultSegment
        v-if="mainResultStore.tempText.length > 0"
        :modelName="props.modelName"
        :text="mainResultStore.tempText"
    />
  </div>
</template>
<script lang="ts">
import {defineComponent, ref, watch,} from "vue";
import "@/assets/scss/components/home/AsrDemoCard/ResultArea/result-area.scss";
import {useMainResultStore} from "@/store/modules/mainResultStore";
import ResultSegment from "@/components/home/AsrDemoCard/ResultArea/ResultSegment/ResultSegment.vue"
// const ResultSegment = defineAsyncComponent(() =>
//   import(
//     "@/components/home/AsrDemoCard/ResultArea/ResultSegment/ResultSegment.vue"
//   )
// );

export default defineComponent({
  components: {ResultSegment},
  emits: {
    wordClicked(payload: { start: number; length: number }) {
      return payload.start >= 0 && payload.length >= 0;
    },
  },
  props: {
    modelName: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const resultArea = ref<HTMLDivElement>();
    const mainResultStore = useMainResultStore()
    watch(
        mainResultStore.$state,
        () => {
          if (resultArea.value) {
            if (resultArea.value.scrollHeight > resultArea.value.clientHeight) {
              resultArea.value.scrollTop = resultArea.value.scrollHeight;
            }
          }
        },
        {deep: true}
    );
    return {
      resultArea,
      emit,
      props,
      mainResultStore,
    };
  },
});
</script>
