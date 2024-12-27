import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';

import App from './App.vue'
import router from './router'

const app = createApp(App)

import VueAMap, {initAMapApiLoader} from '@vuemap/vue-amap';
// import VueAMapLoca from '@vuemap/vue-amap-loca';
// import VueAMapExtra from '@vuemap/vue-amap-extra';
import '@vuemap/vue-amap/dist/style.css'
import { MAP_API_KEY, MAP_SECURITY_KEY } from './config/map-api-key';
initAMapApiLoader({
    key: MAP_API_KEY,
    securityJsCode: MAP_SECURITY_KEY, // 新版key需要配合安全密钥使用
    //Loca:{
    //  version: '2.0.0'
    //} // 如果需要使用loca组件库，需要加载Loca
})


app.use(createPinia())
app.use(router)
app.use(Antd);
app.use(VueAMap)

app.mount('#app')
