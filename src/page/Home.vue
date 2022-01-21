<template>
  <div id="home" class="page-container">
    <h1>Sinica 中研院語音辨識系統</h1>
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
        即時辨識
      </button>
      <button @click="() => fileInput?.click()">
        上傳音檔
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
      Copyright © <a href="http://slam.iis.sinica.edu.tw">SLAM</a> Lab. All
      rights reserved.
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
          displayName: "[華語] sa_me_2.0",
        },
        {
          langKind: "Taibun",
          name: "sa_te_1.0",
          displayName: "[臺語] sa_te_1.0",
        },
      ],
    };
    const settingStore = useSettingStore();
    const mainResultStore = useMainResultStore();
    const fileInput = (ref < HTMLInputElement) | (null > null);
    watch(
      () => settingStore.getLangKind,
      (langKind, prevLangKind) => {
        if (langKind === prevLangKind) {
          return;
        }

        const langModels = defaultOption.models.filter(
          (model) => model.langKind === langKind
        );

        if (langModels.length === 0) {
          return;
        }

        settingStore.asrKind = langModels[0].name;
      }
    );

    const selectOnChange = (e) => {
      const model = defaultOption.models.find(
        (model) => model.name === e.target.value
      );
      if (model) {
        settingStore.langKind = model.langKind;
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
