<template>
  <div class="result-area" ref="resultArea">
    <ResultSegment
        v-for="(_, index) in mainResultStore.segments"
        :key="'result-' + index"
        :index="index"
    />
    <ResultSegment
        v-if="mainResultStore.tempText.length > 0"
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
  setup() {
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
      mainResultStore,
    };
  },
});
</script>
