<template>
  <div class="dialog-box">
    <slot :active="()=>isActive = true" name="activator"></slot>
    <div :class="{
      'content-container':true,
      display:isActive
    }">
      <slot :inactive="()=>isActive = false"></slot>
    </div>
    <div :class="{overlay:true,display:isActive}" @click="()=>isActive=false"/>
  </div>
</template>
<script lang="ts">
import {defineComponent} from "vue";
import {ref} from "vue";
import "@/assets/scss/components/shared/dialog-box.scss"

export default defineComponent({
  name: "DialogBox",
  setup() {
    const isActive = ref(false)
    return {isActive}
  }
})
</script>