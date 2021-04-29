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
          {{ model.displayName }}
        </option>
      </select>
    </div>
    <AsrDemo :port="asrType.port" :modelName="asrType.name" />
  </div>
</template>

<script>
import { defineComponent, reactive, watchEffect } from "vue";
import AsrDemo from "@/components/home/AsrDemoCard/AsrDemoCard.vue";

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
        {
          displayName: "mandarinE_16k",
          name: "mandarinE",
          port: 8888,
        },
        {
          displayName: "taigiE_fsr",
          name: "taigiE_fsr",
          port: 8889,
        },
      ],
    };

    const asrType = reactive({
      port: 8888,
      name: "mandarinE",
      displayName: "mandarinE_16k",
    });

    watchEffect(() => {
      asrType.name = defaultOption.models.find(
        (m) => m.port === asrType.port
      ).name;
    });

    return { defaultOption, asrType };
  },
});
</script>
