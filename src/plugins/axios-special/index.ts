import { TDT_API_KEY } from "@/config/map-api-key";
import axios from "axios";

const axiosSpecial = axios.create({
    baseURL: 'http://api.tianditu.gov.cn/',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json;charset=UTF-8'
    }
})

// 添加请求拦截器
axiosSpecial.interceptors.request.use(function (config) {
    // 在发送请求前为请求体添加 key
    config.params.tk = TDT_API_KEY
    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});

// 添加响应拦截器
axiosSpecial.interceptors.response.use(function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    return response;
}, async error => {
    const maxRetries = 3; // 最大重试次数
    const retryCount = error.config.retryCount || 0;

    if (retryCount >= maxRetries) {
        return Promise.reject(error);
    }

    error.config.retryCount = retryCount + 1;

    // 延时重试
    const backoff = new Promise(resolve => {
        setTimeout(() => {
            resolve(null);
        }, 1000 * Math.pow(2, retryCount)); // 指数退避
    });

    return backoff.then(() => {
        return axiosSpecial(error.config);
    });
});


export default axiosSpecial;
