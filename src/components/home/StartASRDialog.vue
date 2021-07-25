<template>
  <DialogBox>
    <template #activator="{active}">
      <button :disabled="props.disabled" @click="active">Start</button>
    </template>
    <template #default="{inactive}">
      <div class="start-asr-dialog-content">
        <div class="separated-card">
          <h1>即時辨識</h1>
          <p>
            運用所選 model 即時錄音並進行語音辨識，會即時的顯示出辨識結果並在稍後呈現較為準確的後辨識結果
          </p>
          <button @click="()=>{
          mainResultStore.setType('realtime')
          mainResultStore.startReadTimeRecognition()
          inactive()
        }">
            開始錄音
          </button>
        </div>
        <div class="vertical-separator"></div>
        <div class="separated-card">
          <h1>離線辨識</h1>
          <p>上傳你想辨識的音檔，並利用所選 model 進行辨識，與即是辨識一樣能夠在網頁上播放你上傳的音樂</p>
          <button @click="()=>fileInput?.click()">
            上傳音檔
          </button>
          <input ref="fileInput" accept="audio/wav" type="file" @change="(e)=>{
          mainResultStore.setType('upload')
          mainResultStore.startUploadRecognition( e.target.files[0])
          inactive()
        }">
        </div>
      </div>
    </template>
  </DialogBox>
</template>

<script lang="ts">
import DialogBox from "@/components/shared/DialogBox.vue";
import {defineComponent} from "@vue/runtime-core";
import "@/assets/scss/components/home/start-asr-dialog.scss"
import {ref} from "vue";
import {useMainResultStore} from "@/store/modules/mainResultStore";

export default defineComponent({
  name: "StartASRDialog",
  components: {
    DialogBox
  },
  props: {
    disabled: {
      type: Boolean,
      required: false,
    },
  },
  setup(props) {
    const fileInput = ref<HTMLInputElement | null>(null)
    const mainResultStore = useMainResultStore()
    return {
      props,
      fileInput,
      mainResultStore,
    }
  }
})
</script>

