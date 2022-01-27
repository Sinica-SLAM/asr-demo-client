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
      <button
        onclick="window.location.href = 'https://sinica-slam.notion.site/SinicaASR-APIs-9cb1ac1f0c254adca6fc54f86b566131'"  
      >
        API
      </button>
    </div>

    <AsrDemoCard v-if="mainResultStore.getType !== 'youtube'" />
    <YoutubeIframe v-else :vid="mainResultStore.getVid" />
    <div class="footer">
      <p>
        李鴻欣博士 (Dr. Hung-Shin Lee) 
        <a href="mailto:hungshinlee@gmail.com">📧</a> &emsp;|&emsp;
        <a href="https://jamfly.github.io"> 鄭耀飛 (Yao-Fei Cheng) </a> 
        <a href="mailto:freddy@iis.sinica.edu.tw">📧</a> &emsp;|&emsp;
        <a href="https://github.com/txya900619">陳力瑋 (Li-Wei Chen) </a>
        <a href="wayne900619@gmail.com">📧</a>
        <br>
        <a href="https://homepage.iis.sinica.edu.tw/pages/whm/index_zh.html"> 王新民研究員 (Dr. Hsin-Min Wang) </a>
        <a href="mailto:whm@iis.sinica.edu.tw">📧</a> &emsp;|&emsp;
        <a href="https://homepage.iis.sinica.edu.tw/pages/mtko/index_zh.html"> 高明達研究員 (Dr. Ming-Tat Ko) </a>
        <a href="mailto:mtko@iis.sinica.edu.tw">📧</a> &emsp;|&emsp;
        <a href="http://slam.iis.sinica.edu.tw">
          語音、語言暨音樂處理實驗室 (Speech, Language and Music Processing Lab)
        </a>
      </p>  
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";
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
