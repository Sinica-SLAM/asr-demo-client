<template>
  <DialogBox>
    <template #activator="{active}">
      <button :disabled="props.disabled" @click="active">YouTube</button>
    </template>
    <template #default="{inactive}">
      <div class="youtube-dialog-content">
        <div>輸入影片網址：</div>
        <input v-model="vid" placeholder="https://www.youtube.com/watch?v=hhrur8WZjGo" />
        <button
          @click="
            () => {
              mainResultStore.setType('youtube');
              mainResultStore.startYoutubeRecognition(vid);
              inactive();
            }
          "
        >
          Submit
        </button>
      </div>
    </template>
  </DialogBox>
</template>

<script lang="ts">
import DialogBox from "@/components/shared/DialogBox.vue";
import { defineComponent } from "vue";
import "@/assets/scss/components/home/youtube-dialog.scss";
import { ref } from "vue";
import { useMainResultStore } from "@/store/modules/mainResultStore";

export default defineComponent({
  name: "YoutubeDialog",
  components: {
    DialogBox,
  },
  props: {
    disabled: {
      type: Boolean,
      required: false,
    },
  },
  setup(props) {
    const vid = ref("https://www.youtube.com/watch?v=hhrur8WZjGo");
    const mainResultStore = useMainResultStore();
    return {
      props,
      vid,
      mainResultStore,
    };
  },
});
</script>
