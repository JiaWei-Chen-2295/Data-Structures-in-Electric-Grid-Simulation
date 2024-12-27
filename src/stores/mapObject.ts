import {defineStore} from "pinia";

export const useMapObject = defineStore('mapObject', {
    state: () => ({
        mapObject: null
    }),
    actions: {
        setMapObject(mapObject) {
            this.mapObject = mapObject
        },
        getMapObject() {
            return this.mapObject
        }
    }
})
