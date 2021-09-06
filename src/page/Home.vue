<template>
  <div id="home" class="page-container">
    <div id="controller-container">
      <select v-model="settingStore.langKind">
        <option
            v-for="lang in ['Mandarin', 'Taibun', 'Tailo']"
            :key="lang"
            :value="lang"
        >
          {{ lang }}
        </option>
      </select>
      <select v-model="settingStore.asrKind">
        <option
            v-for="model in defaultOption.models.filter((m)=>(m.langKind === settingStore.langKind))"
            :key="model.name"
            :value="model.name"
        >
          {{ model.name }}
        </option>
      </select>
      <StartASRDialog :disabled="mainResultStore.getRecognizing"/>
      <button disabled>
        History
      </button>
    </div>

    <AsrDemoCard/>
  </div>
</template>

<script>
import {defineComponent, watch} from "vue";
import AsrDemoCard from "@/components/home/AsrDemoCard/AsrDemoCard.vue";
import leftArrowSvg from "@/assets/svg/left-arrow.svg";
import rightArrowSvg from "@/assets/svg/right-arrow.svg";

import "@/assets/scss/pages/home.scss";
import {useSettingStore} from "@/store/modules/settingStore";
import StartASRDialog from "@/components/home/StartASRDialog";
import {useMainResultStore} from "@/store/modules/mainResultStore";

export default defineComponent({
  name: "Home",
  components: {
    StartASRDialog,
    AsrDemoCard,
  },
  setup() {
    const defaultOption = {
      models: [
        {
          langKind: "Mandarin", name: "formospeech_me_1",
        },
        {
          langKind: "Tailo", name: "tailo_0630"
        },
        {
          langKind: "Taibun", name: "tailo_0630_taibun"
        },
        {langKind: "Mandarin", name: "kenkone"}
      ],
    };
    const settingStore = useSettingStore()
    const mainResultStore = useMainResultStore()
    watch(() => settingStore.getLangKind, (langKind, prevLangKind) => {
      if (langKind === prevLangKind) {
        return
      }

      const langModels = defaultOption.models.filter((model) => model.langKind === langKind)

      if (langModels.length === 0) {
        return
      }

      settingStore.asrKind = langModels[0].name
    })


    return {defaultOption, settingStore, leftArrowSvg, rightArrowSvg, mainResultStore};
  },
});
</script>
