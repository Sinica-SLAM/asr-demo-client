<template>
  <div id="home" class="page-container">
    <div id="select-container">
      <!-- <select v-model="asrType.language">
        <option
          v-for="language in defaultOption.languages"
          :key="language.name"
          :value="language.name"
        >
          {{ language.name }}
        </option>
      </select> -->
      <!-- <select v-model="asrType.port">
        <option v-for="model in models" :key="model.name" :value="model.port">
          {{ model.name }}
        </option>
      </select> -->
      <select v-model="settingStore.modulePort">
        <option
            v-for="model in defaultOption.models"
            :key="model.port"
            :value="model.port"
        >
          {{ model.name }}
        </option>
      </select>
    </div>

    <AsrDemoCard/>
  </div>
</template>

<script>
import {defineComponent} from "vue";
import AsrDemoCard from "@/components/home/AsrDemoCard/AsrDemoCard.vue";
import leftArrowSvg from "@/assets/svg/left-arrow.svg";
import rightArrowSvg from "@/assets/svg/right-arrow.svg";

import "@/assets/scss/pages/home.scss";
import {useSettingStore} from "@/store/modules/settingStore";

export default defineComponent({
  name: "Home",
  components: {
    AsrDemoCard,
  },
  setup() {
    //data from backend
    // const defaultOption = {
    //   languages: [
    //     {
    //       name: "chinese",
    //       models: [
    //         {
    //           name: "mandarinE",
    //           port: 8888,
    //         },
    //       ],
    //     },
    //   ],
    // };
    const defaultOption = {
      models: [
        // {
        //   name: "mandarinE_16k",
        //   port: 8888,
        // },
        // {
        //   name: "taigiE_fsr",
        //   port: 8889,
        // },
        {name: "tailo_0630", port: 8890},
      ],
    };
    const settingStore = useSettingStore()

    return {defaultOption, settingStore, leftArrowSvg, rightArrowSvg};
  },
});
</script>
