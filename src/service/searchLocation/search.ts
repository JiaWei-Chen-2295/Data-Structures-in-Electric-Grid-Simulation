/**
 * @file search.ts
 * @description 搜索地点的服务
 * @author 陈佳玮
 */
import axiosSpecial from "@/plugins/axios-special";

// 小区和住宅楼
const POI: string[] = [
    '120201', '120202'
];


export const searchTips = (keywords: string) => {
    console.log('keywords', keywords)
    let postInfo = {
        keyWord: keywords,
            specify: 156140000,
            queryType: 3,
            queryRadius: 10000,
            pointLonlat :'112.707808, 37.750316',
            start: 0,
            count: 35
    };
    let postStr = JSON.stringify(postInfo);
    return axiosSpecial.get(
        'v2/search',
        {
            params: {
                postStr,
                type: 'query'
            }
        }
    ).then((resp)=> resp.data);
}
