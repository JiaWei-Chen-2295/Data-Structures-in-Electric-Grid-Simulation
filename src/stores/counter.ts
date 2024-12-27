import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCompletePercentStore = defineStore('globalgraph', () => {
  const percent = ref(0.0)

  function setPercent(per: number) {
    percent.value = per;
  }

  function getPercent() {
    return percent.value;
  }

  return { percent, setPercent, getPercent }
})
