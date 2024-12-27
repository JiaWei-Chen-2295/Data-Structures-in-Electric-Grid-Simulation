<script setup lang="ts">

import BasicLayout from "@/layouts/basicLayout.vue";
import {theme} from "ant-design-vue";

</script>

<template>
  <a-config-provider
      :theme="{
      token: {
        colorPrimary: '#7E57C2',
      },
    }"
  >
    <basic-layout>
      <template #content>
        <router-view></router-view>
      </template>
    </basic-layout>
  </a-config-provider>

</template>


<style scoped>

basic-layout {
  height: 1vw;
  width: 100%;
}
</style>
