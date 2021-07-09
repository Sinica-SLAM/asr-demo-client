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
      <select v-model="asrType.port">
        <option
          v-for="model in defaultOption.models"
          :key="model.port"
          :value="model.port"
        >
          {{ model.name }}
        </option>
      </select>
    </div>

    <AsrDemo :port="asrType.port" :modelName="asrType.name" />
  </div>
</template>

<script>
import { defineComponent, reactive, watchEffect } from "vue";
import AsrDemo from "@/components/home/AsrDemoCard/AsrDemoCard.vue";
import leftArrowSvg from "@/assets/svg/left-arrow.svg";
import rightArrowSvg from "@/assets/svg/right-arrow.svg";

import "@/assets/scss/pages/home.scss";
export default defineComponent({
  name: "Home",
  components: {
    AsrDemo,
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
        { name: "tailo_0630", port: 8890 },
      ],
    };

    const asrType = reactive({
      port: 8890,
      name: "tailo_0630",
    });

    watchEffect(() => {
      asrType.name = defaultOption.models.find(
        (m) => m.port === asrType.port
      ).name;
    });

    return { defaultOption, asrType, leftArrowSvg, rightArrowSvg };
  },
});
</script>
