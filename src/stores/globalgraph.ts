import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { JCGraph } from "@/JCGraph";

export const useGlobalJCGraphStore = defineStore('globalJCGraph', () => {
    const globalJCGraph = ref<JCGraph>({})

    const haveGraph = computed(() => {
        return globalJCGraph.value.graph.length !== 0 || globalJCGraph.value.locationInfo.length !== 0;
    })

    function setGraph(graph: JCGraph) {
        globalJCGraph.value = graph;
    }

    function getGraph() {
        return globalJCGraph.value;
    }


    return { globalJCGraph, setGraph, getGraph, haveGraph }
})
