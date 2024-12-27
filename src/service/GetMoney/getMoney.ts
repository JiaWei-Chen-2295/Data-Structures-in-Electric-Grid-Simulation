/**
 * @file getMoney.ts
 * @description 获取两点之间修建电网的价格
 * @author 陈佳玮
 */
import axiosSpecial from "@/plugins/axios-special";
import type {JCLocation} from "@/location";

// 获取每公里修建电网的价格(万元)
const MONEY_PER_KM = 3;

/**
 * 获取两点之间的修电网的价格
 * @param fromLocation
 * @param toLocation
 */
export async function getMoneyBetweenLocations(fromLocation: JCLocation,toLocation: JCLocation):number {

    let postInfo = {
        orig: fromLocation.lonlat,
        dest: toLocation.lonlat,
        style: 1
    };

    const postStr = JSON.stringify(postInfo);
    let resultRespStr = '';
    try {
        const response = await axiosSpecial.get('drive', {
            params: {
                postStr,
                type: 'search'
            }
        });
        resultRespStr = response.data;
    } catch (error) {
        console.error('Error fetching driving distance:', error);
        throw error;
    }
    return parseResult(resultRespStr);
}

function parseResult(result: string): number {
    if (result === '') {
        console.log('result is empty')
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(result, "application/xml");
    let duration = doc.getElementsByTagName('duration')[0].innerHTML;
    let distance = doc.getElementsByTagName('distance')[0].innerHTML;
    return parseInt(distance) * MONEY_PER_KM + parseInt(duration);
}
