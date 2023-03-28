<template>
  <iframe
    width="80%"
    height="70%"
    :src="`https://www.youtube.com/embed/${props.vid}?cc_load_policy=1`"
    title="YouTube video player"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
    v-if="props.vid"
  />
  <LoadingCircle v-else />
</template>

<script lang="ts">
import "@/assets/scss/components/home/YoutubeIframe/youtube-iframe.scss";
import { computed, defineComponent } from "vue";
import LoadingCircle from "@/components/shared/LoadingCircle.vue";

export default defineComponent({
  name: "YoutubeIframe",
  components: { LoadingCircle },
  props: {
    vid: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    return {
      props,
    };
  },
});
</script>
