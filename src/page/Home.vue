<template>
  <div id="home" class="page-container">
    <h1>SinicaASR 中研院語音辨識系統</h1>
    <div id="controller-container">
      <select v-model="settingStore.asrKind" @change="selectOnChange">
        <option
          v-for="model in defaultOption.models"
          :key="model.name"
          :value="model.name"
        >
          {{ model.displayName }}
        </option>
      </select>
      <button
        @click="
          () => {
            mainResultStore.setType('realtime');
            mainResultStore.startReadTimeRecognition();
          }
        "
      >
        即時
      </button>
      <button @click="() => fileInput?.click()">
        上傳
        <input
          ref="fileInput"
          accept="audio/wav,audio/mpeg3,audio/mp4,video/mp4,audio/m4a,audio/mpeg"
          type="file"
          @change="
            (e) => {
              mainResultStore.setType('upload');
              mainResultStore.startUploadRecognition(e.target.files[0]);
            }
          "
        />
      </button>
      <YoutubeDialog />
    </div>

    <AsrDemoCard v-if="mainResultStore.getType !== 'youtube'" />
    <YoutubeIframe v-else :vid="mainResultStore.getVid" />
    <div class="footer">
      <a href="http://slam.iis.sinica.edu.tw">語音、語言暨音樂處理實驗室</a>，<a
        href="https://www.iis.sinica.edu.tw/zh/index.html"
        >中央研究院資訊科學研究所</a
      >
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, watch } from "vue";
import AsrDemoCard from "@/components/home/AsrDemoCard/AsrDemoCard.vue";
import leftArrowSvg from "@/assets/svg/left-arrow.svg";
import rightArrowSvg from "@/assets/svg/right-arrow.svg";

import "@/assets/scss/pages/home.scss";
import { useSettingStore } from "@/store/modules/settingStore";
import YoutubeDialog from "@/components/home/YoutubeDialog";
import { useMainResultStore } from "@/store/modules/mainResultStore";
import YoutubeIframe from "@/components/home/YoutubeIframe/YoutubeIframe.vue";

export default defineComponent({
  name: "Home",
  components: {
    YoutubeDialog,
    AsrDemoCard,
    YoutubeIframe,
  },
  setup() {
    const defaultOption = {
      models: [
        {
          langKind: "Mandarin",
          name: "sa_me_2.0",
          displayName: "【華語】sa_me_2.0",
        },
        {
          langKind: "Taibun",
          name: "sa_te_1.0",
          displayName: "【臺語】sa_te_1.0",
        },
        {
          langKind: "Other",
          name: "sa_me_2.0+kenkone",
          displayName: "【康統】sa_me_2.0+kenkone",
        },
        {
          langKind: "Other",
          name: "sa_me_2.0+vgh",
          displayName: "【榮總】sa_me_2.0+vgh",
        },
      ],
    };
    const settingStore = useSettingStore();
    const mainResultStore = useMainResultStore();
    const fileInput = (ref < HTMLInputElement) | (null > null);

    const selectOnChange = (e) => {
      const model = defaultOption.models.find(
        (model) => model.name === e.target.value
      );
      if (model) {
        settingStore.langKind = model.langKind;
        settingStore.displayName = model.displayName;
        console.log(settingStore.langKind);
      }
    };

    return {
      selectOnChange,
      defaultOption,
      settingStore,
      leftArrowSvg,
      rightArrowSvg,
      mainResultStore,
      fileInput,
    };
  },
});
</script>
