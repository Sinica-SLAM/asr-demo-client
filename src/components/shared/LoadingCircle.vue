<template>
  <div class="lds-ring">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import "@/assets/scss/components/shared/loading-circle.scss"

export default defineComponent({
  name: "LoadingCircle",
  setup() {
    return {}
  }
})
</script>

<style scoped>

</style>